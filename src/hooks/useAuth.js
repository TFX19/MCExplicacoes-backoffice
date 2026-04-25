'use client'
import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase-browser'

export function useAuth() {
  const supabase = createBrowserClient()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }, [supabase])

  return { session, loading, signOut, user: session?.user ?? null }
}
