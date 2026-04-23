import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { logout } from '@/modules/auth/actions'

export const metadata: Metadata = {
  title: 'Movie App',
  description: 'A Next.js demo',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  const cookieStore = await cookies()
  const username = cookieStore.get('username')?.value

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <nav className="flex gap-6 p-4 bg-gray-800 text-white">
          <Link href="/" className="hover:text-blue-400">Home</Link>
          <Link href="/movies" className="hover:text-blue-400">Movies</Link>
          <Link href="/movies/add" className="hover:text-blue-400">Create</Link>
          {username ? (
            <div className="flex items-center gap-4 ml-auto">
              <span className="text-gray-300 text-sm">{username}</span>
              <form action={logout}>
                <button type="submit" className="text-sm hover:text-blue-400">
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="hover:text-blue-400 ml-auto">Login</Link>
          )}
        </nav>
        <main className="max-w-4xl mx-auto px-6 py-10">
          {children}
        </main>
        <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white text-center p-3 text-sm">
          Movie App
        </footer>
      </body>
    </html>
  )
}