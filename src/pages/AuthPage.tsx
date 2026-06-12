import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Phone, Building2, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { UserRole } from '../types'

const roles: { value: UserRole; label: string; icon: string; desc: string }[] = [
  { value: 'student', label: 'Student', icon: '🎓', desc: 'Find PGs, messes & roommates' },
  { value: 'property_owner', label: 'Property Owner', icon: '🏠', desc: 'List your PGs & flats' },
  { value: 'mess_owner', label: 'Mess Owner', icon: '🍽️', desc: 'Manage your mess digitally' },
  { value: 'admin', label: 'Admin', icon: '🛡️', desc: 'Platform management' },
]

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole>('student')

  const [form, setForm] = useState({
    email: '', password: '', fullName: '', phone: '',
  })

  const { setUser, setSession, fetchProfile } = useAuthStore()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (error) throw error
      setUser(data.user)
      setSession(data.session)
      if (data.user) await fetchProfile(data.user.id)
      navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            phone: form.phone,
            role: selectedRole,
          },
        },
      })
      if (error) throw error
      
      if (data.user) {
        // Manually insert into profiles table since there might be no trigger
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: form.fullName,
          phone: form.phone,
          role: selectedRole,
          email: form.email,
        })
      }
      
      if (data.session) {
        setUser(data.user)
        setSession(data.session)
        if (data.user) await fetchProfile(data.user.id)
        setSuccess('Account created! Logging in...')
        setTimeout(() => {
          navigate('/')
        }, 1500)
      } else {
        setSuccess('Account created! Check your email to verify your account.')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  // Demo login for testing
  const handleDemoLogin = (role: UserRole) => {
    const demoProfiles: Record<UserRole, { email: string; name: string }> = {
      student: { email: 'student@demo.com', name: 'Rahul Sharma' },
      property_owner: { email: 'owner@demo.com', name: 'Priya Mehta' },
      mess_owner: { email: 'mess@demo.com', name: 'Suresh Kumar' },
      admin: { email: 'admin@demo.com', name: 'Admin User' },
    }
    const demo = demoProfiles[role]
    const { setProfile } = useAuthStore.getState()
    setProfile({
      id: `demo-${role}`,
      email: demo.email,
      full_name: demo.name,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    const paths: Record<UserRole, string> = {
      student: '/dashboard/student',
      property_owner: '/dashboard/owner',
      mess_owner: '/dashboard/mess',
      admin: '/dashboard/admin',
    }
    navigate(paths[role])
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-brand-950 via-slate-900 to-slate-950">
      {/* Left Panel */}
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
            <span className="text-2xl font-display font-bold text-white">CampusNest</span>
          </Link>

          <h1 className="text-5xl font-display font-bold text-white leading-tight mb-4">
            Your perfect<br />
            <span className="gradient-text">student life</span><br />
            starts here
          </h1>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            Find PGs, hostels, flats & mess services near your college. 
            India's smartest student housing platform.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '🏠', label: '1,200+ Properties', sub: 'PGs, Hostels & Flats' },
              { icon: '🍽️', label: '400+ Mess Services', sub: 'Digital attendance' },
              { icon: '👥', label: '5,000+ Students', sub: 'Active community' },
              { icon: '⭐', label: '4.8 Rating', sub: 'Trusted platform' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-white font-semibold text-sm">{stat.label}</div>
                <div className="text-slate-400 text-xs">{stat.sub}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-glass p-8">
            {/* Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-2xl p-1 mb-8">
              {(['login', 'register'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    tab === t
                      ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {t === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab === 'login' ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="input-field pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="text-right mt-1">
                      <Link to="/forgot-password" className="text-xs text-brand-600 hover:underline">Forgot password?</Link>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? <span className="animate-spin">⏳</span> : 'Sign In'}
                  </button>

                  <div className="relative flex items-center gap-3 my-2">
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                    <span className="text-xs text-slate-400">or continue with</span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-medium text-sm"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>

                  {/* Demo Logins */}
                  <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 text-center">🚀 Demo Access (No signup needed)</p>
                    <div className="grid grid-cols-2 gap-2">
                      {roles.map(role => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => handleDemoLogin(role.value)}
                          className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all text-left"
                        >
                          <span className="text-lg">{role.icon}</span>
                          <div>
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{role.label}</p>
                            <p className="text-[9px] text-slate-400 leading-tight">{role.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleRegister}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input name="fullName" type="text" value={form.fullName} onChange={handleChange}
                        placeholder="Rahul Sharma" className="input-field pl-10" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input name="email" type="email" value={form.email} onChange={handleChange}
                        placeholder="you@example.com" className="input-field pl-10" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                        placeholder="+91 98765 43210" className="input-field pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange}
                        placeholder="Min 8 characters" className="input-field pl-10 pr-10" required minLength={8} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">I am a...</label>
                    <div className="grid grid-cols-2 gap-2">
                      {roles.map(role => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => setSelectedRole(role.value)}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                            selectedRole === role.value
                              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                              : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xl">{role.icon}</span>
                          <div>
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{role.label}</p>
                            <p className="text-[9px] text-slate-400 leading-tight">{role.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                    </div>
                  )}
                  {success && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />{success}
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? <span className="animate-spin">⏳</span> : 'Create Account'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
