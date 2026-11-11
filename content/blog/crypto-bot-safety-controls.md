---
title: "Trading platform notes: keeping bots isolated, stoppable and watched"
date: 2026-11-11
excerpt: Short notes from my trading-bot lab on the controls that matter most - bots that can't reach the internet, a broker where each bot only hears its own commands, secrets encrypted in Git, and a halt only a person can lift.
tags: [Crypto, Security, Kubernetes, GitOps]
featured: 5
---

*What you'll get: six controls from my trading platform, each with what it stops and the check that proves it.*

This is a companion to [My trading bot kept quoting on frozen prices](/blog/crypto-bot-frozen-prices). That post is about bad market data; this one is about the platform underneath. It runs two Hummingbot bots, an open-source trading bot, on a local Kubernetes cluster. Paper trading only: a mock exchange, no exchange accounts, no API keys, no real orders.

## 1. A bot can only reach two things

A trading bot holds the keys to an account, so it's the last thing you want talking to the whole network. Each bot pod has a NetworkPolicy that allows exactly two destinations: the exchange and the message broker.

Tested from inside a bot's pod: the exchange and the broker answered. The guard, Prometheus, the Kubernetes API and the internet did not.

In the Docker version, the bot runs on a network with no route out at all. It reaches the mock exchange under Binance's real hostnames, and it trusts only the lab's own certificate authority. The bot's image is unmodified.

## 2. Each bot only hears its own commands

Bots take commands over MQTT, a lightweight message broker. Without rules, any client could send any bot a `start`. The broker now requires a login, and each login has topic rules:

- A bot can use only its own topics. Logged in as bot-1, I saw nothing of bot-2, and a stop I sent to bot-2 was dropped.
- A bot can't read or clear its own halt notice.
- The guard can send `stop`, but not `start`.

## 3. A halt only a person can lift

When the guard halts a bot, three things make it stick:

1. It sends the bot's own stop command, which cancels open orders, and repeats it until acknowledged.
2. It records the halt somewhere the bot can read but not change: a file on Docker, a ConfigMap key on Kubernetes that only the guard may write.
3. The bot's startup check refuses to start while the halt exists.

On Kubernetes, a deleted halted pod came back, its startup check exited 3, and Hummingbot never started. A Flux sync while halted left the halt in place. Resuming needs a note, which is kept with the halt history, and the guard never resumes a bot on its own.

## 4. Secrets encrypted in Git, the webhook not at all

Flux deploys everything from Git. Bot passwords and broker logins are in Git too, encrypted with **SOPS** to an **age** key, and the cluster decrypts them on apply. Anyone reading the repo sees ciphertext.

The Slack webhook URL never enters Git, not even encrypted. A script gives it to the cluster directly.

The honest trade-off: everything is encrypted to one key. Losing it means regenerating every secret; leaking it exposes them all. In production that key belongs in a key management service.

## 5. Bots run with as little as possible

The Hummingbot image runs as root by default. On Kubernetes, the bots run as uid 1000 under the `restricted` Pod Security profile, with their writable folders as volumes. It took some setup: headless Hummingbot can't complete its own first run, so a small init step writes the files it expects.

## 6. Availability: who watches what

| Alert | Fires when |
|---|---|
| `GuardDown` | The guard can't be scraped for 30 s, so bots are unprotected |
| `HaltNotHolding` | A halted bot placed orders anyway |
| `HaltNotSaved` | A halt couldn't be saved, so a restart would put the bot back in the market |
| `StopNotAcknowledged` | A halted bot hasn't confirmed its stop in 30 s |
| `BotSilent` | A running bot has sent no heartbeat for 90 s |
| `MarketDataStale` | The guard's own feed has been silent for 40 s |

Flux also repairs drift: bot-2 scaled to 0 by hand was back to 1 at the next sync, and an order-size change in Git rolled out in 39 seconds with never more than one bot-2 pod.

## What's still missing

- **The broker has no TLS,** and bot passwords still end up in the bot's own config file.
- **One guard.** If it's down, there's only the `GuardDown` alert.
- **Nothing watches Prometheus and Alertmanager.** That needs a dead man's switch outside the stack.
- **The halt reaches a running pod 48 to 59 seconds late** on Kubernetes. Deleting the halted bot's pod would close that.
- **`docker stop` still kills the bot** without cancelling orders. A preStop hook that cancels first is next.

## Why this matters

With a trading bot, a security gap and a reliability gap end the same way: orders you didn't intend. Isolation limits what a bad bot can reach, and a halt that sticks limits how long it can do damage.
