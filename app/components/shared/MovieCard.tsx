import { MovieType } from "@/types";
import Image from "next/image";

export function MovieCard({ movie }: { movie: MovieType }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ease-out transform hover:-translate-y-1">
      <div className="relative aspect-[2/3] overflow-hidden">
        {movie.coverImage?.image ? (
          <Image
            src={movie.coverImage.image}
            alt={movie.coverImage.alt || movie.title}
            fill
            className="object-cover transition-transform duration-500 ease-in-out hover:scale-110"
          />
        ) : (
          <div className="bg-gray-100 dark:bg-gray-800 w-full h-full flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500 text-xs">No image</span>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        
        {/* Rating badge */}
        {movie.rating && (
          <div className="absolute top-2 right-2 flex items-center bg-black/60 text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded-sm z-10">
            <svg className="w-2.5 h-2.5 text-yellow-400 mr-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{movie.rating}</span>
          </div>
        )}
        
        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 p-2.5 z-10">
          <h3 className="font-medium text-sm text-white mb-0.5 leading-tight line-clamp-2">{movie.title}</h3>
          <div className="flex items-center text-xs text-gray-200">
            {movie.releaseDate && (
              <span>{new Date(movie.releaseDate).getFullYear()}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}