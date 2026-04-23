import Link from 'next/link'

export default function AdminPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-500">Manage your content below.</p>
            <Link
                href="/movies"
                className="w-fit bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
                Manage Movies →
            </Link>
        </div>
    )
}