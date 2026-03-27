import Link from "next/link";
import { socialLinks } from "../../data/social";
import UnmountStudio from "./Unmount";

export default function Footer() {
  const navigation = [
    { title: "Projects", href: "/projects" },
    { title: "Blog", href: "/blog" },
    { title: "Quotes", href: "/quotes" },
    { title: "Movies", href: "/movies" },
  ];

  const socials = socialLinks
    .filter((item) => item.status === "social")
    .slice(0, 4);

  return (
    <UnmountStudio>
      <footer className="mt-40 print:hidden">
        <div className="border-t border-zinc-200 dark:border-zinc-800" />
        <section className="relative overflow-hidden bg-zinc-900 text-white dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto md:px-16 px-6 pt-8 sm:pt-10 lg:pt-12">
            <div className="flex items-start justify-between gap-8 text-[11px] uppercase tracking-[0.28em] text-zinc-400">
              <p>Footer</p>
              <p className="hidden sm:block">Open, oversized, and quiet.</p>
            </div>

            <div className="mt-10 grid items-start gap-y-6 lg:grid-cols-[220px,1fr,220px] lg:gap-10">
              <div className="space-y-3 text-sm text-zinc-400">
                <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                  Explore
                </p>
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block hover:text-white transition-colors"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>

              <div className="hidden lg:block lg:min-h-[200px]" />

              <div className="space-y-3 text-sm text-zinc-400 lg:text-right">
                <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                  Elsewhere
                </p>
                {socials.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="block hover:text-white transition-colors"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 lg:mt-16 border-t border-white/10" />

          <div className="max-w-7xl mx-auto md:px-16 px-6 pt-6">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              <small>Copyright &copy; Leyen {new Date().getFullYear()}</small>
              <small className="hidden sm:block">All rights reserved</small>
            </div>
          </div>

          <div className="relative h-[7.5rem] sm:h-[20rem] lg:h-[30rem] mt-4 overflow-hidden">
            <p className="absolute left-0 sm:left-1 lg:left-2 bottom-[-0.4em] font-incognito text-[clamp(10rem,38vw,55rem)] leading-none tracking-[0.03em] text-zinc-50 whitespace-nowrap select-none font-bold">
              FOOTER
            </p>
          </div>
        </section>
      </footer>
    </UnmountStudio>
  );
}
