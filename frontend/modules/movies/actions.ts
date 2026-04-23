'use server'

import { requireAuth } from '@/lib/auth'
import { API_URL } from '@/lib/constants'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addMovie(formData: FormData) {

  const token = await requireAuth()

  const body = {
    title: formData.get('title'),
    genre: formData.get('genre'),
    year: Number(formData.get('year')),
    description: formData.get('description'),
  }

  const res = await fetch(`${API_URL}/api/movies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error('Failed to add movie')
  }

  revalidatePath('/movies')
  redirect('/movies')
}

export async function deleteMovie(id: number) {

  const token = await requireAuth()

  const res = await fetch(`${API_URL}/api/movies/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  })

  if (!res.ok) throw new Error('Failed to delete movie')

  revalidatePath('/movies')
  redirect('/movies')
}

export async function updateMovie(formData: FormData) {

  const token = await requireAuth()

  const id = Number(formData.get('id'))
  const body = {
    title: formData.get('title'),
    genre: formData.get('genre'),
    year: Number(formData.get('year')),
    description: formData.get('description'),
  }

  const res = await fetch(`${API_URL}/api/movies/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error('Failed to update movie')

  revalidatePath('/movies')
  redirect('/movies')
}