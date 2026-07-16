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

const propertyTypes = [
  { icon: '🏠', label: 'PG', path: '/properties?type=pg', color: 'from-purple-500 to-brand-500' },
  { icon: '🏨', label: 'Hostel', path: '/properties?type=hostel', color: 'from-blue-500 to-cyan-500' },
  { icon: '🏢', label: 'Flat', path: '/properties?type=flat', color: 'from-emerald-500 to-teal-500' },
  { icon: '🛏️', label: 'Shared Room', path: '/properties?type=shared_room', color: 'from-amber-500 to-orange-500' },
  { icon: '🚪', label: 'Private Room', path: '/properties?type=private_room', color: 'from-pink-500 to-rose-500' },
  { icon: '🍽️', label: 'Mess', path: '/mess', color: 'from-red-500 to-accent-500' },
]

const features = [
  { icon: '🗺️', title: 'GPS Attendance', desc: 'Mark meal attendance with location verification & QR scanning' },
  { icon: '📱', title: 'Digital Tokens', desc: 'Get unique meal tokens after successful attendance marking' },
  { icon: '📊', title: 'Smart Analytics', desc: 'Track spending, meals consumed, and attendance patterns' },
  { icon: '🔔', title: 'Smart Notifications', desc: 'Never miss a subscription renewal or menu update' },
  { icon: '🤖', title: 'AI Assistant', desc: 'Get personalized PG and mess recommendations using AI' },
]

const cities = ['Pune', 'Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad']

const stats = [
  { value: '1,200+', label: 'Properties Listed' },
  { value: '400+', label: 'Mess Services' },
  { value: '5,000+', label: 'Happy Students' },
  { value: '₹2Cr+', label: 'Savings Generated' },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchCity, setSearchCity] = useState('Pune')
  const [searchTab, setSearchTab] = useState<'property' | 'mess'>('property')
  const [properties, setProperties] = useState<any[]>([])
  const [messes, setMesses] = useState<any[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const [propertyRows, messRows] = await Promise.all([fetchProperties(), fetchMesses()])
        setProperties(propertyRows)
        setMesses(messRows)
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

            <h1 className="text-5xl lg:text-7xl font-display font-bold text-white leading-tight mb-6">
              Find Your Perfect
              <br />
              <span className="gradient-text">Campus Home</span>
            </h1>

            <p className="text-slate-300 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Discover PGs, hostels, flats & digital mess services near your college.
              Smart attendance, QR meals, and community living — all in one app.
            </p>

            {/* Search Tabs */}
            <div className="flex justify-center gap-2.5 mb-4 max-w-xs mx-auto">
              <button
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
              </button>
              <button
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
              </button>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-glass">
                <div className="flex items-center gap-2 flex-1 px-3">
                  <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchTab === 'mess' ? 'Try "Maa Ki Rasoi" or "veg meals"' : 'Try "PG near MIT College" or "Girls Hostel"'}
                    className="flex-1 bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 sm:border-l border-slate-200 dark:border-slate-700 px-3">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <select
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="bg-transparent outline-none text-sm text-slate-700 dark:text-slate-300 font-medium"
                  >
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn-primary rounded-xl px-6 py-2.5 text-sm whitespace-nowrap">
                  <Search className="w-4 h-4" />
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
      <section className="bg-brand-600 dark:bg-brand-700 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center text-white"
              >
                <div className="text-3xl font-display font-bold">{stat.value}</div>
                <div className="text-brand-200 text-sm mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Property Types */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-3">
              Browse by Category
            </h2>
            <p className="text-slate-500 dark:text-slate-400">Find exactly what fits your lifestyle and budget</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {propertyTypes.map((type, i) => (
              <motion.div
                key={type.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
              >
                <Link
                  to={type.path}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-400 hover:shadow-card-hover group transition-all"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                    {type.icon}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-brand-600 transition-colors">{type.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}>
              <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                🏠 Featured Properties
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Top-rated, verified accommodations near colleges</p>
            </motion.div>
            <Link to="/properties" className="btn-secondary hidden sm:flex text-sm">
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
          <div className="flex items-center justify-between mb-10">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}>
              <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                🍽️ Top Mess Services
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Verified messes with digital attendance system</p>
            </motion.div>
            <Link to="/mess" className="btn-secondary hidden sm:flex text-sm">
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
      <section className="py-20 bg-gradient-to-br from-brand-950 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-500/20 border border-accent-500/30 text-accent-300 text-sm mb-6">
                🚀 Revolutionary Feature
              </div>
              <h2 className="text-4xl font-display font-bold mb-6 leading-tight">
                Smart Digital Mess<br />
                <span className="gradient-text-orange">Attendance System</span>
              </h2>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                No more paper registers. Our GPS + QR-based attendance system ensures authentic meal tracking with fraud prevention built-in.
              </p>
              <div className="space-y-4">
                {[
                  { icon: '📍', step: '1', title: 'Arrive at Mess', desc: 'GPS verifies you are within 50 meters of the mess' },
                  { icon: '📷', step: '2', title: 'Scan QR Code', desc: 'Scan the daily rotating QR code generated by the owner' },
                  { icon: '✅', step: '3', title: 'Attendance Recorded', desc: 'Your meal attendance is instantly confirmed' },
                  { icon: '🎫', step: '4', title: 'Get Meal Token', desc: 'Receive a unique one-time token (e.g., TOKEN-ABC123)' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-500/30 border border-brand-500/50 flex items-center justify-center flex-shrink-0 text-lg">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{item.title}</h4>
                      <p className="text-slate-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link to="/mess" className="btn-accent">
                  Explore Mess Services <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden bg-slate-800/50 border border-slate-700 p-6">
                {/* Mock Phone UI */}
                <div className="bg-slate-900 rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-brand-500/30 flex items-center justify-center text-xl">🍽️</div>
                    <div>
                      <p className="text-white font-semibold text-sm">Maa Ki Rasoi</p>
                      <p className="text-emerald-400 text-xs flex items-center gap-1">🟢 Open Now</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800">
                      <span className="text-slate-300 text-sm">📍 Location</span>
                      <span className="text-emerald-400 text-sm font-medium">✓ Verified (12m away)</span>
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
                  <p className="text-slate-400 text-xs mt-1">Token: <span className="text-white font-mono">TOKEN-XY42P9</span></p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">
              Everything you need, in one place
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
              From finding your first PG to managing subscriptions — CampusNest has it all.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card p-6 group hover:border-brand-400"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-brand-600 to-brand-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
            <h2 className="text-4xl font-display font-bold text-white mb-4">
              Ready to find your Campus Home?
            </h2>
            <p className="text-brand-200 text-lg mb-8">
              Join 5,000+ students already using CampusNest across India
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?tab=register" className="btn-accent text-base px-8">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/properties" className="px-8 py-3 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-all inline-flex items-center gap-2">
                Browse Properties
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
