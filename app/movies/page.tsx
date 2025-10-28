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
  searchParams: { type?: string; sort?: string };
}) {
  const mediaType = searchParams.type || "all";
  const sortBy = searchParams.sort || "rating";
  
  // Fetch movies based on type filter
  let movies: MovieType[] = await sanityFetch({
    query: mediaType === "all" ? moviesQuery : moviesByTypeQuery,
    qParams: mediaType === "all" ? {} : { type: mediaType },
    tags: ["movie"],
  });

  // Sort movies based on sortBy parameter
  if (sortBy === "rating") {
    // Sort by rating (highest first), with unrated movies at the end
    movies = movies.sort((a, b) => {
      // If both have ratings, sort by rating (descending)
      if (a.rating !== undefined && b.rating !== undefined) {
        return b.rating - a.rating;
      }
      // If only a has rating, a comes first
      if (a.rating !== undefined) {
        return -1;
      }
      // If only b has rating, b comes first
      if (b.rating !== undefined) {
        return 1;
      }
      // If neither has rating, maintain original order
      return 0;
    });
  } else if (sortBy === "newest") {
    // Sort by release date (newest first)
    movies = movies.sort((a, b) => {
      // If both have release dates, sort by date (descending)
      if (a.releaseDate && b.releaseDate) {
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      }
      // If only a has release date, a comes first
      if (a.releaseDate) {
        return -1;
      }
      // If only b has release date, b comes first
      if (b.releaseDate) {
        return 1;
      }
      // If neither has release date, maintain original order
      return 0;
    });
  }

  return (
    <div className="max-w-7xl mx-auto md:px-16 px-6">
      <script
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
      />
      <PageHeading
        title="Movies"
        description="A collection of movies and TV shows I've watched and enjoyed."
      />
      
      {/* Media Type Filter */}
      <MediaTypeFilter mediaType={mediaType} sortBy={sortBy} />

      {/* Movies Grid */}
      {movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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