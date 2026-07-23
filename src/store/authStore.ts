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
          .maybeSingle()

        if (data) {
          if (data.status === 'suspended') {
            await supabase.auth.signOut()
            clearLocalAuth()
            clearSupabaseAuthStorage()
            set({ user: null, session: null, profile: null, initialized: true, loading: false })
            setTimeout(() => alert('Your account is unable to login due to suspension by the admin.'), 100)
            return
          }

          // Check if profile completion flag exists in localStorage override
          const localCompleted = localStorage.getItem(`flatsnfood_completed_profile_${userId}`) === 'true'
          const finalProfile = localCompleted ? { ...data, is_profile_completed: true } : data

          set({ profile: finalProfile, initialized: true, loading: false })
          return
        }

        // Profile missing in DB - auto create initial profile from OAuth metadata
        const authUserRes = await supabase.auth.getUser()
        const authUser = authUserRes.data.user
        
        if (authUser) {
          const pendingRole = (localStorage.getItem('pending_user_role') as UserRole) || 'student'
          const fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User'
          const avatarUrl = authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || ''

          const localCompleted = localStorage.getItem(`flatsnfood_completed_profile_${userId}`) === 'true'

          const newProfile: Profile = {
            id: userId,
            email: authUser.email || '',
            full_name: fullName,
            avatar_url: avatarUrl,
            role: pendingRole === 'admin' ? 'student' : pendingRole,
            phone: authUser.user_metadata?.phone || '',
            is_profile_completed: localCompleted,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          const { error: insertErr } = await supabase.from('profiles').upsert([newProfile], { onConflict: 'id' })
          if (insertErr) {
            console.warn('Initial profile insert warning:', insertErr.message)
          }

          localStorage.removeItem('pending_user_role')
          set({ profile: newProfile, initialized: true, loading: false })
          return
        }

        throw new Error('User authentication session expired')
      } catch (error) {
        console.warn('Error fetching or creating profile in DB:', error)
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

      // 1. Immediate optimistic update in Zustand store
      set({ profile: updatedProfile })

      // 2. Persist in localStorage to prevent modal re-looping
      try {
        if (updatedProfile.is_profile_completed) {
          localStorage.setItem(`flatsnfood_completed_profile_${currentProfile.id}`, 'true')
        }
        const demoUserStr = localStorage.getItem('campusnest_demo_user')
        if (demoUserStr) {
          const parsed = JSON.parse(demoUserStr)
          localStorage.setItem('campusnest_demo_user', JSON.stringify({ ...parsed, ...updates }))
        }
      } catch (e) {
        // Ignore localStorage error
      }

      // 3. Upsert to Supabase Database `profiles` table
      try {
        const dbPayload: Record<string, any> = {
          id: currentProfile.id,
          email: currentProfile.email || '',
          full_name: updatedProfile.full_name || '',
          phone: updatedProfile.phone || '',
          gender: updatedProfile.gender || 'male',
          role: updatedProfile.role || 'student',
          avatar_url: updatedProfile.avatar_url || '',
          college: updatedProfile.college || '',
          branch: updatedProfile.branch || '',
          bio: updatedProfile.bio || '',
          is_profile_completed: Boolean(updatedProfile.is_profile_completed),
          updated_at: new Date().toISOString()
        }

        const { error: upsertErr } = await supabase
          .from('profiles')
          .upsert(dbPayload, { onConflict: 'id' })

        if (upsertErr) {
          console.error('Supabase profile upsert error:', upsertErr)
          const { error: updateErr } = await supabase
            .from('profiles')
            .update(dbPayload)
            .eq('id', currentProfile.id)

          if (updateErr) {
            console.error('Supabase profile update error:', updateErr)
            return { success: false, error: updateErr.message }
          }
        }

        // 4. Update Auth user metadata
        await supabase.auth.updateUser({
          data: {
            full_name: updatedProfile.full_name,
            phone: updatedProfile.phone,
            role: updatedProfile.role,
            gender: updatedProfile.gender,
            is_profile_completed: updatedProfile.is_profile_completed,
          }
        }).catch(() => {})

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
      set({ user: null, session: null, profile: null, initialized: true, loading: false })
    },
  })
)
