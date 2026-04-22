import { getMovies } from '@/services/movies'
import MovieCard from '@/components/MovieCard'
import Link from 'next/link'

export default async function MoviesPage() {
    const movies = await getMovies()

    return (
        <div className='flex flex-col gap-4'>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Movies</h1>
                <Link href="/movies/add" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Add Movie
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {movies.map(movie => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>
        </div>
    )
}