import { Metadata } from "next";
import { sanityFetch } from "@/lib/sanity.client";
import { moviesQuery, moviesByTypeQuery } from "@/lib/sanity.query";
import { MovieType } from "@/types";
import PageHeading from "@/app/components/shared/PageHeading";
import { MovieCard } from "@/app/components/shared/MovieCard";
import { MediaTypeFilter } from "@/app/components/shared/MediaTypeFilter";

export const metadata: Metadata = {
  title: "Movies | Leyen",
  description: "Discover movies and TV shows watched by Leyen",
  openGraph: {
    title: "Movies | Leyen",
    description: "Discover movies and TV shows watched by Leyen",
    type: "website",
    locale: "en_US",
    url: "https://leyen.me/movies",
  },
};

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const mediaType = searchParams.type || "all";
  
  // Fetch movies based on type filter
  const movies: MovieType[] = await sanityFetch({
    query: mediaType === "all" ? moviesQuery : moviesByTypeQuery,
    qParams: mediaType === "all" ? {} : { type: mediaType },
    tags: ["movie"],
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      {/* <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Movies and TV Shows",
            "description": "A collection of movies and TV shows watched by Leyen",
            "itemListElement": movies.map((movie, index) => ({
              "@type": "Movie",
              "name": movie.title,
              "image": movie.coverImage?.image,
              "description": movie.description,
              "dateCreated": movie.releaseDate,
              "aggregateRating": movie.rating
                ? {
                    "@type": "AggregateRating",
                    "ratingValue": movie.rating,
                    "bestRating": 10,
                  }
                : undefined,
            })),
          }),
        }}
      /> */}
      <PageHeading
        title="Movies"
        description="A collection of movies and TV shows I've watched and enjoyed."
      />
      
      {/* Media Type Filter */}
      <MediaTypeFilter mediaType={mediaType} />

      {/* Movies Grid */}
      {movies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No movies or TV shows found.
          </p>
        </div>
      )}
    </div>
  );
}