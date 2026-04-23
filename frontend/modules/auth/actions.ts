'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { API_URL } from '@/lib/constants'

export async function login(formData: FormData) {
    const username = formData.get('username')
    const password = formData.get('password')

    const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    })

    if (!res.ok) throw new Error('Invalid credentials')

    const { token } = await res.json()

    const cookieStore = await cookies()
    cookieStore.set('token', token, {
        httpOnly: true,
        path: '/',
    })

    cookieStore.set('username', username as string, {
        httpOnly: true,
        path: '/',
    })

    redirect('/admin')
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('token')
    cookieStore.delete('username')
    redirect('/login')
}