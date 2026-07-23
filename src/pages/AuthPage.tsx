import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, CheckCircle2, ShieldCheck, LogIn, UserPlus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { UserRole } from '../types'

const roles: { value: UserRole; label: string; icon: string; desc: string }[] = [
  { value: 'student', label: 'Student', icon: '🎓', desc: 'Find PGs, messes & roommates near college' },
  { value: 'property_owner', label: 'Property Owner', icon: '🏠', desc: 'List your PGs, hostels & flats for free' },
  { value: 'mess_owner', label: 'Mess Owner', icon: '🍽️', desc: 'Manage meal plans & digital QR attendance' },
]

export default function AuthPage() {
  const { session, user } = useAuthStore()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin')
  const [selectedRole, setSelectedRole] = useState<UserRole>('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [stats, setStats] = useState({
    properties: '1,200+',
    messes: '400+',
    students: '5,000+',
    rating: '4.8'
  })

  // Auto-redirect logged-in users away from /auth unless they sign out
  useEffect(() => {
    if (session || user) {
      navigate('/', { replace: true })
    }
  }, [session, user, navigate])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          { count: propsCount },
          { count: messesCount },
          { count: profilesCount },
          { data: reviews }
        ] = await Promise.all([
          supabase.from('properties').select('*', { count: 'exact', head: true }),
          supabase.from('messes').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('reviews').select('rating')
        ])

        let avgRating = 4.8
        if (reviews && reviews.length > 0) {
          const validReviews = reviews.filter(r => typeof r.rating === 'number')
          if (validReviews.length > 0) {
            const sum = validReviews.reduce((acc, curr) => acc + curr.rating, 0)
            avgRating = Number((sum / validReviews.length).toFixed(1))
          }
        }

        const validProps = propsCount !== null && propsCount !== undefined ? propsCount : 0
        const validMesses = messesCount !== null && messesCount !== undefined ? messesCount : 0
        const validStudents = profilesCount !== null && profilesCount !== undefined ? profilesCount : 0

        setStats({
          properties: `${validProps}+`,
          messes: `${validMesses}+`,
          students: `${validStudents}+`,
          rating: avgRating.toString()
        })
      } catch (error) {
        console.error('Failed to load stats:', error)
      }
    }
    fetchStats()
  }, [])

  const handleGoogleLogin = async (roleOverride?: UserRole) => {
    setLoading(true)
    setError('')
    try {
      const roleToSet = activeTab === 'register' ? (roleOverride || selectedRole) : 'student'
      localStorage.setItem('pending_user_role', roleToSet)
      const redirectUrl = window.location.origin
      const { error: googleErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl },
      })
      if (googleErr) throw googleErr
    } catch (e: any) {
      console.error('Google Sign-In Error:', e)
      setError(e.message || 'Failed to initiate Google OAuth. Please check Supabase Auth settings.')
      setLoading(false)
    }
  }

  if (session || user) {
    return null
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-brand-950 via-slate-900 to-slate-950">
      {/* Left Panel - Branding & Highlights */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent-500/20 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10"
        >
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-display font-bold text-white">FlatsNFood</span>
          </Link>

          <h1 className="text-5xl font-display font-bold text-white leading-tight mb-4">
            Your perfect<br />
            <span className="gradient-text">student life</span><br />
            starts here
          </h1>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            Find PGs, hostels, flats & mess services near your college. 
            India's smartest zero-brokerage student housing platform.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '🏠', label: `${stats.properties} Properties`, sub: 'PGs, Hostels & Flats' },
              { icon: '🍽️', label: `${stats.messes} Mess Services`, sub: 'Digital attendance' },
              { icon: '👥', label: `${stats.students} Students`, sub: 'Active community' },
              { icon: '⭐', label: `${stats.rating} Rating`, sub: 'Trusted platform' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-white font-semibold text-sm">{stat.label}</div>
                <div className="text-slate-400 text-xs">{stat.sub}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Two Structured Tabs */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-8 space-y-6">
            
            {/* Structured Top Navigation Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => { setActiveTab('signin'); setError(''); }}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'signin'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setError(''); }}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'register'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {/* SECTION 1: SIGN IN TAB */}
              {activeTab === 'signin' && (
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6 pt-2"
                >
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                      Welcome Back
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Sign in with your Google account to access your dashboard
                    </p>
                  </div>

                  <div className="pt-4 space-y-4">
                    <button
                      type="button"
                      onClick={() => handleGoogleLogin()}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all font-semibold text-slate-800 dark:text-white shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
                    </button>

                    <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                      Need a new account?{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('register')}
                        className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
                      >
                        Create Account
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* SECTION 2: CREATE ACCOUNT TAB */}
              {activeTab === 'register' && (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6 pt-2"
                >
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                      <UserPlus className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                      Create Your Account
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Select your account type and continue with Google to register
                    </p>
                  </div>

                  {/* 1. Select Account Type */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      1. Select Account Type
                    </label>
                    <div className="space-y-2.5">
                      {roles.map(role => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => setSelectedRole(role.value)}
                          className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border-2 transition-all text-left ${
                            selectedRole === role.value
                              ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 shadow-sm'
                              : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700'
                          }`}
                        >
                          <span className="text-2xl shrink-0 p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm">{role.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{role.label}</p>
                              {selectedRole === role.value && (
                                <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug mt-0.5">{role.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Authenticate */}
                  <div className="pt-2 space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      2. Register with Google
                    </label>
                    <button
                      type="button"
                      onClick={() => handleGoogleLogin(selectedRole)}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all font-semibold text-slate-800 dark:text-white shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
                    </button>

                    <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('signin')}
                        className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <p className="text-center text-xs text-red-500 font-medium px-2">{error}</p>
            )}

            <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed px-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              By continuing, you agree to FlatsNFood's{' '}
              <Link to="/terms-conditions" className="underline hover:text-brand-500">Terms of Service</Link>{' '}
              and{' '}
              <Link to="/privacy-policy" className="underline hover:text-brand-500">Privacy Policy</Link>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
