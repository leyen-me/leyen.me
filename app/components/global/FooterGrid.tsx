import Link from "next/link";
import { socialLinks } from "../../data/social";
import UnmountStudio from "./Unmount";

export default function FooterGrid() {
  const navigation = [
    { title: "Home", href: "/" },
    { title: "Projects", href: "/projects" },
    { title: "Blog", href: "/blog" },
    { title: "Quotes", href: "/quotes" },
    { title: "Movies", href: "/movies" },
  ];

  const stack = [
    { title: "Next.js", href: "https://nextjs.org" },
    { title: "Sanity", href: "https://sanity.io" },
    { title: "Vercel", href: "https://vercel.com" },
  ];

  const socials = socialLinks
    .filter((item) => item.status === "social")
    .slice(0, 4);

  return (
    <UnmountStudio>
      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-40 relative print:hidden">
        <div className="max-w-7xl mx-auto md:px-16 px-6 py-10">
          <div className="grid gap-px rounded-[2rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-800">
            <div className="grid lg:grid-cols-[minmax(0,1.45fr),minmax(320px,0.95fr)] gap-px">
              <section className="relative overflow-hidden bg-white dark:bg-zinc-900 p-8 sm:p-10 lg:p-12 min-h-[420px] flex flex-col justify-between">
                <div className="pointer-events-none absolute -right-10 top-8 h-32 w-32 rounded-full border border-zinc-200 dark:border-zinc-700 opacity-70" />
                <div className="pointer-events-none absolute right-10 top-20 h-px w-24 bg-zinc-200 dark:bg-zinc-700 rotate-[-35deg]" />

                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 mb-6">
                    Experimental footer / selected projects
                  </p>
                  <h2 className="font-incognito text-4xl sm:text-5xl lg:text-6xl leading-[0.95] tracking-tight text-zinc-900 dark:text-white max-w-3xl">
                    Building calm, useful interfaces for the curious web.
                  </h2>
                  <p className="mt-6 max-w-xl text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                    A more structured ending for leyen.me, inspired by
                    experimental portfolio footers but tuned to stay quiet,
                    technical, and readable in both themes.
                  </p>
                </div>

                <div className="mt-10 flex flex-wrap gap-3">
                  {socials.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 hover:dark:text-white hover:border-zinc-400 hover:dark:border-zinc-500 duration-300"
                    >
                      <item.icon className="h-4 w-4 text-zinc-500 group-hover:text-current duration-300" />
                      {item.name}
                    </a>
                  ))}
                </div>
              </section>

              <div className="grid gap-px bg-zinc-200 dark:bg-zinc-800">
                <section className="bg-zinc-50 dark:bg-zinc-950/80 p-8">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 mb-5">
                    Explore
                  </p>
                  <ul className="space-y-3">
                    {navigation.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="inline-flex text-lg font-incognito text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 hover:dark:text-white duration-300"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="bg-zinc-50 dark:bg-zinc-950/80 p-8">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 mb-5">
                    Stack
                  </p>
                  <ul className="space-y-3">
                    {stack.map((item) => (
                      <li key={item.title}>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex text-sm text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 hover:dark:text-white duration-300"
                        >
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="bg-zinc-50 dark:bg-zinc-950/80 p-8">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 mb-5">
                    Status
                  </p>
                  <p className="font-incognito text-2xl text-zinc-900 dark:text-white">
                    Leyen.me is shipping quietly.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    Thoughts, projects, notes, and experiments with a little
                    more structure at the end of the page.
                  </p>
                </section>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-row flex-col items-start sm:items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-500 px-1 pt-4">
            <small>
              Copyright &copy; Leyen {new Date().getFullYear()} All rights
              reserved.
            </small>
            <p>Designed to feel a little more editorial, not just decorative.</p>
          </div>
        </div>
      </footer>
    </UnmountStudio>
  );
}
