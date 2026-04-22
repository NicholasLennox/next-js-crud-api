import { API_URL } from '@/lib/constants'

export interface Movie {
  id: number
  title: string
  genre: string
  year: number
  description: string
}

export interface MovieSummary {
  id: number
  title: string
  genre: string
  year: number
}

export async function getMovies(): Promise<MovieSummary[]> {
  const res = await fetch(`${API_URL}/api/movies`)
  if (!res.ok) throw new Error('Failed to fetch movies')
  return res.json()
}

export async function getMovie(id: number): Promise<Movie | undefined> {
  const res = await fetch(`${API_URL}/api/movies/${id}`)
  if (!res.ok) return undefined
  return res.json()
}