import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Star, Heart, Clock, Phone } from 'lucide-react'
import { cn, formatCurrency, messStatusConfig, mealTypeLabels } from '../../lib/utils'
import type { Mess } from '../../types'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'

import { useFavoriteStore } from '../../store/favoriteStore'

interface MessCardProps {
  mess: Mess
  index?: number
}

export default function MessCard({ mess, index = 0 }: MessCardProps) {
  const { isMessFavorite, toggleMessFavorite } = useFavoriteStore()
  const favorited = isMessFavorite(mess.id)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (!mess.photos || mess.photos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % mess.photos.length)
    }, 3000 + (index * 500));

    return () => clearInterval(interval);
  }, [mess.photos, index])

  const { profile } = useAuthStore()
  const statusCfg = messStatusConfig[mess.status]

  const defaultPhoto = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600'
  const photoUrl = (mess.photos && mess.photos.length > 0) ? mess.photos[currentImageIndex] : defaultPhoto

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <Link to={`/mess/${mess.id}`} className="card-property group flex flex-col h-full p-2 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10 border border-transparent hover:border-brand-500/20">
        {/* Image */}
        <div className="relative overflow-hidden h-40 sm:h-48 rounded-xl shrink-0">
          <img
            key={photoUrl}
            src={photoUrl}
            alt={mess.name}
            className="property-image w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out animate-in fade-in"
          />
          {/* Slideshow Dots */}
          {mess.photos && mess.photos.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10 bg-black/20 p-1 rounded-full backdrop-blur-sm">
              {mess.photos.map((_, i) => (
                <div
                  key={i}
                  className={cn("w-1.5 h-1.5 rounded-full transition-all duration-300",
                    i === currentImageIndex ? "bg-white scale-125" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          )}
          {/* Status Badge */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={cn('badge shadow-sm text-[10px]', statusCfg.color)}>
              {statusCfg.dot} {statusCfg.label}
            </span>
            {mess.featured && (
              <span className="badge badge-orange text-[10px] shadow-sm">⭐ Featured</span>
            )}
          </div>
          {/* Favorite */}
          <button
            onClick={(e) => { e.preventDefault(); toggleMessFavorite(mess.id) }}
            className={cn(
              'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm',
              favorited ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-600 hover:bg-white hover:text-red-500'
            )}
          >
            <Heart className={cn('w-4 h-4', favorited && 'fill-current')} />
          </button>
          {/* Verified */}
          {mess.verified && (
            <div className="absolute bottom-3 right-3 badge badge-green text-[10px] shadow-sm">
              ✓ Verified
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-2 pt-3 pb-1 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-tight group-hover:text-brand-600 transition-colors">
              {mess.name}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-3.5 h-3.5 star-filled" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{mess.rating}</span>
              <span className="text-[10px] text-slate-400">({mess.review_count})</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-3">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{mess.address}, {mess.city}</span>
          </div>

          {/* Meal Types */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {mess.food_type && mess.food_type !== 'both' && (
              <span className={cn('tag text-[10px] border', mess.food_type === 'veg' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800')}>
                {mess.food_type === 'veg' ? 'Pure Veg' : 'Non-Veg'}
              </span>
            )}
            {mess.food_type === 'both' && (
              <span className="tag text-[10px] border bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800">
                Veg & Non-Veg
              </span>
            )}
            {mess.meal_types.map(meal => (
              <span key={meal} className="tag text-[10px]">
                {mealTypeLabels[meal]}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700 mt-auto">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatCurrency(mess.monthly_charge)}
                </span>
                <span className="text-xs text-slate-400">/month</span>
              </div>
              {mess.per_meal_charge && (
                <p className="text-[10px] text-slate-400">{formatCurrency(mess.per_meal_charge)}/meal</p>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              <span>Digital Attendance</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
