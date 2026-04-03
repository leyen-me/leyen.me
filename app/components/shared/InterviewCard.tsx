import Link from "next/link";
import type { InterviewQuestionListItem } from "@/types";
import { formatDate } from "@/app/utils/date";
import { getInterviewCategoryLabel } from "@/lib/interview-categories";

export function InterviewCard({
  interview,
}: {
  interview: InterviewQuestionListItem;
}) {
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
        </div>

        <h2 className="text-lg font-semibold tracking-tight mb-4 line-clamp-3 group-hover:text-primary-color transition-colors flex-1">
          {interview.title}
        </h2>

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
