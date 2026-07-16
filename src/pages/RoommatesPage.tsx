import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, Plus, Users, Shield, Compass, Sparkles, MessageSquare, Check, X, MapPin, DollarSign, BookOpen } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import type { RoommateProfile, UserRole } from '../types'
import { cn, formatCurrency } from '../lib/utils'
import { fetchRoommateProfiles } from '../lib/platformData'
import { supabase } from '../lib/supabase'

type RoommateRow = RoommateProfile & { full_name?: string | null; email?: string | null }

export default function RoommatesPage() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()
  const [roommates, setRoommates] = useState<RoommateRow[]>([])
  const [myProfile, setMyProfile] = useState<RoommateRow | null>(null)
  
  const [search, setSearch] = useState('')
  const [selectedGender, setSelectedGender] = useState<string>('')
  const [selectedFood, setSelectedFood] = useState<string>('')
  const [maxBudget, setMaxBudget] = useState<string>('')
  const [showForm, setShowForm] = useState(false)

  // Form Fields for new Roommate seeker
  const [form, setForm] = useState({
    budget_min: '4000',
    budget_max: '8000',
    college: profile?.college || 'MIT WPU',
    branch: profile?.branch || 'Information Technology',
    gender: profile?.gender || 'male',
    food_preference: 'veg' as 'veg' | 'non-veg' | 'both',
    smoking: false,
    sleep_schedule: 'flexible' as 'early_bird' | 'night_owl' | 'flexible',
    looking_for: 'any' as 'flat' | 'pg' | 'hostel' | 'any',
    description: '',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const rows = await fetchRoommateProfiles()
        setRoommates(rows as RoommateRow[])
        if (profile) {
          const myRow = (rows as RoommateRow[]).find((item) => item.student_id === profile.id) || null
          setMyProfile(myRow)
        }
      } catch (error) {
        console.error('Failed to load roommate profiles from Supabase:', error)
        setRoommates([])
        setMyProfile(null)
      }
    }

    load()
  }, [profile])

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) {
      navigate('/auth')
      return
    }

    const newProfile: RoommateRow = {
      id: `my-room-${profile.id}`,
      student_id: profile.id,
      budget_min: Number(form.budget_min) || 4000,
      budget_max: Number(form.budget_max) || 8000,
      city: 'Pune',
      college: form.college,
      branch: form.branch,
      gender: form.gender as 'male' | 'female' | 'other',
      food_preference: form.food_preference,
      smoking: form.smoking,
      sleep_schedule: form.sleep_schedule,
      looking_for: form.looking_for,
      description: form.description,
      active: true,
      created_at: new Date().toISOString(),
      full_name: profile.full_name,
      email: profile.email,
    }

    void (async () => {
      const { error } = await supabase.from('roommate_profiles').upsert([newProfile])
      if (error) {
        console.error('Failed to save roommate profile to Supabase:', error)
        return
      }

      setMyProfile(newProfile)
      setRoommates(prev => {
        const filtered = prev.filter(r => r.student_id !== profile.id)
        return [newProfile, ...filtered]
      })
      setShowForm(false)
    })()
  }

  const handleDeleteProfile = () => {
    if (!profile) return
    void (async () => {
      const { error } = await supabase.from('roommate_profiles').delete().eq('student_id', profile.id)
      if (error) {
        console.error('Failed to delete roommate profile from Supabase:', error)
        return
      }

      setMyProfile(null)
      setRoommates(prev => prev.filter(r => r.student_id !== profile.id))
    })()
  }

  // Calculate Matching Score based on preferences
  const calculateMatchScore = (other: RoommateProfile) => {
    if (!myProfile) return null
    let score = 0
    let totalCriteria = 0

    // 1. Gender Match (High importance)
    totalCriteria += 3
    if (myProfile.gender === other.gender) {
      score += 3
    }

    // 2. Budget Overlap
    totalCriteria += 2
    const overlap = Math.max(0, Math.min(myProfile.budget_max, other.budget_max) - Math.max(myProfile.budget_min, other.budget_min))
    if (overlap > 0 || (myProfile.budget_min <= other.budget_max && other.budget_min <= myProfile.budget_max)) {
      score += 2
    }

    // 3. College Match
    totalCriteria += 2
    if (myProfile.college.toLowerCase().trim() === other.college.toLowerCase().trim()) {
      score += 2
    }

    // 4. Food Preference compatibility
    totalCriteria += 1
    if (myProfile.food_preference === 'both' || other.food_preference === 'both' || myProfile.food_preference === other.food_preference) {
      score += 1
    }

    // 5. Sleep Schedule
    totalCriteria += 1
    if (myProfile.sleep_schedule === 'flexible' || other.sleep_schedule === 'flexible' || myProfile.sleep_schedule === other.sleep_schedule) {
      score += 1
    }

    return Math.round((score / totalCriteria) * 100)
  }

  // Filter roommates feed
  const filteredRoommates = roommates.filter(item => {
    // Hide our own card in listing
    if (profile && item.student_id === profile.id) return false

    if (search) {
      const q = search.toLowerCase()
      const matchesName = item.full_name?.toLowerCase().includes(q)
      const matchesCollege = item.college.toLowerCase().includes(q)
      const matchesBranch = item.branch.toLowerCase().includes(q)
      if (!matchesName && !matchesCollege && !matchesBranch) return false
    }

    if (selectedGender && item.gender !== selectedGender) return false
    if (selectedFood && item.food_preference !== selectedFood && item.food_preference !== 'both') return false
    if (maxBudget && item.budget_min > Number(maxBudget)) return false

    return true
  })

  // Sort: matching roommates first if myProfile exists
  const sortedRoommates = [...filteredRoommates].sort((a, b) => {
    if (!myProfile) return 0
    const matchA = calculateMatchScore(a) || 0
    const matchB = calculateMatchScore(b) || 0
    return matchB - matchA
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
      {/* Banner */}
      <div className="bg-gradient-to-br from-brand-900 via-slate-900 to-brand-950 text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-15" />
        <div className="absolute top-10 right-10 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10 gap-6">
          <div className="text-center md:text-left">
            <span className="badge badge-purple bg-brand-500/20 text-brand-300 border-brand-500/30 text-xs px-2.5 py-1 mb-3">
              <Sparkles className="w-3.5 h-3.5 inline mr-1" /> Smart Matching
            </span>
            <h1 className="text-3xl md:text-5xl font-display font-bold">Find a Roommate for Your Room</h1>
            <p className="text-slate-300 mt-2 max-w-lg">
              Have an empty bed? Connect with students looking for accommodation near your college. Match based on rent, diet, and lifestyle.
            </p>
          </div>
          <div className="flex gap-3">
            {!myProfile ? (
              <button onClick={() => { if (!profile) navigate('/auth'); else setShowForm(true) }} className="btn-primary flex items-center gap-2">
                <Plus className="w-5 h-5" /> Post Your Room
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl">
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Your Card is Active</p>
                  <p className="text-sm font-semibold text-white">{myProfile.college} • {myProfile.branch}</p>
                </div>
                <button onClick={handleDeleteProfile} className="btn-secondary py-1.5 px-3 bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs">
                  Remove Card
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, college, or branch..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={selectedGender} onChange={e => setSelectedGender(e.target.value)} className="input-field py-2 text-sm w-36">
              <option value="">Any Gender</option>
              <option value="male">Boys</option>
              <option value="female">Girls</option>
            </select>
            <select value={selectedFood} onChange={e => setSelectedFood(e.target.value)} className="input-field py-2 text-sm w-36">
              <option value="">Any Diet</option>
              <option value="veg">Veg Only</option>
              <option value="non-veg">Non-Veg</option>
            </select>
            <input
              type="number"
              value={maxBudget}
              onChange={e => setMaxBudget(e.target.value)}
              placeholder="Max Rent"
              className="input-field py-2 text-sm w-28"
            />
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {sortedRoommates.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No matching roommate profiles found</h3>
            <p className="text-slate-500 mt-2 mb-4">Try removing some search parameters or custom filters</p>
            <button onClick={() => { setSearch(''); setSelectedGender(''); setSelectedFood(''); setMaxBudget('') }} className="btn-primary">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedRoommates.map((item, idx) => {
              const score = calculateMatchScore(item)
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="card p-6 flex flex-col justify-between hover:shadow-card transition-all"
                >
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                          {(item.full_name || 'U').split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-slate-900 dark:text-white leading-tight">
                            {item.full_name || 'Anonymous Student'}
                          </h3>
                          <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mt-0.5">{item.college}</p>
                        </div>
                      </div>

                      {score !== null && (
                        <div className="flex flex-col items-end">
                          <span className={cn('badge text-[10px] px-2 py-0.5 font-bold',
                            score >= 80 ? 'badge-green' : score >= 60 ? 'badge-yellow' : 'badge-purple')}>
                            {score}% Match
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4 italic">
                      "{item.description}"
                    </p>

                    {/* Meta Details */}
                    <div className="space-y-2.5 border-t border-slate-100 dark:border-slate-800 pt-4 mb-5">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">{item.branch}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatCurrency(item.budget_min)} / person / month
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-700 dark:text-slate-300">Property Type: <span className="capitalize font-semibold">{item.looking_for}</span></span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-lg font-medium capitalize">
                        {item.gender}
                      </span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-lg font-medium capitalize">
                        🍲 {item.food_preference}
                      </span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-lg font-medium capitalize">
                        🕒 {item.sleep_schedule.replace('_', ' ')}
                      </span>
                      {item.smoking ? (
                        <span className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded-lg font-medium">🚬 Smoking ok</span>
                      ) : (
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg font-medium">🚭 No smoking</span>
                      )}
                    </div>
                  </div>

                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Profile Setup Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, y: 15, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-glass overflow-hidden z-10 max-h-[90vh] flex flex-col">
              
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">📝 Post Your Room Details</h3>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleCreateProfile} className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Rent per person (₹/mo)</label>
                    <input type="number" value={form.budget_min} onChange={e => setForm(prev => ({ ...prev, budget_min: e.target.value, budget_max: e.target.value }))} className="input-field text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Your College</label>
                    <input type="text" value={form.college} onChange={e => setForm(prev => ({ ...prev, college: e.target.value }))} className="input-field text-sm" placeholder="e.g. MIT WPU" required />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Your Branch / Stream</label>
                  <input type="text" value={form.branch} onChange={e => setForm(prev => ({ ...prev, branch: e.target.value }))} className="input-field text-sm" placeholder="e.g. Computer Science" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Allowed Food / Diet</label>
                    <select value={form.food_preference} onChange={e => setForm(prev => ({ ...prev, food_preference: e.target.value as any }))} className="input-field text-sm">
                      <option value="veg">Vegetarian</option>
                      <option value="non-veg">Non-Vegetarian</option>
                      <option value="both">Both / Anything</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Sleep Schedule</label>
                    <select value={form.sleep_schedule} onChange={e => setForm(prev => ({ ...prev, sleep_schedule: e.target.value as any }))} className="input-field text-sm">
                      <option value="flexible">Flexible</option>
                      <option value="early_bird">Early Bird</option>
                      <option value="night_owl">Night Owl</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Property Type</label>
                    <select value={form.looking_for} onChange={e => setForm(prev => ({ ...prev, looking_for: e.target.value as any }))} className="input-field text-sm">
                      <option value="flat">Flat sharing</option>
                      <option value="pg">PG partner</option>
                      <option value="hostel">Hostel roomie</option>
                      <option value="any">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Smoking</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, smoking: false }))} className={cn('flex-1 py-1.5 rounded-lg border text-xs font-semibold capitalize', !form.smoking ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-slate-200')}>No Smoking</button>
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, smoking: true }))} className={cn('flex-1 py-1.5 rounded-lg border text-xs font-semibold capitalize', form.smoking ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-slate-200')}>Smoking OK</button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">About the Room & Roommate Preferences</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the room, amenities, location, and the kind of roommate you are looking for..." className="input-field py-2 text-sm" required />
                </div>

                <button type="submit" className="btn-primary w-full justify-center py-3 text-sm mt-2">
                  ✓ Publish Room Details
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
