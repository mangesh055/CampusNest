import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Property } from '../types'
import { mockProperties } from '../data/mockData'
import { supabase } from '../lib/supabase'

interface PropertyState {
  properties: Property[]
  addProperty: (property: Omit<Property, 'id' | 'rating' | 'review_count' | 'verified' | 'created_at' | 'updated_at'>) => void
  toggleAvailability: (id: string) => void
  deleteProperty: (id: string) => void
}

export const usePropertyStore = create<PropertyState>()(
  persist(
    (set) => ({
      properties: mockProperties,
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
        
        try {
          // Attempt to push to Supabase so Admin Dashboard sees it dynamically
          const { error } = await supabase.from('properties').insert([created])
          if (error) console.error("Supabase insert error for property:", error.message)
        } catch (e) {
          console.warn("Could not insert property into Supabase.")
        }
        
        set((state) => ({ properties: [created, ...state.properties] }))
      },
      toggleAvailability: (id) => set((state) => ({
        properties: state.properties.map(p => p.id === id ? { ...p, availability: !p.availability } : p)
      })),
      deleteProperty: (id) => set((state) => ({
        properties: state.properties.filter(p => p.id !== id)
      }))
    }),
    {
      name: 'campus-nest-properties',
    }
  )
)
