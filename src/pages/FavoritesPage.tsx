import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Building2, Utensils } from 'lucide-react'
import { useFavoriteStore } from '../store/favoriteStore'
import PropertyCard from '../components/property/PropertyCard'
import MessCard from '../components/mess/MessCard'
import { fetchProperties, fetchMesses } from '../lib/platformData'
import type { Property, Mess } from '../types'

export default function FavoritesPage() {
  const { favoriteProperties, favoriteMesses } = useFavoriteStore()
  const [properties, setProperties] = useState<Property[]>([])
  const [messes, setMesses] = useState<Mess[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'properties' | 'messes'>('properties')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [p, m] = await Promise.all([
          fetchProperties(),
          fetchMesses()
        ])
        setProperties(p)
        setMesses(m)
      } catch (err) {
        console.error('Failed to load favorites', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const savedProps = properties.filter(p => favoriteProperties.includes(p.id) && (!((p as any).is_student_request === true || p.profiles?.role === 'student') || p.verified === true))
  const savedMesses = messes.filter(m => favoriteMesses.includes(m.id))

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center text-slate-500">
        Loading favorites...
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-surface-muted dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Heart className="w-8 h-8 text-brand-500" />
              Your Favorites
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Manage all your saved properties and mess services in one place.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 mb-8">
          <button
            onClick={() => setActiveTab('properties')}
            className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'properties'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Properties ({savedProps.length})
          </button>
          <button
            onClick={() => setActiveTab('messes')}
            className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'messes'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Utensils className="w-4 h-4" />
            Messes ({savedMesses.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'properties' && (
          <div>
            {savedProps.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <Heart className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No properties saved yet</h3>
                <p className="text-slate-500">Explore properties and click the heart icon to save them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {savedProps.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'messes' && (
          <div>
            {savedMesses.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <Heart className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No messes saved yet</h3>
                <p className="text-slate-500">Explore mess services and click the heart icon to save them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedMesses.map(mess => (
                  <MessCard key={mess.id} mess={mess} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
