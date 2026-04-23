# Next.js - Authentication and Route Protection

## What this session adds

The app has been open all week. Anyone could add, edit, or delete movies. Today that changes - a login form, a protected backend, and a frontend that reflects who is logged in.



## Login

Start with the form. It is a server action, same pattern as adding or editing a movie:

```tsx
// app/login/page.tsx
import { login } from '@/modules/auth/actions'

export default function LoginPage() {
  return (
    <form action={login}>
      <input name="username" required />
      <input name="password" type="password" required />
      <button type="submit">Login</button>
    </form>
  )
}
```

The action handles everything - calling the API, storing the token, redirecting on success:

```ts
// modules/auth/actions.ts
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
  cookieStore.set('token', token, { httpOnly: true, path: '/' })
  cookieStore.set('username', username as string, { httpOnly: true, path: '/' })

  redirect('/admin')
}
```

Two things to notice. The API call happens on the server - the token never passes through the browser. And the token is stored in a cookie, not localStorage.



## Why cookies, not localStorage

You may have stored tokens in localStorage before. That works in a fully client-rendered app where everything happens in the browser.

Next has a server. Server components run before the browser receives anything. localStorage is a browser API - the server cannot read it. If the token lives in localStorage, your server components have no way to attach it to API requests or check if a user is logged in before rendering.

Cookies are different. The browser sends them automatically with every request. The server can read them before rendering anything. This is not a new idea - forms, submissions, and cookies are how the web worked before JavaScript took over client-side rendering. We are coming back to something that was not broken in the first place.

```ts
import { cookies } from 'next/headers'

const cookieStore = await cookies()
const token = cookieStore.get('token')?.value
```

This works anywhere the server runs - server components, server actions, layouts.



## httpOnly

Both cookies are marked `httpOnly`:

```ts
cookieStore.set('token', token, { httpOnly: true, path: '/' })
```

This flag tells the browser not to expose the cookie to JavaScript. `document.cookie` cannot see it. A script injected into the page cannot steal it.

The server is unaffected - `httpOnly` only blocks browser-side JavaScript. `cookies()` from `next/headers` reads it normally.

For tokens, always set `httpOnly`. There is no reason the browser needs direct access to it.



## Protecting routes

There are two ways to stop access to a route. Which one you reach for depends on the situation.

### requireAuth - for individual pages

Extract the token check into a helper:

```ts
// lib/auth.ts
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  return token
}
```

Then call it at the top of any page that needs protection:

```tsx
export default async function AddMoviePage() {
  await requireAuth()
  // rest of the page
}
```

If there is no token, the user is redirected before the page renders. `requireAuth` also returns the token - useful when you need to attach it to an API request.

### Layout protection - for a whole section

You have had one layout so far - `app/layout.tsx` at the root, wrapping the entire app. A layout can live inside any folder and it works the same way: it wraps everything nested inside that folder automatically.

That means protection logic in a layout covers every route in that folder without touching any of them individually:

```tsx
// app/admin/layout.tsx
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')

  if (!token) redirect('/login')

  return <div>{children}</div>
}
```

Every route nested under `/admin` is protected by this one check. Add a new admin page and it is already covered.

Think of it as drawing a boundary around a section of the app. `requireAuth` is a lock on a single door. The layout is a lock on the entrance to an entire floor.



## Attaching the token to API requests

The backend now requires a token on mutation endpoints. The actions need to send it:

```ts
export async function addMovie(formData: FormData) {
  const token = await requireAuth()

  const res = await fetch(`${API_URL}/api/movies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error('Failed to add movie')

  revalidatePath('/movies')
  redirect('/movies')
}
```

`requireAuth` does two things here: it redirects unauthenticated users before the fetch fires, and it returns the token to attach to the request. The unauthenticated case never reaches the API.



## Conditional UI

The navbar and movie cards reflect who is logged in. The check happens on the server - read the cookie, render accordingly:

```tsx
// app/layout.tsx
const cookieStore = await cookies()
const username = cookieStore.get('username')?.value

{username ? (
  <div className="flex items-center gap-4 ml-auto">
    <span>{username}</span>
    <form action={logout}>
      <button type="submit">Logout</button>
    </form>
  </div>
) : (
  <Link href="/login">Login</Link>
)}
```

The movie card receives `isAdmin` as a prop from the page, which reads the cookie and passes it down:

```tsx
export default function MovieCard({ movie, isAdmin }: { movie: MovieSummary, isAdmin: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between mt-auto">
        <Link href={`/movies/${movie.id}`}>View details →</Link>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <Link href={`/movies/edit/${movie.id}`}>Edit</Link>
            <DeleteButton id={movie.id} />
          </div>
        )}
      </div>
    </div>
  )
}
```



## Logout

```ts
export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('token')
  cookieStore.delete('username')
  redirect('/login')
}
```

```tsx
<form action={logout}>
  <button type="submit">Logout</button>
</form>
```



## Frontend protection and backend security are not the same thing

By the end of this session the app has two layers of protection and it is worth being clear about what each one does.

The frontend hides things. Buttons disappear when you are not logged in. Routes redirect when there is no token. This is good user experience.

It is not security.

The frontend lives in the browser. Anyone with Postman, curl, or a script can call your API directly - no browser involved, no frontend in the way. Every mutation endpoint is one HTTP request away from anyone who knows the URL.

The backend is the actual security. When .NET requires a valid token on the mutation endpoints, it does not matter how the request arrives. No token, no access. The request is rejected before it touches any data.

The frontend says *you should not be here*. The backend says *you cannot be here*.

Both layers are always needed. Frontend protection alone is theatre. Backend protection alone works but gives a poor experience. Together they do two different jobs well.



## The full picture

| Concern | Where it lives | Why |
|---|---|---|
| Login logic | `modules/auth/actions.ts` | Server action, sets cookies, redirects |
| Auth helper | `lib/auth.ts` | One place for the token check, returns token |
| Section protection | `app/admin/layout.tsx` | Covers all nested routes automatically |
| Page protection | `requireAuth()` | Individual pages outside a protected section |
| Conditional UI | `MovieCard`, `layout.tsx` | Reflects auth state, does not enforce it |
| Actual security | .NET `RequireAuthorization` | Rejects requests without a valid token |