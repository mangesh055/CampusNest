import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Building2, Utensils, Users, MessageCircle, Bell,
  Heart, Search, Menu, X, Sun, Moon, ChevronDown, LogOut,
  Settings, User, LayoutDashboard, Shield, Star, QrCode
} from 'lucide-react'
import { cn, getInitials } from '../../lib/utils'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'
import { supabase } from '../../lib/supabase'

const navLinks = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Properties', path: '/properties', icon: Building2 },
  { label: 'Mess', path: '/mess', icon: Utensils },
  { label: 'Roommates', path: '/roommates', icon: Users },
  { label: 'Marketplace', path: '/community', icon: MessageCircle },
]

interface NavbarProps {
  darkMode: boolean
  toggleDarkMode: () => void
}

export default function Navbar({ darkMode, toggleDarkMode }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, signOut } = useAuthStore()
  const { unreadCount, init } = useNotificationStore()

  // Mess Status State (for Mess Owners only)
  const [myMess, setMyMess] = useState<any>(null)

  useEffect(() => {
    if (profile?.role === 'mess_owner') {
      const fetchMess = async () => {
        try {
          const { data } = await supabase.from('messes').select('*').eq('owner_id', profile.id).single()
          if (data) {
            setMyMess(data)
          }
        } catch (e) {
          console.warn('Failed to fetch mess profile for navbar', e)
        }
      }
      fetchMess()
    }
  }, [profile])

  const toggleMessStatus = async () => {
    if (!myMess || !profile) return
    const newStatus = myMess.status === 'open' ? 'closed' : 'open'
    const updated = { ...myMess, status: newStatus }
    setMyMess(updated)
    
    try {
      await supabase.from('messes').update({ status: newStatus }).eq('id', myMess.id)
    } catch (e) {
      console.warn('Failed to update status', e)
    }
  }

  // Auto-close mess if past service hours
  useEffect(() => {
    if (!myMess || myMess.status !== 'open' || !myMess.service_hours) return

    const checkTimeAndClose = async () => {
      try {
        const parts = myMess.service_hours.split('-')
        if (parts.length === 2) {
          const closingTimeStr = parts[1].trim()
          const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)/i
          const match = closingTimeStr.match(timeRegex)
          
          if (match) {
            let hours = parseInt(match[1])
            const minutes = parseInt(match[2])
            const period = match[3].toUpperCase()
            
            if (period === 'PM' && hours !== 12) hours += 12
            if (period === 'AM' && hours === 12) hours = 0
            
            const now = new Date()
            const currentHours = now.getHours()
            const currentMinutes = now.getMinutes()
            
            if (currentHours > hours || (currentHours === hours && currentMinutes >= minutes)) {
              setMyMess((prev: any) => prev ? { ...prev, status: 'closed' } : prev)
              await supabase.from('messes').update({ status: 'closed' }).eq('id', myMess.id)
            }
          }
        }
      } catch (e) {
        console.warn('Auto close check failed', e)
      }
    }

    checkTimeAndClose() // Check immediately on mount/update
    const interval = setInterval(checkTimeAndClose, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [myMess?.status, myMess?.service_hours, myMess?.id])

  useEffect(() => {
    init()
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      
      // Close dropdowns when scrolling more than 15px
      if (Math.abs(window.scrollY - lastScrollY) > 15) {
        setMenuOpen(false)
        setProfileOpen(false)
        lastScrollY = window.scrollY
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [init])

  useEffect(() => {
    setMenuOpen(false)
    setProfileOpen(false)
  }, [location])

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const getDashboardPath = () => {
    if (!profile) return '/auth'
    const paths: Record<string, string> = {
      student: '/dashboard/student',
      property_owner: '/dashboard/owner',
      mess_owner: '/dashboard/mess',
      admin: '/dashboard/admin',
    }
    return paths[profile.role] || '/dashboard/student'
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled || menuOpen
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-md border-b border-slate-200/50 dark:border-slate-700/50'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold">
              <span className="gradient-text">FlatsN</span>
              <span className="text-slate-900 dark:text-white">Food</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  'nav-link text-sm hover:scale-105 active:scale-95 transition-transform duration-200',
                  location.pathname === path && 'active'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="btn-ghost p-2 rounded-xl hover:scale-110 hover:rotate-12 active:scale-95 transition-all duration-200"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {profile ? (
              <>
                {/* Mess Status Toggle (Only for mess owners) */}
                {profile.role === 'mess_owner' && myMess && (
                  <div className="hidden md:flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mr-2 items-center">
                    <button
                      onClick={() => { if (myMess.status !== 'open') toggleMessStatus() }}
                      className={cn(
                        'px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all',
                        myMess.status === 'open' 
                          ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      )}
                    >
                      OPEN
                    </button>
                    <button
                      onClick={() => { if (myMess.status === 'closed') return; toggleMessStatus() }}
                      className={cn(
                        'px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all',
                        myMess.status === 'closed' 
                          ? 'bg-white dark:bg-slate-700 text-red-600 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      )}
                    >
                      CLOSED
                    </button>
                  </div>
                )}

                {/* Notifications */}
                <Link to="/notifications" className="relative btn-ghost p-2 rounded-xl hover:scale-110 active:scale-95 transition-all duration-200 group">
                  <Bell className="w-4 h-4 group-hover:animate-bounce-subtle" />
                  {unreadCount > 0 && (
                    <span className="notif-dot text-[9px]">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </Link>

                {/* Favorites */}
                <Link to="/favorites" className="btn-ghost p-2 rounded-xl hidden sm:flex">
                  <Heart className="w-4 h-4" />
                </Link>

                {/* Scan Button (For Walk-ins / Students) */}
                {profile.role !== 'admin' && (
                  <Link to="/dashboard/student/scan" className="btn-secondary hidden sm:flex items-center gap-1.5 p-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300">
                    <QrCode className="w-4 h-4" /> Scan QR
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {getInitials(profile.full_name || 'User')}
                      </div>
                    )}
                    <span className="text-sm font-medium hidden sm:block max-w-20 truncate text-slate-700 dark:text-slate-300">
                      {profile.full_name?.split(' ')[0]}
                    </span>
                    <ChevronDown className={cn('w-3 h-3 text-slate-500 transition-transform', profileOpen && 'rotate-180')} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-200 dark:border-slate-700 overflow-hidden"
                      >
                        <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile.full_name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{profile.email}</p>
                          <span className="badge badge-purple mt-1 text-[10px]">
                            {profile.role.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="p-2">
                          {profile.role !== 'admin' && (
                            <Link to={getDashboardPath()} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 transition-colors">
                              <LayoutDashboard className="w-4 h-4" /> Dashboard
                            </Link>
                          )}
                          {profile.role === 'student' && (
                            <Link to="/dashboard/student/scan" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 transition-colors">
                              <QrCode className="w-4 h-4" /> Scan QR
                            </Link>
                          )}
                          <Link to="/dashboard/profile" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 transition-colors">
                            <User className="w-4 h-4" /> Profile
                          </Link>
                          <Link to="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 transition-colors">
                            <Settings className="w-4 h-4" /> Settings
                          </Link>
                          {profile.role === 'admin' && (
                            <Link to="/dashboard/admin" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 transition-colors">
                              <Shield className="w-4 h-4" /> Admin Panel
                            </Link>
                          )}
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 dark:text-red-400 transition-colors mt-1"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link to="/auth?tab=register" className="btn-primary text-xs sm:text-sm py-1.5 px-3 sm:py-2 sm:px-4 whitespace-nowrap">Get Started</Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden btn-ghost p-2 rounded-xl"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="md:hidden absolute top-[70px] right-4 w-60 bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
          >
            <div className="p-2">
              {navLinks.map(({ label, path, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors mb-1',
                    location.pathname === path
                      ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
