import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import MessCard from '../components/mess/MessCard'
import { fetchMesses } from '../lib/platformData'
import { cn, messStatusConfig } from '../lib/utils'
import type { MessStatus } from '../types'

export default function MessPage() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [status, setStatus] = useState<MessStatus | ''>('')
  const [maxPrice, setMaxPrice] = useState('')
  const [mealFilter, setMealFilter] = useState('')
  const [city, setCity] = useState(searchParams.get('city') || '')

  const [allMesses, setAllMesses] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        setAllMesses(await fetchMesses())
      } catch (error) {
        console.error('Failed to load messes from Supabase:', error)
        setAllMesses([])
      }
    }

    load()
  }, [])

  const filtered = allMesses.filter(m => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.address.toLowerCase().includes(search.toLowerCase())) return false
    if (city && m.city.toLowerCase() !== city.toLowerCase()) return false
    if (status && m.status !== status) return false
    if (maxPrice && m.monthly_charge > Number(maxPrice)) return false
    if (mealFilter && !m.meal_types.includes(mealFilter as never)) return false
    return true
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-accent-600 to-red-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-display font-bold mb-3">🍽️ Find Your Perfect Mess</h1>
            <p className="text-accent-100 text-lg mb-6">Digital attendance, QR meal tokens, daily menus — all in one place</p>
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search mess by name or location..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 placeholder-slate-400 outline-none shadow-lg" />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Status</label>
            <div className="flex gap-2">
              {(['' , 'open', 'busy', 'closed'] as const).map(s => (
                <button key={s} onClick={() => setStatus(s)}
                  className={cn('px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
                    status === s ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400')}>
                  {s ? `${messStatusConfig[s].dot} ${messStatusConfig[s].label}` : 'All Status'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Meals</label>
            <div className="flex gap-2">
              {[{v:'',l:'All Meals'},{v:'breakfast',l:'☀️ Breakfast'},{v:'lunch',l:'🌤 Lunch'},{v:'dinner',l:'🌙 Dinner'},{v:'snack',l:'🍪 Snack'}].map(m => (
                <button key={m.v} onClick={() => setMealFilter(m.v)}
                  className={cn('px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
                    mealFilter === m.v ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400')}>
                  {m.l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Max Monthly (₹)</label>
            <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
              placeholder="e.g. 4000" className="input-field py-1.5 w-32 text-sm" />
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">{filtered.length} Mess Services Found</h2>
            {city && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-xs font-semibold">
                📍 {city}
                <button onClick={() => setCity('')} className="hover:text-brand-900 dark:hover:text-brand-100 font-bold ml-1">✕</button>
              </span>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No mess found</h3>
            <button onClick={() => { setSearch(''); setStatus(''); setMaxPrice(''); setMealFilter(''); setCity('') }} className="btn-primary mt-4">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((mess, i) => <MessCard key={mess.id} mess={mess} index={i} />)}
          </div>
        )}

        {/* How it works */}
        <div className="mt-16 card p-8">
          <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white text-center mb-8">How Digital Mess Works</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🔍', step: '1', title: 'Find & Subscribe', desc: 'Browse mess services and choose a meal plan that fits your budget' },
              { icon: '📍', step: '2', title: 'GPS Verification', desc: 'When you arrive, the system verifies your location (within 50m)' },
              { icon: '📷', step: '3', title: 'Scan QR Code', desc: 'Scan the daily rotating QR code displayed at the mess entrance' },
              { icon: '🎫', step: '4', title: 'Get Meal Token', desc: 'Receive a unique one-time token and enjoy your meal!' },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center text-3xl mx-auto mb-3">{item.icon}</div>
                <div className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center mx-auto -mt-1 mb-2">{item.step}</div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{item.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
