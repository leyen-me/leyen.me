import { QuoteType } from "@/types";
import { formatDate } from "@/app/utils/date";
import { BiSolidQuoteRight } from "react-icons/bi";

export function QuoteCard({ quote }: { quote: QuoteType }) {
  return (
    <article className="group relative bg-white dark:bg-primary-bg rounded-2xl p-6 md:p-7 shadow-sm hover:shadow-xl transition-all duration-300 ease-out border border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 hover:-translate-y-1">
      {/* Quote Icon - Decorative */}
      <div className="absolute top-6 right-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-300">
        <BiSolidQuoteRight className="w-20 h-20 text-gray-900 dark:text-white" />
      </div>

      {/* Context/Theme */}
      {quote.context && (
        <div className="mb-5 relative z-10">
          <span className="inline-block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {quote.context}
          </span>
        </div>
      )}

      {/* Quote Text */}
      <blockquote className="mb-6 relative z-10">
        <p className="text-lg md:text-xl font-medium text-gray-900 dark:text-gray-100 leading-relaxed tracking-tight">
          "{quote.quote}"
        </p>
      </blockquote>

      {/* Author */}
      <div className="mb-5 pb-5 border-b border-gray-100 dark:border-zinc-800 relative z-10">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          — {quote.author}
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4 relative z-10">
        {quote.tags.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-zinc-800/70 text-gray-600 dark:text-gray-400 transition-colors duration-200"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Date */}
      <div className="text-xs text-gray-400 dark:text-gray-500 relative z-10">
        {formatDate(quote._createdAt)}
      </div>
    </article>
  );
}

