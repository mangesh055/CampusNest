import { create } from 'zustand'
import type { Property } from '../types'
import { supabase } from '../lib/supabase'

interface PropertyState {
  properties: Property[]
  loading: boolean
  loadProperties: () => Promise<void>
  addProperty: (property: Omit<Property, 'id' | 'rating' | 'review_count' | 'verified' | 'created_at' | 'updated_at'>) => Promise<{success: boolean, error?: string}>
  updateProperty: (id: string, updates: Partial<Property>) => Promise<{success: boolean, error?: string}>
  incrementPropertyViews: (id: string) => Promise<void>
  updatePropertyRating: (id: string, rating: number, count: number) => Promise<void>
  toggleAvailability: (id: string) => void
  deleteProperty: (id: string) => void
}

export const usePropertyStore = create<PropertyState>()(
  (set, get) => ({
    properties: [],
    loading: false,
    loadProperties: async () => {
      set({ loading: true })
      const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false })
      if (error) {
        console.error('Failed to load properties from Supabase:', error)
        set({ properties: [], loading: false })
        return
      }
      set({ properties: (data || []) as Property[], loading: false })
    },
  addProperty: async (newProp) => {
      const created: Property = {
        ...newProp,
        id: `prop-${Date.now()}`,
        rating: 5.0,
        review_count: 0,
        views: 0,
        inquiries: 0,
        verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      let { error } = await supabase.from('properties').insert([created])
      
      // Fallback if the google_maps_url column hasn't been added to the database yet
      if (error && error.message.includes('google_maps_url')) {
        console.warn('google_maps_url column missing, retrying without it...')
        const fallbackCreated = { ...created }
        delete fallbackCreated.google_maps_url
        const retryResult = await supabase.from('properties').insert([fallbackCreated])
        error = retryResult.error
      }

      if (error) {
        console.error('Supabase insert error for property:', error.message)
        return { success: false, error: error.message }
      }

      set((state) => ({ properties: [created, ...state.properties] }))
      return { success: true }
    },
    updateProperty: async (id, updates) => {
      let { error } = await supabase.from('properties').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
      
      // Fallback if the google_maps_url column hasn't been added to the database yet
      if (error && error.message.includes('google_maps_url')) {
        console.warn('google_maps_url column missing, retrying update without it...')
        const fallbackUpdates = { ...updates }
        delete fallbackUpdates.google_maps_url
        const retryResult = await supabase.from('properties').update({ ...fallbackUpdates, updated_at: new Date().toISOString() }).eq('id', id)
        error = retryResult.error
      }

      if (error) {
        console.error('Failed to update property in Supabase:', error)
        return { success: false, error: error.message }
      }

      set((state) => ({
        properties: state.properties.map(p => p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p)
      }))
      return { success: true }
    },
    incrementPropertyViews: async (id) => {
      // Optimistic update
      set((state) => ({
        properties: state.properties.map(p => p.id === id ? { ...p, views: (p.views || 0) + 1 } : p)
      }))
      // Background sync via RPC to bypass RLS
      await supabase.rpc('increment_property_views', { property_id: id })
    },
    updatePropertyRating: async (id, rating, count) => {
      // Optimistic update
      set((state) => ({
        properties: state.properties.map(p => p.id === id ? { ...p, rating, review_count: count } : p)
      }))
      // Background sync via RPC to bypass RLS
      await supabase.rpc('update_property_rating', { property_id: id, new_rating: rating, new_count: count })
    },
    toggleAvailability: async (id) => {
      const current = get().properties.find((item) => item.id === id)
      if (!current) return
      const nextAvailability = !current.availability
      const { error } = await supabase.from('properties').update({ availability: nextAvailability }).eq('id', id)
      if (error) {
        console.error('Failed to update property availability:', error)
        return
      }
      set((state) => ({
        properties: state.properties.map(p => p.id === id ? { ...p, availability: nextAvailability } : p)
      }))
    },
    deleteProperty: async (id) => {
      const { error } = await supabase.from('properties').delete().eq('id', id)
      if (error) {
        console.error('Failed to delete property:', error)
        return
      }
      set((state) => ({
        properties: state.properties.filter(p => p.id !== id)
      }))
    }
  })
)
