import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search, MapPin, Building2, Utensils, Users, Star, ArrowRight,
  CheckCircle, Shield, Zap, Smartphone, ChevronRight, Play
} from 'lucide-react'
import PropertyCard from '../components/property/PropertyCard'
import MessCard from '../components/mess/MessCard'
import { fetchMesses, fetchProperties } from '../lib/platformData'
import { cn } from '../lib/utils'
import { supabase } from '../lib/supabase'
const cities = ['Pune', 'Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad']

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchCity, setSearchCity] = useState('Pune')
  const [searchTab, setSearchTab] = useState<'property' | 'mess'>('property')
  const [properties, setProperties] = useState<any[]>([])
  const [messes, setMesses] = useState<any[]>([])
  const [dynamicStats, setDynamicStats] = useState({ properties: '0+', messes: '0+', students: '0+' })
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const [propertyRows, messRows] = await Promise.all([fetchProperties(), fetchMesses()])
        setProperties(propertyRows)
        setMesses(messRows)
        
        const { count: propsCount } = await supabase.from('properties').select('*', { count: 'exact', head: true })
        const { count: messesCount } = await supabase.from('messes').select('*', { count: 'exact', head: true })
        const { count: studentsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student')
        
        setDynamicStats({
          properties: `${propsCount || 0}+`,
          messes: `${messesCount || 0}+`,
          students: `${studentsCount || 0}+`
        })
      } catch (error) {
        console.error('Failed to load homepage data from Supabase:', error)
      }
    }

    load()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTab === 'mess') {
      navigate(`/mess?q=${searchQuery}&city=${searchCity}`)
    } else {
      navigate(`/properties?q=${searchQuery}&city=${searchCity}`)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1920&q=80"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-950/90 via-slate-900/80 to-slate-900/70" />
          <div className="absolute inset-0 bg-grid opacity-10" />
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-32 left-10 lg:left-32 hidden lg:block"
        >
          <div className="glass rounded-2xl p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">🏠</div>
              <div>
                <p className="text-xs font-semibold">New Listing!</p>
                <p className="text-[10px] opacity-70">Sunshine PG, Kothrud</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
          className="absolute top-40 right-10 lg:right-32 hidden lg:block"
        >
          <div className="glass rounded-2xl p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">✅</div>
              <div>
                <p className="text-xs font-semibold">Meal Attended!</p>
                <p className="text-[10px] opacity-70">Maa Ki Rasoi - Lunch</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              India's #1 Smart Student Housing Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif italic font-bold text-white leading-tight mb-4 sm:mb-6 tracking-tight">
              Find Your Perfect
              <br />
              <span className="gradient-text font-pacifico not-italic font-normal text-[1.1em] block mt-2">Campus Home</span>
            </h1>

            <p className="text-slate-300 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Discover PGs, hostels, flats & digital mess services near your college.
              Smart attendance, QR meals, and community living — all in one app.
            </p>

            {/* Search Tabs */}
            <div className="flex justify-center gap-2.5 mb-4 max-w-xs mx-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setSearchTab('property')}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border",
                  searchTab === 'property'
                    ? "bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/25"
                    : "bg-black/20 hover:bg-black/35 text-white/90 border-white/10"
                )}
              >
                🏠 Housing
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setSearchTab('mess')}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border",
                  searchTab === 'mess'
                    ? "bg-accent-500 text-white border-accent-500 shadow-lg shadow-accent-500/25"
                    : "bg-black/20 hover:bg-black/35 text-white/90 border-white/10"
                )}
              >
                🍽️ Mess
              </motion.button>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 bg-white dark:bg-slate-800 p-1.5 sm:p-2 rounded-2xl shadow-glass">
                <div className="flex items-center gap-2 flex-1 px-2 sm:px-3">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchTab === 'mess' ? 'Try "Jagdamba Mess" or "veg meals"' : 'Try "PG near MIT College"'}
                    className="flex-1 bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm py-2"
                  />
                </div>
                <div className="flex items-center gap-2 sm:border-l border-slate-200 dark:border-slate-700 px-2 sm:px-3 py-1 sm:py-0 border-t sm:border-t-0">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <select
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="bg-transparent outline-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium w-full"
                  >
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn-primary rounded-xl px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm whitespace-nowrap mt-1 sm:mt-0">
                  <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Search
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
              {['PG below ₹8000', 'Girls Hostel', 'AC Flat', 'Veg Mess'].map(tag => (
                <button
                  key={tag}
                  onClick={() => navigate(`/properties?q=${tag}`)}
                  className="px-4 py-1.5 rounded-full border border-white/20 text-white/80 text-sm hover:bg-white/10 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-brand-600 dark:bg-brand-700 py-5 sm:py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-2 sm:gap-6 divide-x divide-brand-500/40">
            {[
              { value: dynamicStats.properties, label: 'Properties Listed' },
              { value: dynamicStats.messes, label: 'Mess Services' },
              { value: dynamicStats.students, label: 'Happy Students' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="text-center text-white px-1 sm:px-4 cursor-default transition-all"
              >
                <div className="text-2xl sm:text-3xl font-display font-bold">{stat.value}</div>
                <div className="text-brand-200 text-[10px] sm:text-sm mt-0.5 sm:mt-1 leading-tight">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>




      {/* Featured Properties */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 sm:mb-10 text-center sm:text-left">
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}>
              <h2 className="text-3xl sm:text-5xl font-display font-bold text-brand-600 dark:text-brand-400 tracking-tight">
                🏠 Featured Properties
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 sm:mt-1">Top-rated, verified accommodations near colleges</p>
            </motion.div>
            <Link to="/properties" className="btn-secondary hidden sm:flex text-sm mt-4 sm:mt-0">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.slice(0, 3).map((property, i) => (
              <PropertyCard key={property.id} property={property} index={i} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/properties" className="btn-primary">
              Explore All Properties <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Mess Section */}
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 sm:mb-10 text-center sm:text-left">
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}>
              <h2 className="text-3xl sm:text-5xl font-display font-bold text-accent-600 dark:text-accent-400 tracking-tight">
                🍽️ Top Mess Services
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 sm:mt-1">Verified messes with digital attendance system</p>
            </motion.div>
            <Link to="/mess" className="btn-secondary hidden sm:flex text-sm mt-4 sm:mt-0">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {messes.map((mess, i) => (
              <MessCard key={mess.id} mess={mess} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Smart Mess System Explainer */}
      <section className="py-10 sm:py-20 bg-gradient-to-br from-brand-950 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} className="text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/20 border border-accent-500/30 text-accent-300 text-xs sm:text-sm mb-3 sm:mb-6 animate-pulse-slow shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                🚀 Revolutionary Feature
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif italic font-bold mb-3 sm:mb-6 leading-tight">
                Smart Digital Mess<br />
                <span className="gradient-text-orange font-dancing not-italic font-normal block mt-1">Attendance System</span>
              </h2>
              {/* Description — hidden on mobile to save space */}
              <p className="hidden sm:block text-slate-300 text-lg mb-8 leading-relaxed">
                No more paper registers. Our streamlined static QR-based attendance system ensures authentic meal tracking seamlessly linked to your active subscription.
              </p>

              {/* Mobile: compact 2-col step grid */}
              <div className="grid grid-cols-2 gap-3 sm:hidden mb-5">
                {[
                  { icon: '📱', title: 'Open App' },
                  { icon: '📷', title: 'Scan QR' },
                  { icon: '🎫', title: 'Validated' },
                  { icon: '✅', title: 'Logged!' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="text-[10px] text-brand-300 font-medium">Step {i + 1}</p>
                      <p className="text-xs text-white font-semibold">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: full step list */}
              <div className="hidden sm:block space-y-4">
                {[
                  { icon: '📱', step: '1', title: 'Open Your App', desc: 'Launch the FlatsNFoods app when you arrive at the mess.' },
                  { icon: '📷', step: '2', title: 'Scan QR Poster', desc: 'Scan the mess\'s static QR code poster right from your dashboard.' },
                  { icon: '🎫', step: '3', title: 'System Validation', desc: 'The system instantly verifies your active meal plan and daily limits.' },
                  { icon: '✅', step: '4', title: 'Attendance Recorded', desc: 'Your meal is automatically logged and your plan count is updated!' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4 group cursor-default">
                    <div className="w-10 h-10 rounded-full bg-brand-500/30 border border-brand-500/50 flex items-center justify-center flex-shrink-0 text-lg group-hover:scale-110 transition-transform duration-300 shadow-glow">
                      <span className="group-hover:animate-bounce-subtle">{item.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{item.title}</h4>
                      <p className="text-slate-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 sm:mt-8 flex justify-center sm:justify-start">
                <Link to="/mess" className="btn-accent text-sm sm:text-base hover:scale-105 transition-transform duration-300 shadow-glow-orange">
                  Explore Mess Services <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* Mock phone UI — hidden on mobile */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-3xl overflow-hidden bg-slate-800/50 border border-slate-700 p-6 animate-float shadow-2xl shadow-brand-500/20">
                <div className="bg-slate-900 rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-brand-500/30 flex items-center justify-center text-xl">🍽️</div>
                    <div>
                      <p className="text-white font-semibold text-sm">Jagdamba Mess</p>
                      <p className="text-emerald-400 text-xs flex items-center gap-1">🟢 Open Now</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800">
                      <span className="text-slate-300 text-sm">📊 Daily Limit</span>
                      <span className="text-emerald-400 text-sm font-medium">✓ 1 of 2 scans used</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800">
                      <span className="text-slate-300 text-sm">🎫 Subscription</span>
                      <span className="text-emerald-400 text-sm font-medium">✓ Active (18 days left)</span>
                    </div>
                  </div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-brand-300 font-semibold">Ready to Scan QR</p>
                  <p className="text-slate-400 text-xs mt-1">Point camera at mess QR code</p>
                </div>
                <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                  <p className="text-emerald-400 font-bold">🎉 Lunch Attended!</p>
                  <p className="text-slate-400 text-xs mt-1">Meals Left: <span className="text-white font-mono">24</span></p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-10 sm:py-20 bg-gradient-to-br from-brand-600 to-brand-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-white mb-2 sm:mb-4">
              Ready to find your Campus Home?
            </h2>
            <p className="text-brand-200 text-sm sm:text-lg mb-5 sm:mb-8">
              Join 5,000+ students already using FlatsNFoods across India
            </p>
            <div className="flex flex-row gap-3 justify-center">
              <Link to="/auth?tab=register" className="btn-accent text-sm sm:text-base px-5 sm:px-8">
                Get Started Free <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <Link to="/properties" className="px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl border-2 border-white/30 text-white text-sm sm:text-base font-semibold hover:bg-white/10 transition-all inline-flex items-center gap-2">
                Browse Properties
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
