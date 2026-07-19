import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile, UserRole } from '../types'
import { supabase } from '../lib/supabase'
import { clearLocalAuth, clearSupabaseAuthStorage } from '../lib/localAuth'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  initialized: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
  fetchProfile: (userId: string) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  (set, get) => ({
    user: null,
    session: null,
    profile: null,
    loading: true,
    initialized: false,

    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),
    setProfile: (profile) => set({ profile }),
    setLoading: (loading) => set({ loading }),

    fetchProfile: async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) throw error
        
        if (data.status === 'suspended') {
          await supabase.auth.signOut()
          clearLocalAuth()
          clearSupabaseAuthStorage()
          set({ user: null, session: null, profile: null, initialized: true, loading: false })
          setTimeout(() => alert('Your account is unable to login due to suspension by the admin.'), 100)
          return
        }

        set({ profile: data, initialized: true, loading: false })
      } catch (error) {
        console.warn('Error fetching profile from DB:', error)
        await supabase.auth.signOut()
        clearLocalAuth()
        clearSupabaseAuthStorage()
        set({ user: null, session: null, profile: null, initialized: true, loading: false })
      }
    },

    signOut: async () => {
      try {
        await supabase.auth.signOut()
      } catch {
        // Ignore network/auth provider failures during sign out.
      }
      clearLocalAuth()
      clearSupabaseAuthStorage()
      sessionStorage.removeItem('admin_verified')
      set({ user: null, session: null, profile: null })
    }
  })
)
