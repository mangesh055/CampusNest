import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Star, Phone, CheckCircle, ChevronLeft, Navigation2, Clock, ShieldCheck, ExternalLink, User, Utensils, Image, MessageSquare, Info } from 'lucide-react'
import { mockMesses, mockPlans } from '../data/mockData'
import { formatCurrency, mealTypeLabels, messStatusConfig } from '../lib/utils'
import { cn } from '../lib/utils'
import type { MealType } from '../types'
import { useAuthStore } from '../store/authStore'

type Tab = 'dine' | 'photos' | 'menu' | 'review'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dine',   label: 'DINE',   icon: <Utensils className="w-3.5 h-3.5" /> },
  { id: 'photos', label: 'PHOTOS', icon: <Image className="w-3.5 h-3.5" /> },
  { id: 'menu',   label: 'MENU',   icon: <MessageSquare className="w-3.5 h-3.5" /> },
  { id: 'review', label: 'REVIEW', icon: <Star className="w-3.5 h-3.5" /> },
]

const mockReviews = [
  { id: 'r1', name: 'Rahul S.', rating: 5, comment: 'Amazing food! Best mess in the area. Pure ghee rotis are a delight.', date: '12 Mar 2026' },
  { id: 'r2', name: 'Priya M.', rating: 4, comment: 'Great value for money. Lunch is always fresh and tasty. Highly recommend.', date: '8 Mar 2026' },
  { id: 'r3', name: 'Arjun K.', rating: 5, comment: 'Been eating here for 6 months. Never disappointed. Owner is very cooperative.', date: '1 Mar 2026' },
]

