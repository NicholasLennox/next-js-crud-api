# Next.js - Data, Mutations, and the Server/Client Boundary

(Run the backend dotnet app first)

## Part 1 - Connecting to a real API

### What changes when data comes from outside

In the first session the service read from a local JSON file. The file lived in the project, the import was instant, nothing could go wrong.

A real API is different. The request goes over the network. It can be slow. It can fail. The data arrives asynchronously - you ask for it, and at some point later it arrives.

The service is still the right place to handle this. What changes is how the functions are written.

```ts
// before - synchronous, local file
export function getMovies(): MovieSummary[] {
  return movies
}

// after - asynchronous, real API
export async function getMovies(): Promise<MovieSummary[]> {
  const res = await fetch(`${API_URL}/api/movies`)
  if (!res.ok) throw new Error('Failed to fetch movies')
  return res.json()
}
```

The function is now `async` and returns a `Promise`. Everything else - the interface, the return type, the name - stays the same. The page that calls it changes by one word:

```ts
// before
const movies = getMovies()

// after
const movies = await getMovies()
```

That is the entire change from the page's perspective. It does not know or care that the data now comes from a network request instead of a file. This is why the service layer exists - not ceremony, but protection. When things change underneath, the pages stay the same.



### Environment variables

The API URL does not belong in your code. It changes between environments - your laptop, a staging server, production. Hard-coding it means editing source files every time you move the app somewhere new.

Create a `lib/constants.ts`:

```ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5195'
```

And a `.env.local` file at the root of the project:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5195
```

Two things worth knowing about this:

`NEXT_PUBLIC_` is a Next convention. Variables with this prefix are available in the browser as well as on the server. Variables without it are server-only - never sent to the client. Sensitive values like API keys should never have the prefix.

The `??` is a fallback. If the environment variable is not set, the URL defaults to localhost. This means the app works in development without the `.env.local` file existing.

This is in the assignment criteria. Get into the habit now.



### Error handling in the service

When a fetch fails, `res.ok` is false. If you ignore that and call `res.json()` anyway, you get confusing errors further down the line. Check it early and throw something meaningful:

```ts
if (!res.ok) throw new Error('Failed to fetch movies')
```

Throwing in a server component triggers the nearest `error.tsx`. That file catches the error and shows the user something useful instead of a broken page. You saw `error.tsx` in the first session - this is what actually triggers it in practice.



### Loading and error pages in context

Next reserves two filenames in any route folder:

- `loading.tsx` - renders immediately while the page is waiting for data
- `error.tsx` - renders when something throws

Both scope to the folder they live in. `app/movies/loading.tsx` covers `/movies` and everything nested inside it. `app/loading.tsx` covers the whole app.

For the assignment, these are required on the home page. They are not difficult to write - but you need to understand what triggers them. `loading.tsx` fires automatically when a server component is waiting on an async operation. `error.tsx` fires when something throws. The throw in your service is what connects the two.



## Part 2 - Mutations and the server/client boundary

### The problem with writing data

Reading data in Next is clean. Server components call the service, data is there before the page leaves the server, the browser receives finished HTML.

Writing data is a different problem. The user fills in a form and clicks submit. Something needs to happen - a POST, a PUT, a DELETE. In your React apps you handled this in the browser: `useState` for the form fields, `handleChange` on every input, `fetch` in the submit handler, `useEffect` to show loading state.

That works. But all of it runs in the browser by default. In Next, there is a server sitting right there. You can use it.



### Functions run in the browser by default

Before anything else, this needs to be clear.

Components in Next are server by default. You already know this - no `useState`, no `useEffect`, renders on the server, sends HTML.

Functions are different. A function defined in a component, or in a plain `.ts` file, runs in the browser by default. The server component rule does not apply to functions automatically.

This matters because it means a function that does a `fetch` and a `redirect` - things that should happen on the server - will try to run in the browser unless you tell Next otherwise.

`'use server'` is that instruction.



### Server actions

A server action is a function marked with `'use server'`. When Next sees this, it ensures the function runs on the server - even when it is triggered by something in the browser, like a form submission.

You pass it directly to a form's `action` attribute. When the form submits, Next calls the function with the form's data. No `onSubmit`, no `fetch` from the client, no API endpoint needed on your end:

```ts
'use server'

