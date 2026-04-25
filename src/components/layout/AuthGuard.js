'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Sidebar from './Sidebar'

export default function AuthGuard({ children }) {
  const { session, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !session) router.push('/login')
  }, [session, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50">
        {children}
      </main>
    </div>
  )
}