export default function MessDetailPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState<Tab>('dine')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const { profile } = useAuthStore()

  const [newReview, setNewReview] = useState('')
  const [newRating, setNewRating] = useState(0)
  const [reviewsList, setReviewsList] = useState(mockReviews)

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReview.trim() || newRating === 0) return

    const newR = {
      id: Date.now().toString(),
      name: profile?.full_name || 'Anonymous',
      rating: newRating,
      comment: newReview,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    setReviewsList([newR, ...reviewsList])
    setNewReview('')
    setNewRating(0)
  }

  const allMesses = (() => {
    const base = [...mockMesses]
    try {
      const custom: any[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('campusnest-mess-profile-')) {
          const v = localStorage.getItem(key)
          if (v) custom.push(JSON.parse(v))
        }
      }
      const combined = [...custom]
      base.forEach(m => { if (!combined.some(c => c.id === m.id)) combined.push(m) })
      return combined
    } catch { return base }
  })()

  const mess = allMesses.find(m => m.id === id) || allMesses[0]
  const statusCfg = messStatusConfig[mess.status as keyof typeof messStatusConfig] || messStatusConfig.open

  // Get owner details from localStorage
  const ownerDetails = (() => {
    if (mess.owner_id) {
      const stored = localStorage.getItem(`campusnest-mess-profile-${mess.owner_id}`)
      if (stored) return JSON.parse(stored)
    }
    return null
  })()

  const displayPlans = (() => {
    if (mess.owner_id) {
      const s = localStorage.getItem(`campusnest-mess-plans-${mess.owner_id}`)
      if (s) { 
        const p = JSON.parse(s).filter((x: any) => x.active)
        return p 
      }
      return [] // Dynamic messes shouldn't show fake fallback plans
    }
    const mf = mockPlans.filter(p => p.mess_id === mess.id)
    if (mf.length) return mf
    return [
      { id: `a1-${mess.id}`, name: 'Full Day Plan', description: 'Breakfast + Lunch + Dinner', price: mess.monthly_charge, duration_days: 30, meal_types: mess.meal_types },
      { id: `a2-${mess.id}`, name: 'Lunch + Dinner', description: 'Two meals daily', price: Math.round(mess.monthly_charge * 0.75), duration_days: 30, meal_types: mess.meal_types.filter((t: any) => t !== 'breakfast') },
    ]
  })()

  const menuData = (() => {
    if (mess.owner_id) { const s = localStorage.getItem(`campusnest-mess-menu-${mess.owner_id}`); if (s) return JSON.parse(s) }
    return null
  })()

  const isCustom = !mockMesses.some(m => m.id === mess.id)
  const todayMenu: Record<MealType, string[]> = menuData || (isCustom
    ? { breakfast: [], lunch: [], dinner: [], snack: [] }
    : { breakfast: ['Poha', 'Upma', 'Chai'], lunch: ['Dal Tadka', 'Rice', 'Chapati', 'Sabzi', 'Salad'], dinner: ['Rajma', 'Rice', 'Chapati', 'Dal'], snack: ['Samosa', 'Chai'] }
  )

  const photos = mess.photos && mess.photos.length > 0
    ? [...mess.photos, ...mess.photos]
    : [
        'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
        'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
        'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
        'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400',
      ]

  const googleMapsUrl = mess.latitude && mess.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${mess.latitude},${mess.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${mess.name} ${mess.address} ${mess.city}`)}`

  const serviceStart = mess.meal_types?.includes('breakfast') ? '8:00 AM' : '12:30 PM'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link to="/mess" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 mb-6 text-sm transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Mess List
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Left: Main Content ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Hero Card */}
            <div className="card overflow-hidden">
              <div className="relative h-64">
                <img
                  src={photos[0]}
                  alt={mess.name}
                  className="w-full h-full object-cover"
                />
                <div className="hero-overlay absolute inset-0" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h1 className="text-3xl font-display font-bold drop-shadow">{mess.name}</h1>
                  <div className="flex items-center gap-2 mt-1 text-sm opacity-90">
                    <MapPin className="w-4 h-4" />{mess.address}, {mess.city}
                  </div>
                </div>
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={cn('badge', statusCfg.color)}>{statusCfg.dot} {statusCfg.label}</span>
                  {mess.verified && <span className="badge badge-green">✓ Verified</span>}
                </div>
              </div>

              <div className="p-5">
                <div className="flex flex-wrap gap-4 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 star-filled" />
                    <span className="font-bold">{mess.rating}</span>
                    <span className="text-slate-400 text-sm">({mess.review_count} reviews)</span>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(mess.monthly_charge)}</span>/month
                  </span>
                  {mess.per_meal_charge && (
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(mess.per_meal_charge)}</span>/meal
                    </span>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{mess.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {mess.meal_types.map((m: any) => <span key={m} className="tag">{mealTypeLabels[m as MealType]}</span>)}
                </div>

                {/* CALL + DIRECTION */}
                <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <a href={`tel:${mess.contact_phone}`}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-brand-500 text-brand-600 dark:text-brand-400 font-bold text-sm hover:bg-brand-500 hover:text-white transition-all">
                    <Phone className="w-4 h-4" /> CALL
                  </a>
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-orange-500 text-orange-600 font-bold text-sm hover:bg-orange-500 hover:text-white transition-all">
                    <Navigation2 className="w-4 h-4" /> DIRECTION
                  </a>
                </div>
              </div>
            </div>

            {/* ── Tab Bar ── */}
            <div className="card p-2">
              <div className="grid grid-cols-4 gap-1">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs transition-all',
                      activeTab === tab.id
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Tab Content ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >

                {/* DINE TAB — Subscription Plans */}
                {activeTab === 'dine' && (
                  <div className="card p-6 space-y-5">
                    <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      💳 Subscription Plans
                    </h3>
                    {ownerDetails?.owner_name && (
                      <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/40">
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Available plans offered by <span className="font-bold text-brand-600 dark:text-brand-400">{ownerDetails.owner_name}</span>
                        </p>
                      </div>
                    )}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {displayPlans.length > 0 ? (
                        displayPlans.map((plan: any) => (
                          <motion.div
                            key={plan.id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setSelectedPlan(plan.id)}
                            className={cn(
                              'p-5 rounded-2xl border-2 cursor-pointer transition-all',
                              selectedPlan === plan.id
                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10'
                                : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'
                            )}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{plan.name}</h4>
                                <p className="text-xs text-slate-400 mt-0.5">{plan.duration_days} days</p>
                              </div>
                              {selectedPlan === plan.id && <CheckCircle className="w-5 h-5 text-orange-500" />}
                            </div>
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">{formatCurrency(plan.price)}</div>
                            <p className="text-xs text-slate-500 mb-3">{plan.description}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {(plan.meal_types || []).map((m: any) => (
                                <span key={m} className="tag text-[10px]">{mealTypeLabels[m as MealType]}</span>
                              ))}
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="sm:col-span-2 p-6 text-center">
                          <p className="text-slate-500 dark:text-slate-400">No subscription plans available at the moment.</p>
                        </div>
                      )}
                    </div>
                    {selectedPlan && displayPlans.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                        <Link
                          to={`/dashboard/student/subscription?mess=${mess.id}&plan=${selectedPlan}`}
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-md shadow-orange-500/20"
                        >
                          Subscribe to Selected Plan 🎉
                        </Link>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* PHOTOS TAB */}
                {activeTab === 'photos' && (
                  <div className="card p-6">
                    <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-5 flex items-center justify-between">
                      <span>📸 Photos</span>
                      <span className="text-xs font-normal text-slate-400">{photos.length} images</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {photos.map((photo: string, i: number) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.03 }}
                          className="relative rounded-2xl overflow-hidden aspect-square cursor-pointer group"
                        >
                          <img src={photo} alt={`${mess.name} ${i + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all duration-200 flex items-center justify-center">
                            <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* MENU TAB */}
                {activeTab === 'menu' && (
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">Daily Menu</h3>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE UPDATES
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {mess.meal_types.map((meal: any) => {
                        const items = todayMenu[meal as MealType] || []
                        return (
                          <div key={meal} className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm capitalize flex items-center gap-2">
                                <span>{meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : meal === 'dinner' ? '🌙' : '🍪'}</span>
                                {mealTypeLabels[meal as MealType]}
                              </h4>
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                                AVAILABLE
                              </span>
                            </div>
                            <div className="p-4">
                              {items.length > 0 ? (
                                <ul className="space-y-1.5">
                                  {items.map((item: string) => (
                                    <li key={item} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-xs text-slate-400 italic text-center py-3">Menu not updated yet</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* REVIEW TAB */}
                {activeTab === 'review' && (
                  <div className="card p-6 space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">⭐ Reviews</h3>
                      <span className="badge badge-green text-xs">{mess.review_count} total</span>
                    </div>

                    {/* Rating summary */}
                    <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-slate-900 dark:text-white">{mess.rating}</div>
                        <div className="flex gap-0.5 mt-1 justify-center">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={cn('w-3.5 h-3.5', s <= Math.floor(mess.rating) ? 'star-filled' : 'star-empty')} />
                          ))}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">out of 5</p>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {[5,4,3,2,1].map(star => (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 w-3">{star}</span>
                            <Star className="w-3 h-3 text-amber-400" />
                            <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-400 rounded-full" style={{ width: `${star === 5 ? 65 : star === 4 ? 20 : star === 3 ? 10 : star === 2 ? 3 : 2}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add Review Form */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-sm">Write a Review</h4>
                      <form onSubmit={handleAddReview} className="space-y-3">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setNewRating(s)}
                              className="focus:outline-none transition-transform hover:scale-110"
                            >
                              <Star className={cn('w-6 h-6', s <= newRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600')} />
                            </button>
                          ))}
                        </div>
                        <textarea
                          placeholder="Share your experience..."
                          className="input-field w-full min-h-[80px] text-sm resize-none"
                          value={newReview}
                          onChange={(e) => setNewReview(e.target.value)}
                        />
                        <button 
                          type="submit" 
                          disabled={!newReview.trim() || newRating === 0}
                          className="btn-primary w-full text-sm py-2 disabled:opacity-50"
                        >
                          Submit Review
                        </button>
                      </form>
                    </div>

                    {/* Review cards */}
                    <div className="space-y-4">
                      {reviewsList.map(r => (
                        <div key={r.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                                {r.name[0]}
                              </div>
                              <div>
                                <p className="font-bold text-sm text-slate-900 dark:text-white">{r.name}</p>
                                <p className="text-xs text-slate-400">{r.date}</p>
                              </div>
                            </div>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={cn('w-3 h-3', s <= r.rating ? 'star-filled' : 'star-empty')} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{r.comment}</p>
                        </div>
                      ))}
                    </div>

                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Right Sidebar ── */}
          <div className="space-y-4">
            {/* Owner Details */}
            <div className="card p-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Owner Details
              </p>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-400 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {(ownerDetails?.owner_name?.[0] || mess.name?.[0] || 'M').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Verified Provider</p>
                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{ownerDetails?.owner_name || mess.name}</p>
                    <p className="text-xs text-slate-500">{ownerDetails?.contact_phone || mess.contact_phone}</p>
                  </div>
                </div>
                {mess.verified && (
                  <div className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-full px-2.5 py-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED
                  </div>
                )}
              </div>
            </div>

            {/* Location Details */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" /> Location Details
                </p>
                {mess.pincode && <span className="text-xs font-semibold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg">{mess.pincode}</span>}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{mess.address}</p>
                <p className="text-xs text-slate-500 mt-1">{mess.city}, {mess.state || 'Maharashtra'}</p>
              </div>
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-md shadow-orange-500/20">
                <Navigation2 className="w-4 h-4" /> Open in Google Maps <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>

            {/* Operating Details */}
            <div className="card p-5 space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-500" /> Operating Details
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Service Hours</span><span className="font-bold text-slate-900 dark:text-white">{serviceStart} — 10:00 PM</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Monthly</span><span className="font-bold text-slate-900 dark:text-white">{formatCurrency(mess.monthly_charge)}</span></div>
                {mess.per_meal_charge && <div className="flex justify-between"><span className="text-slate-500">Per Meal</span><span className="font-bold text-slate-900 dark:text-white">{formatCurrency(mess.per_meal_charge)}</span></div>}
                <div className="flex justify-between"><span className="text-slate-500">Status</span>
                  <span className={cn('font-bold', mess.status === 'open' ? 'text-emerald-500' : mess.status === 'busy' ? 'text-amber-500' : 'text-red-500')}>
                    {statusCfg.dot} {statusCfg.label}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/40">
                  <span className="text-xl">📱</span>
                  <div>
                    <p className="text-xs font-bold text-brand-700 dark:text-brand-300">Digital Attendance</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">GPS + QR based check-in</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan summary */}
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl flex-shrink-0">💳</div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Monthly Subscription</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {displayPlans.length > 0
                      ? `${displayPlans.length} plan${displayPlans.length > 1 ? 's' : ''} • from ${formatCurrency(Math.min(...displayPlans.map((p: any) => p.price)))}/mo`
                      : 'Not currently available'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
