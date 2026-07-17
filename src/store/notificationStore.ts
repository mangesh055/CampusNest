import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export interface AppNotification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
  link?: string
}

interface NotificationState {
  notifications: AppNotification[]
  unreadCount: number
  init: () => void
  addNotification: (notif: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  fetchServerNotifications: (userId: string) => Promise<void>
}

const defaultNotifications: AppNotification[] = [
  {
    id: 'n1',
    title: 'Welcome to CampusNest!',
    message: 'Complete your profile to get the best housing and mess recommendations.',
    type: 'info',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'n2',
    title: 'Payment Successful',
    message: 'Your subscription to Maa Ki Rasoi was successful.',
    type: 'success',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'n3',
    title: 'Upcoming Expiry',
    message: 'Your meal plan expires in 3 days. Renew now to avoid interruption.',
    type: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
]

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  init: () => {
    try {
      const saved = localStorage.getItem('campusnest-notifications')
      if (saved) {
        const parsed = JSON.parse(saved)
        set({ notifications: parsed, unreadCount: parsed.filter((n: any) => !n.read).length })
      } else {
        set({ notifications: defaultNotifications, unreadCount: defaultNotifications.filter(n => !n.read).length })
        localStorage.setItem('campusnest-notifications', JSON.stringify(defaultNotifications))
      }
    } catch (e) {
      set({ notifications: defaultNotifications, unreadCount: defaultNotifications.filter(n => !n.read).length })
    }
  },
  addNotification: (notif) => {
    const newNotif: AppNotification = {
      ...notif,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date().toISOString()
    }
    const updated = [newNotif, ...get().notifications]
    set({ notifications: updated, unreadCount: updated.filter(n => !n.read).length })
    localStorage.setItem('campusnest-notifications', JSON.stringify(updated))
  },
  markAsRead: (id) => {
    const updated = get().notifications.map(n => n.id === id ? { ...n, read: true } : n)
    set({ notifications: updated, unreadCount: updated.filter(n => !n.read).length })
    localStorage.setItem('campusnest-notifications', JSON.stringify(updated))
  },
  markAllAsRead: () => {
    const updated = get().notifications.map(n => ({ ...n, read: true }))
    set({ notifications: updated, unreadCount: 0 })
    localStorage.setItem('campusnest-notifications', JSON.stringify(updated))
  },
  clearAll: () => {
    set({ notifications: [], unreadCount: 0 })
    localStorage.setItem('campusnest-notifications', JSON.stringify([]))
  },
  fetchServerNotifications: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('app_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      if (data && data.length > 0) {
        const serverNotifs: AppNotification[] = data.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type as 'info' | 'success' | 'warning' | 'error',
          read: n.read,
          createdAt: n.created_at,
          link: n.link
        }))
        
        // Merge with existing local notifications, avoiding duplicates
        const existing = get().notifications
        const merged = [...serverNotifs]
        
        existing.forEach(local => {
          if (!merged.some(s => s.id === local.id)) {
            merged.push(local)
          }
        })
        
        merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        
        set({ notifications: merged, unreadCount: merged.filter(n => !n.read).length })
        localStorage.setItem('campusnest-notifications', JSON.stringify(merged))
        
        // Mark as read in server so we don't fetch as unread again
        const unreadIds = data.filter(n => !n.read).map(n => n.id)
        if (unreadIds.length > 0) {
           await supabase.from('app_notifications').update({ read: true }).in('id', unreadIds)
        }
      }
    } catch (e) {
      console.error('Failed to fetch server notifications', e)
    }
  }
}))
