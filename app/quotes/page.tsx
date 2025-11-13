import { Metadata } from "next";
import { sanityFetch } from "@/lib/sanity.client";
import { quotesQuery, quotesByTagQuery, allTagsQuery } from "@/lib/sanity.query";
import { QuoteType } from "@/types";
import PageHeading from "@/app/components/shared/PageHeading";
import { QuoteCard } from "@/app/components/shared/QuoteCard";
import { TagFilter } from "@/app/components/shared/TagFilter";
import EmptyState from "@/app/components/shared/EmptyState";

export const metadata: Metadata = {
  title: "Quotes | Leyen",
  description: "A collection of inspiring quotes, witty remarks, and wise words from various sources.",
  openGraph: {
    title: "Quotes | Leyen",
    description: "A collection of inspiring quotes, witty remarks, and wise words from various sources.",
    type: "website",
    locale: "en_US",
    url: "https://leyen.me/quotes",
  },
};

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: { tag?: string };
}) {
  const selectedTag = searchParams.tag;

  // Fetch all tags
  const allTags: string[] = await sanityFetch({
    query: allTagsQuery,
    tags: ["quote"],
  });

  // Fetch quotes based on tag filter
  let quotes: QuoteType[] = await sanityFetch({
    query: selectedTag ? quotesByTagQuery : quotesQuery,
    qParams: selectedTag ? { tag: selectedTag } as Record<string, string> : {},
    tags: ["quote"],
  });

  return (
    <div className="max-w-7xl mx-auto md:px-16 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Quotes Collection",
            "description": "A collection of inspiring quotes, witty remarks, and wise words",
            "itemListElement": quotes.map((quote, index) => ({
              "@type": "CreativeWork",
              "name": quote.quote,
              "author": quote.author,
              "dateCreated": quote._createdAt,
            })),
          }),
        }}
      />
      
      <PageHeading
        title="Quotes"
        description="Record those classic quotes that touch the soul—philosophical, humorous, and wise."
      />

      {/* Tag Filter */}
      <TagFilter tags={allTags} selectedTag={selectedTag} />

      {/* Quotes Grid - Masonry Layout */}
      {quotes.length > 0 ? (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 [column-fill:balance]">
          {quotes.map((quote) => (
            <div key={quote._id} className="break-inside-avoid mb-6">
              <QuoteCard quote={quote} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState value="Quote" />
      )}
    </div>
  );
}

