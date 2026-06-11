import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile, UserRole } from '../types'
import { supabase } from '../lib/supabase'

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
  persist(
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
          set({ profile: data, initialized: true, loading: false })
        } catch (error) {
          console.warn('Error fetching profile from DB, using fallback metadata:', error)
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const fallbackProfile: Profile = {
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
              phone: user.user_metadata?.phone || '',
              role: (user.user_metadata?.role as UserRole) || 'student',
              created_at: user.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
            set({ profile: fallbackProfile, initialized: true, loading: false })
          } else {
            set({ profile: null, initialized: true, loading: false })
          }
        }
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, session: null, profile: null })
      },
    }),
    {
      name: 'campus-nest-auth',
      partialize: (state) => ({ profile: state.profile }),
    }
  )
)
