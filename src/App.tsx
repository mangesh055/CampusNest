import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PropertiesPage from './pages/PropertiesPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import MessPage from './pages/MessPage'
import MessDetailPage from './pages/MessDetailPage'
import AuthPage from './pages/AuthPage'
import RoommatesPage from './pages/RoommatesPage'
import RoommateDetailPage from './pages/RoommateDetailPage'
import CommunityPage from './pages/CommunityPage'
import NotificationsPage from './pages/NotificationsPage'
import TermsConditionsPage from './pages/TermsConditionsPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import CommunityGuidelinesPage from './pages/CommunityGuidelinesPage'
import GrievanceRedressalPage from './pages/GrievanceRedressalPage'
import HelpCenterPage from './pages/HelpCenterPage'

// Dashboard pages
import DashboardLayout from './components/layout/DashboardLayout'
import StudentDashboard from './pages/dashboard/StudentDashboard'
import QRScanPage from './pages/dashboard/QRScanPage'
import OwnerDashboard from './pages/dashboard/OwnerDashboard'
import MessOwnerDashboard from './pages/dashboard/MessOwnerDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'

import SettingsPage from './pages/dashboard/SettingsPage'
import ProfilePage from './pages/dashboard/ProfilePage'

// Layouts
import PublicLayout from './components/layout/PublicLayout'
import ProtectedRoute from './components/ProtectedRoute'

// Types
import { useAuthStore } from './store/authStore'
import { useNotificationStore } from './store/notificationStore'
import { clearSupabaseAuthStorage } from './lib/localAuth'

function DashboardRedirect() {
  const { profile } = useAuthStore()
  if (!profile) return <Navigate to="/auth" replace />

  switch (profile.role) {
    case 'student':
      return <Navigate to="/dashboard/student" replace />
    case 'property_owner':
      return <Navigate to="/dashboard/owner" replace />
    case 'mess_owner':
      return <Navigate to="/dashboard/mess" replace />
    case 'admin':
      return <Navigate to="/dashboard/admin" replace />
    default:
      return <Navigate to="/auth" replace />
  }
}

import { supabase } from './lib/supabase'

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  const { setUser, setSession, fetchProfile, setLoading } = useAuthStore()

  useEffect(() => {
    let mounted = true
    let unsubscribeRealtime: (() => void) | null = null

    const hydrate = async () => {
      const { data } = await supabase.auth.getSession()
      const session = data.session ?? null

      if (!mounted) return

      if (session?.user) {
        setSession(session)
        setUser(session.user)
        await fetchProfile(session.user.id)
        await useNotificationStore.getState().fetchServerNotifications(session.user.id)
        unsubscribeRealtime = useNotificationStore.getState().subscribeToRealtime(session.user.id)
      } else {
        setSession(null)
        setUser(null)
        useAuthStore.getState().setProfile(null)
      }

      if (mounted) setLoading(false)
    }

    hydrate()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      // Clean up previous realtime channel if any
      if (unsubscribeRealtime) {
        unsubscribeRealtime()
        unsubscribeRealtime = null
      }
      if (session?.user) {
        setSession(session)
        setUser(session.user)
        await fetchProfile(session.user.id)
        await useNotificationStore.getState().fetchServerNotifications(session.user.id)
        unsubscribeRealtime = useNotificationStore.getState().subscribeToRealtime(session.user.id)
      } else {
        setSession(null)
        setUser(null)
        useAuthStore.getState().setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
      if (unsubscribeRealtime) unsubscribeRealtime()
    }
  }, [setUser, setSession, setLoading])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode(!darkMode)

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes wrapped in PublicLayout */}
        <Route element={<PublicLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/mess" element={<MessPage />} />
          <Route path="/mess/:id" element={<MessDetailPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/roommates" element={<RoommatesPage />} />
          <Route path="/roommates/:id" element={<RoommateDetailPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/favorites" element={<PropertiesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/terms-conditions" element={<TermsConditionsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/community-guidelines" element={<CommunityGuidelinesPage />} />
          <Route path="/grievance-redressal" element={<GrievanceRedressalPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
        </Route>

        {/* Dashboard Redirect Handler */}
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Dashboard Routes wrapped in DashboardLayout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="student" element={<StudentDashboard />} />
            <Route path="student/scan" element={<QRScanPage />} />
            <Route path="student/subscription" element={<StudentDashboard />} />
            <Route path="student/attendance" element={<StudentDashboard />} />
          </Route>
          
          {/* Owner Routes */}
          <Route element={<ProtectedRoute allowedRoles={['property_owner']} />}>
            <Route path="owner" element={<OwnerDashboard />} />
            <Route path="owner/listings" element={<OwnerDashboard />} />
          </Route>
          
          {/* Mess Owner Routes */}
          <Route element={<ProtectedRoute allowedRoles={['mess_owner']} />}>
            <Route path="mess" element={<MessOwnerDashboard />} />
            <Route path="mess/menu" element={<MessOwnerDashboard />} />
            <Route path="mess/menucard" element={<MessOwnerDashboard />} />
            <Route path="mess/plans" element={<MessOwnerDashboard />} />
            <Route path="mess/subscribers" element={<MessOwnerDashboard />} />
            <Route path="mess/attendance" element={<MessOwnerDashboard />} />
            <Route path="mess/qr" element={<MessOwnerDashboard />} />
            <Route path="mess/analytics" element={<MessOwnerDashboard />} />
            <Route path="mess/payments" element={<MessOwnerDashboard />} />
            <Route path="mess/reports" element={<MessOwnerDashboard />} />
            <Route path="mess/settings" element={<MessOwnerDashboard />} />
          </Route>
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/users" element={<AdminDashboard />} />
            <Route path="admin/properties" element={<AdminDashboard />} />
            <Route path="admin/messes" element={<AdminDashboard />} />
            <Route path="admin/analytics" element={<AdminDashboard />} />
            <Route path="admin/roommates" element={<AdminDashboard />} />
            <Route path="admin/community" element={<AdminDashboard />} />
          </Route>

          {/* Shared Authenticated Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Catch All Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
