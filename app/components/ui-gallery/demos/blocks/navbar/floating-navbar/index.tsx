"use client";

import { useState } from "react";
import { Command, Menu } from "lucide-react";

const links = ["Product", "Docs", "Changelog", "Pricing"];

export default function Demo() {
  const [active, setActive] = useState("Product");
  const [open, setOpen] = useState(false);

  return (
    <section className="bg-zinc-50 px-4 py-16 dark:bg-zinc-950 sm:px-6">
      <header className="mx-auto max-w-3xl">
        <nav
          aria-label="Primary"
          className="flex items-center justify-between gap-4 rounded-full border border-zinc-200 bg-white/80 p-2 pl-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/70"
        >
          <a href="#" className="flex shrink-0 items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-control bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              <Command className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
              Acme
            </span>
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <li key={link}>
                <button
                  type="button"
                  onClick={() => setActive(link)}
                  aria-current={active === link ? "page" : undefined}
                  className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                    active === link
                      ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-white"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  }`}
                >
                  {link}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href="#"
              className="hidden rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 sm:inline-flex"
            >
              Sign in
            </a>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="floating-navbar-menu"
              aria-label="Toggle menu"
              className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200 text-zinc-700 md:hidden dark:border-zinc-700 dark:text-zinc-200"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </nav>

        {open && (
          <ul
            id="floating-navbar-menu"
            className="mt-3 space-y-1 rounded-panel border border-zinc-200 bg-surface-0 p-2 md:hidden dark:border-zinc-800 dark:bg-zinc-900"
          >
            {links.map((link) => (
              <li key={link}>
                <button
                  type="button"
                  onClick={() => {
                    setActive(link);
                    setOpen(false);
                  }}
                  className="w-full rounded-item px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {link}
                </button>
              </li>
            ))}
          </ul>
        )}
      </header>
    </section>
  );
}
