"use client";
import { useEffect, useState } from 'react';

/**
 * Embeds an archify architecture page (a self-contained HTML file under
 * /public/diagrams) and keeps its theme in step with the site's .dark class.
 */
export default function DiagramFrame({ src, title }: { src: string; title: string }) {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const read = () => setTheme(root.classList.contains('dark') ? 'dark' : 'light');
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const url = theme ? `${src}?theme=${theme}` : null;

  return (
    <figure className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 shadow-[var(--shadow-card)]">
      <div className="relative h-[560px] sm:h-[640px]">
        {url ? (
          <iframe
            key={url}
            src={url}
            title={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="micro">loading diagram</span>
          </div>
        )}
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 py-2.5">
        <span className="micro">interactive — use the guided views, click a node to trace it</span>
        <a href={src} target="_blank" rel="noopener noreferrer" className="micro hover:text-ink transition-colors duration-200">
          open full page ↗
        </a>
      </figcaption>
    </figure>
  );
}
