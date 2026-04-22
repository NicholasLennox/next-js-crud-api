'use client'

import { deleteMovie } from '@/modules/movies/actions'

export default function DeleteButton({ id }: { id: number }) {
    
    async function handleDelete() {
        const confirmed = window.confirm('Are you sure you want to delete this movie?')
        if (!confirmed) return
        await deleteMovie(id)
    }

    return (
        <button
            onClick={handleDelete}
            className="text-sm text-red-500 hover:text-red-700"
        >
            Delete
        </button>
    )
}