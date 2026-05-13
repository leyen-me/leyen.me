"use client";

import { motion, AnimatePresence } from "framer-motion";
import { QuoteType } from "@/types";
import { formatDate } from "@/app/utils/date";

interface QuoteEssayListProps {
  essays: QuoteType[];
}

export function QuoteEssayList({ essays }: QuoteEssayListProps) {
  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {essays.map((essay, index) => (
          <motion.div
            key={essay._id}
            layout
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12, transition: { duration: 0.2 } }}
            transition={{
              duration: 0.4,
              delay: Math.min(index * 0.04, 0.24),
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <article className="mx-auto max-w-3xl rounded-3xl border border-gray-200/80 bg-white/95 p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-primary-bg">
              {essay.context && (
                <div className="mb-4">
                  <span className="inline-block text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
                    {essay.context}
                  </span>
                </div>
              )}

              <div className="space-y-5">
                <p className="whitespace-pre-wrap text-sm font-normal leading-7 text-gray-700 dark:text-gray-300 md:text-base md:leading-8">
                  {essay.quote}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-gray-100 pt-5 text-sm dark:border-zinc-800">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {essay.author}
                  </p>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(essay._createdAt)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {essay.tags.map((tag) => (
                    <span
                      key={`${essay._id}-${tag}`}
                      className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 dark:bg-zinc-800/70 dark:text-gray-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
