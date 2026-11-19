import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { GalleryItem } from "@/lib/ui-gallery/types";

function InstallCommand({ dependencies }: { dependencies: string[] }) {
  if (dependencies.length === 0) {
    return (
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        只依赖 React 与 Tailwind CSS，无需额外安装。
      </p>
    );
  }

  return (
    <code className="block overflow-x-auto rounded-lg bg-zinc-100 px-3 py-2 font-mono text-[12px] text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
      npm i {dependencies.join(" ")}
    </code>
  );
}

export function GalleryMetaPanel({ item }: { item: GalleryItem }) {
  return (
    <aside className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Status
          </dt>
          <dd className="mt-1 capitalize text-zinc-700 dark:text-zinc-200">
            {item.status}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Added
          </dt>
          <dd className="mt-1 font-mono text-xs text-zinc-700 dark:text-zinc-200">
            {item.createdAt}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Files
          </dt>
          <dd className="mt-1 font-mono text-xs text-zinc-700 dark:text-zinc-200">
            {item.files.length}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Kind
          </dt>
          <dd className="mt-1 capitalize text-zinc-700 dark:text-zinc-200">
            {item.kind}
          </dd>
        </div>
      </dl>

      <div>
        <p className="text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Install
        </p>
        <div className="mt-2">
          <InstallCommand dependencies={item.dependencies} />
        </div>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Source
        </p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          {item.source.url ? (
            <a
              href={item.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-500 hover:text-emerald-400"
            >
              {item.source.label}
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          ) : (
            item.source.label
          )}
          {item.source.license && (
            <span className="ml-2 text-xs text-zinc-400 dark:text-zinc-500">
              {item.source.license}
            </span>
          )}
        </p>
      </div>

      {item.tags.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Tags
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <Link
                key={tag}
                href={`/ui?tag=${encodeURIComponent(tag)}`}
                className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-500 transition-colors hover:text-zinc-900 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
