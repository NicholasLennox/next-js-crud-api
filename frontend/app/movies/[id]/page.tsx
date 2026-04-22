import { getMovie } from '@/services/movies'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const movie = await getMovie(Number(id))

  if (!movie) notFound()

  return (
    <div className="max-w-2xl">
      <Link href="/movies" className="text-sm text-gray-400 hover:text-gray-700 mb-6 inline-block">
        ← Back to movies
      </Link>
      <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-gray-500">{movie.year}</span>
        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
          {movie.genre}
        </span>
      </div>
      <p className="text-gray-700 leading-relaxed">{movie.description}</p>
    </div>
  )
}