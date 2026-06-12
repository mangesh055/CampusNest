import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Check, Trash2, Info, CheckCircle, AlertTriangle, XCircle, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useNotificationStore } from '../store/notificationStore'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { notifications, unreadCount, init, markAsRead, markAllAsRead, clearAll } = useNotificationStore()

  useEffect(() => {
    init()
  }, [init])

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />
      default: return <Info className="w-5 h-5 text-brand-500" />
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-brand-500 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {unreadCount} new
                  </span>
                )}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Stay updated with your campus activities</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="btn-secondary py-2 px-4 text-sm disabled:opacity-50 flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Mark all read
            </button>
            <button 
              onClick={clearAll}
              disabled={notifications.length === 0}
              className="p-2 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          {notifications.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.map((notif) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={notif.id}
                  onClick={() => !notif.read && markAsRead(notif.id)}
                  className={`p-5 flex gap-4 transition-colors cursor-pointer ${notif.read ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'bg-brand-50/50 dark:bg-brand-900/10 hover:bg-brand-50 dark:hover:bg-brand-900/20'}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h3 className={`font-semibold text-base ${notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {getTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p className={`text-sm ${notif.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-600 dark:text-slate-300 font-medium'}`}>
                      {notif.message}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="flex-shrink-0 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-brand-500 rounded-full shadow-sm shadow-brand-500/50"></div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No notifications</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">You're all caught up! We'll notify you when something new arrives.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
