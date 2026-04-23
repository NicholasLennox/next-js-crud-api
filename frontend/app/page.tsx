import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Movie App</h1>
      <p className="text-gray-500 max-w-md">
        Head to the gallery to see the full collection.
      </p>
      <Link
        href="/movies"
        className="w-fit bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Browse Movies →
      </Link>
    </div>
  )
}