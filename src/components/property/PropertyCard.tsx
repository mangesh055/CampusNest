import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Wifi, Star, Heart, BedDouble, Bath, Shield, Zap, Car, Dumbbell, X, Phone, Building2 } from 'lucide-react'
import { cn, formatCurrency, propertyTypeLabels } from '../../lib/utils'
import type { Property } from '../../types'
import { useAuthStore } from '../../store/authStore'
import { usePropertyStore } from '../../store/propertyStore'
import ContactOwnerModal from './ContactOwnerModal'
import { useFavoriteStore } from '../../store/favoriteStore'
import { getVITDistances } from '../../utils/distanceUtils'

interface PropertyCardProps {
  property: Property
  index?: number
}

export default function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const { profile } = useAuthStore()
  const { favoriteProperties, togglePropertyFavorite } = useFavoriteStore()
  const isOwnerView = profile?.role === 'property_owner' && profile?.id === property.owner_id
  const favorited = (favoriteProperties || []).includes(property.id)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showContactModal, setShowContactModal] = useState(false)

  const amenityIcons = [
    { key: 'wifi', icon: Wifi, label: 'WiFi' },
    { key: 'ac', icon: Zap, label: 'AC' },
    { key: 'parking', icon: Car, label: 'Parking' },
    { key: 'attached_bathroom', icon: Bath, label: 'Bathroom' },
    { key: 'security', icon: Shield, label: 'Security' },
  ]

  const cardPhotos = Array.from(new Set([
    ...(property.images || []),
    ...(property.sharing_configs?.flatMap(c => c.images || []) || [])
  ])).filter(Boolean) as string[]

  const activeAmenities = {
    ...(property.amenities || {}),
    attached_bathroom: property.amenities?.attached_bathroom || property.sharing_configs?.some(c => c.attached_bathroom),
    ac: property.amenities?.ac || property.sharing_configs?.some(c => c.ac),
    study_table: property.amenities?.study_table || property.sharing_configs?.some(c => c.study_desk),
  }

  useEffect(() => {
    if (cardPhotos.length <= 1) return
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % cardPhotos.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [cardPhotos.length])

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
        whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.3, ease: 'easeOut' } }}
        whileTap={{ scale: 0.985 }}
        className="h-full"
      >
        <Link to={`/properties/${property.id}`} className="card-property card-shine group flex flex-col h-full p-2 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/15 border border-transparent hover:border-brand-500/30">
          {/* Image */}
          <div className="relative overflow-hidden h-48 sm:h-52 rounded-xl shrink-0">
            {cardPhotos.length > 0 ? (
              <img
                key={cardPhotos[currentImageIndex % cardPhotos.length]}
                src={cardPhotos[currentImageIndex % cardPhotos.length]}
                alt={property.title}
                className="property-image w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out animate-in fade-in"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                <Building2 className="w-10 h-10 mb-1.5 opacity-50 text-slate-500" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">No Photo Uploaded</span>
                <span className="text-[10px] text-slate-400">Photos coming soon</span>
              </div>
            )}
            {/* Slideshow Dots */}
            {cardPhotos.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10 bg-black/30 p-1 rounded-full backdrop-blur-md">
                {cardPhotos.map((_, i) => (
                  <div
                    key={i}
                    className={cn("w-1.5 h-1.5 rounded-full transition-all duration-300",
                      i === (currentImageIndex % cardPhotos.length) ? "bg-white scale-125 shadow-sm" : "bg-white/50"
                    )}
                  />
                ))}
              </div>
            )}
            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2 z-10">
              <span className="badge badge-purple text-[10px] shadow-sm transition-transform duration-200 hover:scale-105">
                {propertyTypeLabels[property.property_type]}
              </span>
              {property.featured && (
                <span className="badge badge-orange text-[10px] shadow-sm animate-badge-pulse">⭐ Featured</span>
              )}
              {!property.availability && (
                <span className="badge badge-red text-[10px] shadow-sm">Unavailable</span>
              )}
            </div>
            {/* Favorite Button with Heart-beat bounce animation */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              onClick={(e) => { e.preventDefault(); togglePropertyFavorite(property.id) }}
              className={cn(
                'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 shadow-md backdrop-blur-sm z-10',
                favorited
                  ? 'bg-red-500 text-white shadow-red-500/30'
                  : 'bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:bg-white hover:text-red-500'
              )}
            >
              <motion.div
                animate={favorited ? { scale: [1, 1.4, 0.9, 1.25, 1] } : { scale: 1 }}
                transition={{ duration: 0.45 }}
              >
                <Heart className={cn('w-4 h-4 transition-transform duration-200', favorited && 'fill-current')} />
              </motion.div>
            </motion.button>
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
          <div className="px-2 pt-3 pb-1 flex flex-col flex-1">
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

            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-2">
              <MapPin className="w-3 h-3 flex-shrink-0 animate-pin-pulse text-red-500" />
              <span className="truncate">{property.address}, {property.city}</span>
            </div>

            {/* VIT Pune Campus Distances */}
            {(() => {
              const distances = getVITDistances(property.latitude, property.longitude)
              if (!distances.length) return null
              return (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {distances.map(c => (
                    <span key={c.id} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 inline-flex items-center gap-1">
                      <span className="animate-pin-pulse">📍</span> {c.formattedDistance} from {c.shortName}
                    </span>
                  ))}
                </div>
              )
            })()}

            {/* Multi-Sharing Configurations Highlight */}
            {property.sharing_configs && property.sharing_configs.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  🛏️ {property.sharing_configs.map(c => (c.sharing_type || '1_sharing').split('_')[0]).join(', ')} Sharing Available
                </span>
              </div>
            )}

            {/* Amenities */}
            <div className="flex items-center gap-2 mb-3">
              {amenityIcons.map(({ key, icon: Icon, label }) =>
                activeAmenities[key as keyof typeof activeAmenities] ? (
                  <div key={key} title={label} className="w-6 h-6 rounded-lg bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center">
                    <Icon className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                  </div>
                ) : null
              )}
              {activeAmenities.furnished && (
                <span className="tag text-[10px]">Furnished</span>
              )}
            </div>

            {/* Footer with NoBroker style Contact Owner Button */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700 mt-auto gap-2">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {(() => {
                      if ((property.property_type === 'pg' || property.property_type === 'hostel') && property.sharing_configs?.length) {
                        const rents = property.sharing_configs.map(c => c.rent)
                        const min = Math.min(...rents)
                        const max = Math.max(...rents)
                        return min !== max ? `${formatCurrency(min)} - ${formatCurrency(max)}` : formatCurrency(min)
                      }
                      return formatCurrency(property.rent)
                    })()}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {(property.property_type === 'pg' || property.property_type === 'hostel') ? '/head/mo' : '/month'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Deposit: {formatCurrency(property.deposit)}</p>
              </div>

              {/* NoBroker Red Contact Owner Button */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowContactModal(true)
                }}
                className="group/btn px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-red-500/25 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 group-hover/btn:-rotate-12 transition-transform duration-200" /> Contact Owner
              </motion.button>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Contact Modal */}
      <ContactOwnerModal
        property={property}
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </>
  )
}
