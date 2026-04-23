import Link from 'next/link'
import { MovieSummary } from '@/services/movies'
import DeleteButton from './DeleteButton'

export default function MovieCard({ movie, isAdmin }: { movie: MovieSummary, isAdmin: boolean }) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-black text-lg">{movie.title}</h2>
        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
          {movie.genre}
        </span>
      </div>
      <p className="text-sm text-gray-500">{movie.year}</p>
      <div className="flex items-center justify-between mt-auto">
        <Link href={`/movies/${movie.id}`} className="text-sm text-blue-600 hover:underline">
          View details →
        </Link>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <Link href={`/movies/edit/${movie.id}`} className="text-sm text-gray-500 hover:text-gray-700">
              Edit
            </Link>
            <DeleteButton id={movie.id} />
          </div>
        )}
      </div>
    </div>
  )
}