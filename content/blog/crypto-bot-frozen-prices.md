---
title: My trading bot kept quoting on frozen prices, and never said a word
date: 2026-11-11
excerpt: I froze a trading bot's market data while the price fell 3%. It kept quoting around the old price, every quote on the wrong side of the market, and logged nothing. Here is the guard that now stops it, and why a halt has to survive a restart.
tags: [Crypto, SRE, Kubernetes, Reliability]
featured: 3
---

*What you'll get: why a trading bot can't be trusted to notice its own bad data, and how to stop it from the outside in a way that sticks.*

## The problem, in plain words

A **market-making bot** places a buy order a little below the current price and a sell order a little above it, and earns the gap when both fill. It replaces those orders every few seconds as the price moves. Everything depends on knowing the current price.

Prices arrive over a **WebSocket**, a connection that stays open and streams updates. I wanted to know what happens when that stream goes quiet, so I built a lab around **Hummingbot**, an open-source trading bot, and froze its feed on purpose. This is infrastructure around an existing open-source bot, not a trading strategy, and it's paper trading only: a mock exchange, no exchange accounts, no API keys, no real orders.

The result: when the feed froze while the price fell 3%, the bot kept quoting around the old price for the whole outage. Every buy order was above the real market. On a real exchange, each of those would have been filled instantly, at about 3% against the bot. It logged nothing.

## Why this is different

If you run services, you know health checks and restarts. A trading bot breaks both assumptions:

- **"Connected" isn't "healthy".** During the freeze the connection stayed up and answered pings. Nothing looked down.
- **The bot can't judge its own data.** If its view of the market is wrong, its checks are wrong too. Something outside has to compare it with the real market.
- **Restarting is dangerous.** A crashed web server should come back. A bot that was stopped for a reason should *not* come back on its own, because it starts trading again immediately.
- **Stopping isn't simple.** Killing the container left its orders on the exchange. A clean stop means cancelling orders first.

## The tools, and why each one

| What I need | Tool | Why this one | What I didn't pick |
|---|---|---|---|
| A real trading bot | Hummingbot | Open source, widely used, runs headless | My own bot: it would only fail in ways I expect |
| A market I can break | A mock exchange I wrote | Speaks Binance's market data API; freeze, drop, 429, hang on demand | Live Binance: I can't make it freeze |
| Stop a bot from outside | A guard service I wrote | Has its own feed and its own view of the price | Trusting the bot's own checks |
| Send it "stop" | Mosquitto (MQTT) | Hummingbot already listens for commands there | Killing the container: leaves orders behind |
| Alerts | Prometheus + Alertmanager → Slack | Same stack as my other platforms | — |
| Run two bots like production | kind, Flux, SOPS | GitOps with encrypted secrets | — |

## How the guard works

```text
mock exchange ── prices ──▶ bot (Hummingbot, paper trading)
      │                      │ orders (from its log)
      │ its own feed         ▼
      └──────────────────▶ guard ── halts on:
                             • 5 s with no market data
                             • an order more than 5 bps through the best price
                           │
                           ├─▶ MQTT "stop" (retried until acknowledged)
                           └─▶ halt file the bot can read but not change
```

1. **The guard subscribes to the market itself.** If it hears nothing for 5 seconds, it halts every bot on that market. That catches a freeze at the exchange.
2. **It also checks each new order against the real best price.** An order more than 5 basis points (0.05%) through the market means the bot's view is wrong, even if the exchange is fine.
3. **To halt, it sends the bot's own stop command** over MQTT, which cancels open orders, and repeats it until the bot acknowledges.
4. **It writes a halt file** into a folder the bot can only read. The bot's startup script refuses to start while that file exists.
5. **Only a person can resume,** and only with a note saying why it's safe. The note is kept with the halt.

## What broke, and how I fixed it

**A restarted bot went straight back to trading.** During validation, restarting a stopped bot put it back in the market. That's why the halt is a file outside the bot's control, not a flag in its memory.

**Killing the container left orders behind.** `docker stop` waited 10 seconds, then killed the bot (exit code 137). It never cancelled its orders. With real orders, those would sit on the exchange at stale prices. So halting goes through the bot's own stop command first.

**My first guard raised false alarms.** Two bugs showed up in the end-to-end alert test, both fixed with tests:

- The order logged in the same refresh as the one that *triggered* the halt was counted as "an order placed while halted", which would fire a false `HaltNotHolding`.
- A resumed bot was judged against its silence from *before* the halt, so it looked stuck while starting up.

**On Kubernetes, the halt arrives late.** There, the halt is a key in a ConfigMap. Kubernetes refreshes mounted ConfigMaps on its own schedule, so a running pod saw the halt 48 to 59 seconds later. The MQTT stop still works in the meantime, but if the bot crashed and restarted in that window, its startup check would pass. That gap is open, and the fix is for the guard to delete the halted bot's pod.

## Results

| Situation | Without the guard | With the guard |
|---|---|---|
| Feed freezes, price falls 3% | 5 of 5 quotes on the wrong side, worst 309 bps off | Halted after 5.1 s, stop acknowledged in 0.07 s, no quote crossed the market |
| Only the bot's feed freezes | — | Caught by the price check 14 s in, on an order 188 bps through the market |
| Halted bot restarted | Starts trading | Refuses to start (exit code 3) |
| Guard restarted | — | Still knows the bot is halted |

- Guard: 16 of 16 checks. Alerts: 10 of 10 end-to-end checks, with a halt reaching the stand-in Slack in 34 to 81 seconds.
- On kind with two bots: 20 of 20 checks. A freeze on one market halted only that bot; the other kept trading.

These are paper-trading results against a mock. The loss figures are estimates of what a real exchange would have filled.

## From the lab to a real environment

| In the lab | In production |
|---|---|
| Mock exchange, market data only | Real exchange; orders, balances and rate limits matter too |
| Price check reads the bot's log, after the order | A check in the order path, before the order leaves |
| One guard | Two guards, plus something watching the guard |
| Age key in a local file | A key management service, with rotation |

## FAQ

**Why not fix the bot instead?** I'd report it upstream, but the platform can't rely on every bot handling every failure. Independent checks are the point.

**Is 5 seconds the right threshold?** For a busy pair like ETH-USDT, yes. A quiet pair can go longer without an update, so it needs setting per market.

**Doesn't the guard halt bots for its own problems?** Yes, deliberately. If the guard loses its feed, every bot on that market halts, and `MarketDataStale` says the feed is the cause. Failing safe means a few minutes of no trading instead of trading blind.

## Why this matters

A bot quoting on stale prices loses money on every fill, quietly, until someone notices the balance. A guard that halts it in five seconds, and keeps it halted until a person says otherwise, turns that into an alert and a short pause.

## Links

- [Hummingbot](https://github.com/hummingbot/hummingbot), the open-source bot this is built around
- [How the trading platform is secured and kept available](/blog/crypto-bot-safety-controls)
- [Binance: how to manage a local order book correctly](https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#how-to-manage-a-local-order-book-correctly)