export async function addMovie(formData: FormData) {
  const body = {
    title: formData.get('title'),
    genre: formData.get('genre'),
    year: Number(formData.get('year')),
    description: formData.get('description'),
  }

  const res = await fetch(`${API_URL}/api/movies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error('Failed to add movie')

  revalidatePath('/movies')
  redirect('/movies')
}
```

```tsx
<form action={addMovie}>
  <input name="title" />
  <button type="submit">Add</button>
</form>
```

The `name` attributes on the inputs are the bridge between the HTML and the function. `formData.get('title')` reads whatever the user typed into `<input name="title" />`.



### `revalidatePath` - why it exists

Next caches page renders. When `/movies` loads, Next keeps a copy of the rendered result. The next request serves that copy instead of re-running the page - faster, less work for the server.

The problem is mutations. You add a movie, the cache still holds the old list. Next does not automatically know something changed.

`revalidatePath('/movies')` tells Next to throw away the cached version of that route. The next request re-runs the page fresh, and the new movie shows up.

```ts
revalidatePath('/movies')  // invalidate the cache
redirect('/movies')        // send the user there
```

Without `revalidatePath` the redirect would work but the page would show stale data. Both lines are needed.



### Where actions live

Actions live in a `modules/` folder, co-located with the feature they belong to:

```
modules/
  movies/
    actions.ts
services/
  movies.ts
```

`services/` is for reading. `actions.ts` is for writing. This is a deliberate separation - a pattern you will see in professional Next codebases. Keeping reads and writes in different places makes it easier to find things as the app grows, and it keeps the service layer focused on one job.

As more features are added the pattern scales cleanly:

```
modules/
  movies/
    actions.ts
  auth/
    actions.ts
```



### `'use server'` - file level vs function level

`'use server'` at the top of a file marks every function in that file as a server action:

```ts
'use server'

export async function addMovie(formData: FormData) { ... }
export async function deleteMovie(formData: FormData) { ... }
export async function updateMovie(formData: FormData) { ... }
```

`'use server'` inside a single function marks only that function:

```ts
const handleSubmit = async (formData: FormData) => {
  'use server'
  // only this function runs on the server
}
```

You will mostly use the file-level version. The inline version exists for cases where you need to close over a value from the component - but there is usually a cleaner way. Passing data through a hidden input keeps the action self-contained and consistent with how the other actions work:

```tsx
<form action={updateMovie}>
  <input type="hidden" name="id" value={movie.id} />
```

```ts
export async function updateMovie(formData: FormData) {
  const id = Number(formData.get('id'))
  // read everything from formData, including the hidden field
}
```



### Error handling in actions

The same principle from the service applies here. Check the response, throw if it is not ok:

```ts
if (!res.ok) throw new Error('Failed to add movie')
```

Throwing in an action triggers the nearest `error.tsx`. The difference from the service is that `error.tsx` for a form page needs to let the user try again - which means it needs interactivity.

```tsx
'use client'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div>
      <p>Something went wrong.</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

`error.tsx` must be a client component because of the `reset` prop. Only plain data - strings, numbers, arrays - can cross the boundary between server and client. Functions cannot. `reset` is a function that Next passes in to retry the failed action. Because it is a function, the component that receives it has to live on the client side. `'use client'` is what makes that possible.

`reset` retries the action. It does not navigate away. The user stays on the form and tries again.



### The server/client boundary in components

`MovieCard` is a server component. It renders on the server, produces HTML, and that is the end of its job. But it has a delete button - and delete needs `window.confirm`, which is a browser API. The server does not have `window`.

The answer is not to make the whole card a client component. It is to extract only the piece that needs the browser:

```
components/
  MovieCard.tsx       ← server component
  DeleteButton.tsx    ← "use client"
```

```tsx
'use client'

export default function DeleteButton({ id }: { id: number }) {
  async function handleDelete() {
    const confirmed = window.confirm('Are you sure?')
    if (!confirmed) return
    await deleteMovie(id)
  }

  return <button onClick={handleDelete}>Delete</button>
}
```

`MovieCard` imports `DeleteButton`. The card stays on the server. Only the button crosses the boundary. This is the principle in action: push `'use client'` as far down the tree as you can. The more that stays on the server, the less JavaScript ships to the browser.



### Edit - reading before writing

Edit is the most complete example of how everything fits together.

The page is a server component. It fetches the existing movie first, then renders a form pre-populated with that data:

```tsx
export default async function EditMoviePage({ params }) {
  const { id } = await params
  const movie = await getMovie(Number(id))

  if (!movie) notFound()

  return (
    <form action={updateMovie}>
      <input type="hidden" name="id" value={movie.id} />
      <input name="title" defaultValue={movie.title} />
      <input name="genre" defaultValue={movie.genre} />
    </form>
  )
}
```

`defaultValue` sets the initial value of an input without React controlling it. The server provides the starting point, the browser owns the field from there. No `useState`, no controlled inputs - the server does the work it is good at, the browser does the work it is good at.



### The full picture

| Concern | Where it lives | Why |
|---|---|---|
| Reading data | `services/` | Called directly from server components |
| Writing data | `modules/[feature]/actions.ts` | Co-located with the feature, triggered by forms |
| Shared UI | `components/` | Reused across pages |
| Config and constants | `lib/constants.ts` | One place to change when things move |
| Environment secrets | `.env.local` | Never in source code |

The service layer abstracts where data comes from. The action layer abstracts how data gets written. Pages and components sit on top of both and stay focused on what they are actually for: rendering and responding to the user.