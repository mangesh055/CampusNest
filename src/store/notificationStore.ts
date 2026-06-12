import { create } from 'zustand'

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
  }
}))
