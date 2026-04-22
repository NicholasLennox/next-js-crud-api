'use client'

export default function AddMovieError({ reset }: { reset: () => void }) {
  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-bold text-red-600 mb-2">Failed to add movie</h2>
      <p className="text-gray-500 mb-4">Something went wrong submitting the form.</p>
      <button
        onClick={reset}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  )
}