import { getMovie } from '@/services/movies'
import { updateMovie } from '@/modules/movies/actions'
import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/auth'

export default async function EditMoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  await requireAuth()

  const movie = await getMovie(Number(id))

  if (!movie) notFound()

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6">Edit Movie</h1>
      <form action={updateMovie} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={movie.id} />
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            name="title"
            defaultValue={movie.title}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Genre</label>
          <input
            name="genre"
            defaultValue={movie.genre}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Year</label>
          <input
            name="year"
            type="number"
            defaultValue={movie.year}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            defaultValue={movie.description}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:cursor-pointer"
        >
          Save Changes
        </button>
      </form>
    </div>
  )
}