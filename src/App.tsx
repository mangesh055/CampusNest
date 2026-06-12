import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PropertiesPage from './pages/PropertiesPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import MessPage from './pages/MessPage'
import MessDetailPage from './pages/MessDetailPage'
import AuthPage from './pages/AuthPage'
import ChatPage from './pages/ChatPage'
import RoommatesPage from './pages/RoommatesPage'
import CommunityPage from './pages/CommunityPage'
import NotificationsPage from './pages/NotificationsPage'

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

// Types
import { useAuthStore } from './store/authStore'

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
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        useAuthStore.getState().setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setSession, fetchProfile, setLoading])

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
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/roommates" element={<RoommatesPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/favorites" element={<PropertiesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        {/* Dashboard Redirect Handler */}
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Dashboard Routes wrapped in DashboardLayout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="student" element={<StudentDashboard />} />
          <Route path="student/scan" element={<QRScanPage />} />
          <Route path="student/subscription" element={<StudentDashboard />} />
          <Route path="student/attendance" element={<StudentDashboard />} />
          
          <Route path="owner" element={<OwnerDashboard />} />
          <Route path="owner/listings" element={<OwnerDashboard />} />
          
          <Route path="mess" element={<MessOwnerDashboard />} />
          <Route path="mess/menu" element={<MessOwnerDashboard />} />
          <Route path="mess/plans" element={<MessOwnerDashboard />} />
          <Route path="mess/subscribers" element={<MessOwnerDashboard />} />
          <Route path="mess/attendance" element={<MessOwnerDashboard />} />
          <Route path="mess/qr" element={<MessOwnerDashboard />} />
          <Route path="mess/analytics" element={<MessOwnerDashboard />} />
          <Route path="mess/payments" element={<MessOwnerDashboard />} />
          <Route path="mess/reports" element={<MessOwnerDashboard />} />
          <Route path="mess/settings" element={<MessOwnerDashboard />} />
          
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/users" element={<AdminDashboard />} />
          <Route path="admin/properties" element={<AdminDashboard />} />
          <Route path="admin/messes" element={<AdminDashboard />} />
          <Route path="admin/reports" element={<AdminDashboard />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Catch All Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
