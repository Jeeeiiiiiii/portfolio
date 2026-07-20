import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-14">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 flex flex-wrap items-center justify-between gap-4">
        <p className="micro">© {new Date().getFullYear()} steven carreon</p>
        <div className="flex gap-5">
          <a
            href="https://github.com/Jeeeiiiiiii"
            target="_blank"
            rel="noopener noreferrer"
            className="micro hover:text-ink transition-colors duration-200"
          >
            github ↗
          </a>
          <a
            href="https://www.linkedin.com/in/rjcarreon/"
            target="_blank"
            rel="noopener noreferrer"
            className="micro hover:text-ink transition-colors duration-200"
          >
            linkedin ↗
          </a>
          <a
            href="mailto:aurjei.steven.carreon@gmail.com"
            className="micro hover:text-ink transition-colors duration-200"
          >
            email ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
