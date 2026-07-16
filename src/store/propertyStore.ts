import { create } from 'zustand'
import type { Property } from '../types'
import { supabase } from '../lib/supabase'

interface PropertyState {
  properties: Property[]
  loading: boolean
  loadProperties: () => Promise<void>
  addProperty: (property: Omit<Property, 'id' | 'rating' | 'review_count' | 'verified' | 'created_at' | 'updated_at'>) => void
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
        verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('properties').insert([created])
      if (error) {
        console.error('Supabase insert error for property:', error.message)
        return
      }

      set((state) => ({ properties: [created, ...state.properties] }))
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
