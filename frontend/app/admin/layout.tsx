import { requireAuth } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {

  await requireAuth()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-semibold text-gray-500">Admin</h2>
      </div>
      {children}
    </div>
  )
}