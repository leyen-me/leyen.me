import Link from "next/link";
import type { InterviewQuestionListItem } from "@/types";
import { formatDate } from "@/app/utils/date";
import { getInterviewCategoryLabel } from "@/lib/interview-categories";

export function InterviewCard({
  interview,
}: {
  interview: InterviewQuestionListItem;
}) {
  const tags = interview.tags ?? [];

  return (
    <Link
      href={`/interviews/${interview.slug}`}
      className="group block h-full"
    >
      <article className="h-full flex flex-col dark:bg-primary-bg bg-secondary-bg p-6 rounded-2xl border dark:border-zinc-800 border-zinc-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary-color">
            {getInterviewCategoryLabel(interview.category)}
          </span>
          {interview.isFromWork ? (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              Work
            </span>
          ) : null}
        </div>

        <h2 className="text-lg font-semibold tracking-tight mb-2 line-clamp-2 group-hover:text-primary-color transition-colors">
          {interview.title}
        </h2>

        <p className="text-sm dark:text-zinc-400 text-zinc-600 line-clamp-3 flex-1 mb-4">
          {interview.excerpt}
        </p>

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-zinc-800/70 text-gray-600 dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <time
          dateTime={interview._updatedAt}
          className="text-xs text-gray-400 dark:text-gray-500 mt-auto"
        >
          Updated {formatDate(interview._updatedAt)}
        </time>
      </article>
    </Link>
  );
}
