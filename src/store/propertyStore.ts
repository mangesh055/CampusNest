import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Property } from '../types'
import { mockProperties } from '../data/mockData'

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
      addProperty: (newProp) => set((state) => {
        const created: Property = {
          ...newProp,
          id: (state.properties.length + 1).toString(),
          rating: 5.0,
          review_count: 0,
          verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        return { properties: [created, ...state.properties] }
      }),
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
