import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MovieCard from '@/components/MovieCard'

const mockMovie = {
    id: 1,
    title: 'Inception',
    genre: 'Sci-Fi',
    year: 2010,
}

describe('MovieCard', () => {
    it('renders the movie title', () => {
        render(<MovieCard movie={mockMovie} isAdmin={false} />)
        expect(screen.getByText('Inception')).toBeInTheDocument()
    })

    it('renders the genre', () => {
        render(<MovieCard movie={mockMovie} isAdmin={false} />)
        expect(screen.getByText('Sci-Fi')).toBeInTheDocument()
    })

    it('shows edit and delete when isAdmin is true', () => {
        render(<MovieCard movie={mockMovie} isAdmin={true} />)
        expect(screen.getByText('Edit')).toBeInTheDocument()
    })

    it('hides edit and delete when isAdmin is false', () => {
        render(<MovieCard movie={mockMovie} isAdmin={false} />)
        expect(screen.queryByText('Edit')).not.toBeInTheDocument()
    })
    it('links to the correct movie page', () => {
        render(<MovieCard movie={mockMovie} isAdmin={false} />)
        const link = screen.getByText('View details →')
        expect(link).toHaveAttribute('href', '/movies/1')
    })
})