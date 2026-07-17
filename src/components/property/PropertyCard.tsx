import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Wifi, Star, Heart, BedDouble, Bath, Shield, Zap, Car, Dumbbell, X } from 'lucide-react'
import { cn, formatCurrency, propertyTypeLabels } from '../../lib/utils'
import type { Property } from '../../types'
import { useAuthStore } from '../../store/authStore'
import { usePropertyStore } from '../../store/propertyStore'

interface PropertyCardProps {
  property: Property
  index?: number
}

export default function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const [favorited, setFavorited] = React.useState(false)
  const { profile } = useAuthStore()
  const { deleteProperty } = usePropertyStore()

  const amenityIcons = [
    { key: 'wifi', icon: Wifi, label: 'WiFi' },
    { key: 'ac', icon: Zap, label: 'AC' },
    { key: 'parking', icon: Car, label: 'Parking' },
    { key: 'attached_bathroom', icon: Bath, label: 'Bathroom' },
    { key: 'security', icon: Shield, label: 'Security' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/properties/${property.id}`} className="card-property group block">
        {/* Image */}
        <div className="relative overflow-hidden h-52">
          <img
            src={property.images[0]}
            alt={property.title}
            className="property-image w-full h-full object-cover"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="badge badge-purple text-[10px] shadow-sm">
              {propertyTypeLabels[property.property_type]}
            </span>
            {property.featured && (
              <span className="badge badge-orange text-[10px] shadow-sm">⭐ Featured</span>
            )}
            {!property.availability && (
              <span className="badge badge-red text-[10px] shadow-sm">Unavailable</span>
            )}
          </div>
          {/* Favorite Button */}
          <button
            onClick={(e) => { e.preventDefault(); setFavorited(!favorited) }}
            className={cn(
              'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm',
              favorited
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-slate-600 hover:bg-white hover:text-red-500'
            )}
          >
            <Heart className={cn('w-4 h-4', favorited && 'fill-current')} />
          </button>
          {/* Gender Badge */}
          <div className="absolute bottom-3 right-3">
            <span className={cn(
              'badge text-[10px] shadow-sm',
              property.gender_preference === 'male' ? 'bg-blue-500/90 text-white' :
              property.gender_preference === 'female' ? 'bg-pink-500/90 text-white' :
              'bg-emerald-500/90 text-white'
            )}>
              {property.gender_preference === 'male' ? '👨 Boys' :
               property.gender_preference === 'female' ? '👩 Girls' : '👥 Any'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-tight line-clamp-2 group-hover:text-brand-600 transition-colors">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-3.5 h-3.5 star-filled" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{property.rating}</span>
              <span className="text-[10px] text-slate-400">({property.review_count})</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-3">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{property.address}, {property.city}</span>
          </div>

          {/* Amenities */}
          <div className="flex items-center gap-2 mb-3">
            {amenityIcons.map(({ key, icon: Icon, label }) =>
              property.amenities[key as keyof typeof property.amenities] ? (
                <div key={key} title={label} className="w-6 h-6 rounded-lg bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center">
                  <Icon className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                </div>
              ) : null
            )}
            {property.amenities.furnished && (
              <span className="tag text-[10px]">Furnished</span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatCurrency(property.rent)}
                </span>
                <span className="text-xs text-slate-400">/month</span>
              </div>
              <p className="text-[10px] text-slate-400">Deposit: {formatCurrency(property.deposit)}</p>
            </div>
            {property.available_rooms !== undefined && (
              <span className={cn(
                'badge text-[10px]',
                property.available_rooms > 0 ? 'badge-green' : 'badge-red'
              )}>
                {property.available_rooms > 0 ? `${property.available_rooms} rooms left` : 'Full'}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
