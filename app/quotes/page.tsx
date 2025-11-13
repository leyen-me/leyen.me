import { Metadata } from "next";
import { sanityFetch } from "@/lib/sanity.client";
import { quotesQuery, quotesByTagQuery, allTagsQuery } from "@/lib/sanity.query";
import { QuoteType } from "@/types";
import PageHeading from "@/app/components/shared/PageHeading";
import { QuotesGrid } from "@/app/components/shared/QuotesGrid";
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
  // Fetch all tags
  const allTags: string[] = await sanityFetch({
    query: allTagsQuery,
    tags: ["quote"],
  });

  // Default to first tag if no tag is selected
  const selectedTag = searchParams.tag || (allTags.length > 0 ? allTags[0] : undefined);

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

      {/* Quotes Grid - Masonry Layout with Animation */}
      {quotes.length > 0 ? (
        <QuotesGrid quotes={quotes} />
      ) : (
        <EmptyState value="Quote" />
      )}
    </div>
  );
}

