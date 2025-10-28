import { MovieType } from "@/types";
import Image from "next/image";

export function MovieCard({ movie }: { movie: MovieType }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative aspect-[2/3] overflow-hidden">
        {movie.coverImage?.image ? (
          <Image
            src={movie.coverImage.image}
            alt={movie.coverImage.alt || movie.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="bg-gray-200 dark:bg-gray-800 w-full h-full flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400">No image</span>
          </div>
        )}
        
        {movie.rating && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs font-bold px-2 py-1 rounded">
            {movie.rating}/10
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 truncate">{movie.title}</h3>
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <span className="capitalize">
            {movie.mediaType === "movie" ? "Movie" : "TV Show"}
          </span>
          {movie.releaseDate && (
            <span>{new Date(movie.releaseDate).getFullYear()}</span>
          )}
        </div>
      </div>
    </div>
  );
}