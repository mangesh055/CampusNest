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
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>
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

    updateProfile: async (updates: Partial<Profile>) => {
      const currentProfile = get().profile
      if (!currentProfile) return { success: false, error: 'No profile logged in' }

      const updatedProfile: Profile = {
        ...currentProfile,
        ...updates,
        updated_at: new Date().toISOString(),
      }

      // 1. Optimistic update in Zustand store
      set({ profile: updatedProfile })

      // 2. Persist in localStorage for demo/cached session
      try {
        const demoUserStr = localStorage.getItem('campusnest_demo_user')
        if (demoUserStr) {
          const parsed = JSON.parse(demoUserStr)
          localStorage.setItem('campusnest_demo_user', JSON.stringify({ ...parsed, ...updates }))
        }
      } catch (e) {
        // Ignore localStorage error
      }

      // 3. Persist to Supabase Database `profiles` table
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentProfile.id)

        if (error) {
          console.warn('Supabase profile update warning:', error.message)
        }

        // 4. Also update Auth user metadata if full_name or phone changed
        if (updates.full_name || updates.phone) {
          await supabase.auth.updateUser({
            data: {
              full_name: updates.full_name ?? currentProfile.full_name,
              phone: updates.phone ?? currentProfile.phone,
            }
          }).catch(() => {})
        }

        return { success: true }
      } catch (err: any) {
        console.error('Error saving profile to database:', err)
        return { success: false, error: err.message || 'Failed to update profile' }
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
