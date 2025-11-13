"use client";

import { motion, AnimatePresence } from "framer-motion";
import { QuoteType } from "@/types";
import { QuoteCard } from "./QuoteCard";

interface QuotesGridProps {
  quotes: QuoteType[];
}

export function QuotesGrid({ quotes }: QuotesGridProps) {
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 [column-fill:balance]">
      <AnimatePresence mode="popLayout">
        {quotes.map((quote, index) => (
          <div key={quote._id} className="break-inside-avoid mb-6">
            <motion.div
              layout
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
              transition={{
                duration: 0.4,
                delay: Math.min(index * 0.03, 0.3),
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              <QuoteCard quote={quote} />
            </motion.div>
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

