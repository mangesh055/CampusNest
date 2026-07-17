import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Star, Heart, Clock, Phone } from 'lucide-react'
import { cn, formatCurrency, messStatusConfig, mealTypeLabels } from '../../lib/utils'
import type { Mess } from '../../types'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'

interface MessCardProps {
  mess: Mess
  index?: number
}

export default function MessCard({ mess, index = 0 }: MessCardProps) {
  const [favorited, setFavorited] = React.useState(false)
  const { profile } = useAuthStore()
  const statusCfg = messStatusConfig[mess.status]

  const defaultPhoto = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600'
  const photoUrl = (mess.photos && mess.photos.length > 0) ? mess.photos[0] : defaultPhoto

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/mess/${mess.id}`} className="card-property group block">
        {/* Image */}
        <div className="relative overflow-hidden h-48">
          <img
            src={photoUrl}
            alt={mess.name}
            className="property-image w-full h-full object-cover"
          />
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
            onClick={(e) => { e.preventDefault(); setFavorited(!favorited) }}
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
        <div className="p-4">
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
            {mess.meal_types.map(meal => (
              <span key={meal} className="tag text-[10px]">
                {mealTypeLabels[meal]}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
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
