import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export interface PropertyVisit {
  id: string
  property_id: string
  property_title: string
  property_image?: string
  owner_id: string
  student_id: string
  student_name: string
  student_phone: string
  visit_date: string // e.g. "Jul 24, 2026"
  day_label: string // e.g. "Tomorrow"
  time_slot: string // e.g. "11:00 AM"
  status: 'pending' | 'accepted' | 'declined' | 'completed'
  created_at: string
}

interface VisitState {
  visits: PropertyVisit[]
  loading: boolean
  loadVisits: () => Promise<void>
  addVisit: (visit: Omit<PropertyVisit, 'id' | 'created_at' | 'status'>) => Promise<PropertyVisit>
  updateVisitStatus: (id: string, status: PropertyVisit['status']) => Promise<void>
  getVisitsForOwner: (ownerId: string, propertyIds?: string[]) => PropertyVisit[]
  getVisitsForStudent: (studentId: string) => PropertyVisit[]
}

const initialMockVisits: PropertyVisit[] = [
  {
    id: 'visit-101',
    property_id: 'prop-1',
    property_title: 'Sunrise Heights Luxury PG',
    property_image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600',
    owner_id: 'owner1',
    student_id: 'student-1',
    student_name: 'Rahul Sharma',
    student_phone: '9876543210',
    visit_date: 'Jul 24, 2026',
    day_label: 'Tomorrow',
    time_slot: '11:00 AM',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'visit-102',
    property_id: 'prop-2',
    property_title: 'Green View 2BHK Apartment',
    property_image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
    owner_id: 'owner1',
    student_id: 'student-2',
    student_name: 'Ananya Patel',
    student_phone: '9812345678',
    visit_date: 'Jul 25, 2026',
    day_label: 'Sat',
    time_slot: '03:00 PM',
    status: 'accepted',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'visit-103',
    property_id: 'prop-1',
    property_title: 'Sunrise Heights Luxury PG',
    property_image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600',
    owner_id: 'owner1',
    student_id: 'student-3',
    student_name: 'Vikas Kulkarni',
    student_phone: '9765432109',
    visit_date: 'Jul 26, 2026',
    day_label: 'Sun',
    time_slot: '06:00 PM',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  }
]

export const useVisitStore = create<VisitState>()(
  persist(
    (set, get) => ({
      visits: initialMockVisits,
      loading: false,

      loadVisits: async () => {
        set({ loading: true })
        try {
          const { data, error } = await supabase
            .from('property_visits')
            .select('*')
            .order('created_at', { ascending: false })

          if (error) {
            console.warn('Failed to load visits from Supabase (using cached/mock state):', error.message)
            set({ loading: false })
            return
          }

          if (data && data.length > 0) {
            set({ visits: data as PropertyVisit[], loading: false })
          } else {
            // Keep initial mock visits if table is currently empty in DB
            set({ loading: false })
          }
        } catch (err) {
          console.warn('Visit fetch error:', err)
          set({ loading: false })
        }
      },

      addVisit: async (newVisitData) => {
        const newVisit: PropertyVisit = {
          ...newVisitData,
          id: `visit-${Date.now()}`,
          status: 'pending',
          created_at: new Date().toISOString(),
        }

        // Optimistic UI update
        set((state) => ({ visits: [newVisit, ...state.visits] }))

        // Insert into Supabase
        const { error } = await supabase.from('property_visits').insert([newVisit])
        if (error) {
          console.warn('Failed to insert visit to Supabase DB:', error.message)
        }

        return newVisit
      },

      updateVisitStatus: async (id, status) => {
        // Optimistic UI update
        set((state) => ({
          visits: state.visits.map((v) => (v.id === id ? { ...v, status } : v)),
        }))

        // Update in Supabase
        const { error } = await supabase
          .from('property_visits')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id)

        if (error) {
          console.warn('Failed to update visit status in Supabase:', error.message)
        }
      },

      getVisitsForOwner: (ownerId, propertyIds = []) => {
        const state = get()
        const propIdSet = new Set(propertyIds)
        return state.visits.filter((v) =>
          v.owner_id === ownerId ||
          propIdSet.has(v.property_id) ||
          v.owner_id === 'owner1' ||
          !v.owner_id ||
          ownerId === 'owner1'
        )
      },

      getVisitsForStudent: (studentId) => {
        const state = get()
        return state.visits.filter((v) => v.student_id === studentId)
      },
    }),
    {
      name: 'campusnest_property_visits',
    }
  )
)
