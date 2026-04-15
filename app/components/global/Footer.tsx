import Image from "next/image";
import Link from "next/link";
import sanitylogo from "@/public/sanity.png";
import vercellogo from "@/public/vercel.svg";
import nextjslogo from "@/public/nextjs.svg";
import { socialLinks } from "../../data/social";
import UnmountStudio from "./Unmount";

export default function Footer() {
  const navigation = [
    { title: "Projects", href: "/projects" },
    { title: "Blog", href: "/blog" },
    { title: "Quotes", href: "/quotes" },
    { title: "Movies", href: "/movies" },
    { title: "Interviews", href: "/interviews" },
    { title: "Resume", href: "/resume" },
  ];

  const socials = socialLinks
    .filter((item) => item.status === "social")
    .slice(0, 4);

  const stack = [
    { title: "Sanity", href: "https://sanity.io", icon: sanitylogo, alt: "sanity logo" },
    { title: "Next.js", href: "https://nextjs.org", icon: nextjslogo, alt: "nextjs logo" },
    { title: "Vercel", href: "https://vercel.com", icon: vercellogo, alt: "vercel logo" },
  ];

  return (
    <UnmountStudio>
      <footer className="mt-40 print:hidden">
        <section className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 mt-24">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="mx-auto w-full max-w-md text-left">
              <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
                Leyen
              </p>

              <p className="mt-4 max-w-[28ch] text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                Personal archive of projects, writing, films, and conversations.
              </p>

              <nav className="mt-8 flex flex-wrap gap-x-4 gap-y-3 text-sm text-zinc-700 dark:text-zinc-200">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="transition-colors hover:text-zinc-500 dark:hover:text-zinc-400"
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>

              <div className="mt-6 flex flex-wrap gap-x-4 gap-y-3 text-sm text-zinc-500 dark:text-zinc-400">
                {socials.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="transition-colors hover:text-zinc-900 dark:hover:text-white"
                  >
                    {item.name}
                  </a>
                ))}
              </div>

              <div className="mt-10 border-t border-zinc-200/80 pt-4 dark:border-zinc-800">
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-400 dark:text-zinc-500">
                  Built with
                </p>
                <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-3 text-sm text-zinc-500 dark:text-zinc-400">
                  {stack.map((item) => (
                    <li key={item.title}>
                      <a
                        href={item.href}
                        rel="noreferrer noopener"
                        target="_blank"
                        className="inline-flex items-center gap-x-2 transition-colors hover:text-zinc-900 dark:hover:text-white"
                      >
                        <Image
                          src={item.icon}
                          width={16}
                          height={16}
                          alt={item.alt}
                        />
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </section>

        <section className="hidden lg:block relative overflow-hidden border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto md:px-16 px-6 pt-16 pb-16 lg:pt-20 lg:pb-20">
            <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,1.25fr)_320px]">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
                  Leyen
                </p>
                <p className="mt-6 max-w-2xl text-2xl leading-[1.6] text-zinc-800 dark:text-zinc-100 xl:text-[2rem]">
                  Personal archive of projects, writing, films, and conversations.
                </p>

                <ul className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm text-zinc-500 dark:text-zinc-400">
                  <li className="mr-2 text-zinc-400 dark:text-zinc-500">Built with</li>
                  {stack.map((item) => (
                    <li key={item.title}>
                      <a
                        href={item.href}
                        rel="noreferrer noopener"
                        target="_blank"
                        className="inline-flex items-center gap-x-2 transition-colors hover:text-zinc-900 dark:hover:text-white"
                      >
                        <Image
                          src={item.icon}
                          width={16}
                          height={16}
                          alt={item.alt}
                        />
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-x-10 text-sm">
                <div className="space-y-4 text-zinc-600 dark:text-zinc-300">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
                    Pages
                  </p>
                  <div className="space-y-3">
                    {navigation.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block transition-colors hover:text-zinc-900 dark:hover:text-white"
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 text-zinc-500 dark:text-zinc-400">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
                    Elsewhere
                  </p>
                  <div className="space-y-3">
                    {socials.map((item) => (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="block transition-colors hover:text-zinc-900 dark:hover:text-white"
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </section>
      </footer>
    </UnmountStudio>
  );
}
