import { login } from '@/modules/auth/actions'

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm mx-auto mt-16">
      <h1 className="text-3xl font-bold mb-6">Login</h1>
      <form action={login} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            name="username"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            name="password"
            type="password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:cursor-pointer"
        >
          Login
        </button>
      </form>
    </div>
  )
}