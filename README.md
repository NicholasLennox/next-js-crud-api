# Component Testing with Vitest

## What component testing is

A component test asks one question: given these props, does the component show what it should?

Not how it works internally. Not which functions it calls. Not what CSS classes it has. Just - does the right thing appear on screen when you give it the right input.

This is the mindset shift that makes component testing useful. If you test implementation details - internal state, function calls, class names - your tests break every time you refactor, even when the component still works correctly. Test what the user sees and your tests stay honest. Refactor the internals freely, and as long as the output is the same, the tests pass.

For `MovieCard` that means:
- Given a movie, does the title appear?
- Given a movie, does the genre appear?
- Given `isAdmin: true`, do the edit controls appear?
- Given `isAdmin: false`, do they not appear?

Simple, readable, and directly connected to what the component actually does.



## Why Vitest, not Jest

Jest is the most widely used JavaScript test runner. It also has a rough relationship with Next.js. Jest is a browser-focused tool and Next is a server-focused framework - they require significant configuration to work together. Mocking Next internals, resolving server-only imports, handling TypeScript - each one is a separate hurdle.

Vitest was built for the modern JavaScript ecosystem. It understands TypeScript natively, works with the same plugin system as Next, and requires a fraction of the setup. The Next.js docs recommend it. The experience is noticeably smoother.

For this project, Vitest is the right tool.



## Setup

### Packages

```bash
npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

This is the full list - nothing hidden, nothing to add later. Here is what each one does:

| Package | What it does |
|---|---|
| `vitest` | The test runner |
| `@vitejs/plugin-react` | Lets Vitest understand React and JSX |
| `jsdom` | Fakes a browser environment so components can render |
| `@testing-library/react` | Renders components and queries what is on screen |
| `@testing-library/jest-dom` | Adds readable matchers like `toBeInTheDocument()` |

### Config

Create `vitest.config.ts` at the root of the project:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

Three things worth knowing:

`environment: 'jsdom'` - tells Vitest to fake a browser. Without this React cannot render anything - there is no `document`, no `window`, no DOM.

`globals: true` - makes `describe`, `it`, and `expect` available without importing them in every test file.

`alias` - tells Vitest what `@/` means. Your `tsconfig.json` already defines this for the app. Vitest needs its own copy.

### Setup file

Create `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom'
```

This loads the extra matchers before every test runs. One line.

### Test script

Add to `package.json`:

```json
"test": "vitest",
"test:watch": "vitest --watch"
```

`test:watch` reruns tests automatically when you save. Useful while writing tests.



## Writing the tests

Create a `__tests__` folder and add `MovieCard.test.tsx`:

```tsx
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
```



## What each test does

### The mock data

```ts
const mockMovie = {
  id: 1,
  title: 'Inception',
  genre: 'Sci-Fi',
  year: 2010,
}
```

A plain object that satisfies the `MovieSummary` interface. No API, no database, no service call. The component gets what it needs to render and nothing else.

### `render` and `screen`

Every test follows the same shape. `render` mounts the component into the fake browser environment. `screen` gives you ways to query what is on screen - by text, by role, by attribute.

### `getByText` vs `queryByText`

`getByText` finds an element by its text content. If it is not there the test throws and fails immediately.

`queryByText` does the same but returns `null` instead of throwing. Use this when you are asserting something is *not* there - otherwise `getByText` would throw before you even reach the `not.toBeInTheDocument()` check.

### `toHaveAttribute`

```ts
expect(link).toHaveAttribute('href', '/movies/1')
```

Checks that an element has a specific attribute with a specific value. Useful for links, form inputs, aria labels - anywhere an attribute carries meaning.



## Running the tests

```bash
npm test
```

All five passing looks like this:

```
✓ renders the movie title
✓ renders the genre
✓ shows edit and delete when isAdmin is true
✓ hides edit and delete when isAdmin is false
✓ links to the correct movie page
```



## The mindset

Test the output, not the internals.

If `MovieCard` is refactored tomorrow - different class names, different internal structure, a new child component - these tests should still pass as long as the title still appears, the genre still appears, and the admin controls still show and hide correctly.

The moment you test class names or internal function calls, you couple your tests to your implementation. Every refactor breaks tests that were never actually wrong. Tests should give you confidence to change things, not reasons to avoid it.