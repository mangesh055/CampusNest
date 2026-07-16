import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Star, Heart, Share2, ChevronLeft, ChevronRight, CheckCircle, Navigation2, ExternalLink, ShieldCheck } from 'lucide-react'

import { usePropertyStore } from '../store/propertyStore'
import { formatCurrency, propertyTypeLabels, formatDate, getInitials } from '../lib/utils'
import { cn } from '../lib/utils'
import { useAuthStore } from '../store/authStore'
import { fetchReviews } from '../lib/platformData'
import { supabase } from '../lib/supabase'

type ReviewRow = {
  id: string
  reviewer_id: string
  property_id?: string
  rating: number
  comment: string
  created_at: string
  profiles?: { full_name?: string | null }
}

export default function PropertyDetailPage() {
  const { id } = useParams()
  const { properties, loadProperties } = usePropertyStore()
  const property = properties.find(p => p.id === id)
  const [currentImage, setCurrentImage] = useState(0)
  const [favorited, setFavorited] = useState(false)
  
  const { profile } = useAuthStore()
  const [reviewsList, setReviewsList] = useState<ReviewRow[]>([])
  const [newReview, setNewReview] = useState('')
  const [newRating, setNewRating] = useState(0)

  useEffect(() => {
    void loadProperties()
  }, [loadProperties])

  useEffect(() => {
    const loadReviews = async () => {
      if (!id) return
      try {
        const rows = await fetchReviews({ propertyId: id })
        setReviewsList(rows as ReviewRow[])
      } catch (error) {
        console.error('Failed to load property reviews from Supabase:', error)
        setReviewsList([])
      }
    }

    loadReviews()
  }, [id])

  if (!property) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center text-slate-500">
        Loading property details from Supabase...
      </div>
    )
  }

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReview.trim() || newRating === 0) return

    const newR = {
      id: `review-${Date.now()}`,
      property_id: property.id,
      reviewer_id: profile?.id || 'anon',
      rating: newRating,
      comment: newReview,
      created_at: new Date().toISOString(),
      profiles: { full_name: profile?.full_name || 'Anonymous' }
    }

    void (async () => {
      const { error } = await supabase.from('reviews').insert([newR])
      if (error) {
        console.error('Failed to save review to Supabase:', error)
        return
      }

      setReviewsList([newR, ...reviewsList])
      setNewReview('')
      setNewRating(0)
    })()
  }

  // Google Maps URL
  const googleMapsUrl = property.latitude && property.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.title} ${property.address} ${property.city}`)}`

  const amenityList = [
    { key: 'wifi', icon: '📶', label: 'WiFi' },
    { key: 'ac', icon: '❄️', label: 'AC' },
    { key: 'laundry', icon: '👕', label: 'Laundry' },
    { key: 'water', icon: '💧', label: 'Water 24/7' },
    { key: 'electricity', icon: '⚡', label: 'Electricity' },
    { key: 'cctv', icon: '📷', label: 'CCTV' },
    { key: 'security', icon: '🔒', label: 'Security' },
    { key: 'parking', icon: '🚗', label: 'Parking' },
    { key: 'attached_bathroom', icon: '🚿', label: 'Attached Bathroom' },
    { key: 'study_table', icon: '📚', label: 'Study Table' },
    { key: 'furnished', icon: '🛋️', label: 'Furnished' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back */}
        <Link to="/properties" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors mb-6 text-sm">
          <ChevronLeft className="w-4 h-4" /> Back to Properties
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Images + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="card overflow-hidden">
              <div className="relative h-80">
                <img src={property.images[currentImage]} alt={property.title} className="w-full h-full object-cover" />
                {property.images.length > 1 && (
                  <>
                    <button onClick={() => setCurrentImage(i => Math.max(0, i - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => setCurrentImage(i => Math.min(property.images.length - 1, i + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {property.images.map((_, i) => (
                        <button key={i} onClick={() => setCurrentImage(i)}
                          className={cn('w-2 h-2 rounded-full transition-all', i === currentImage ? 'bg-white w-4' : 'bg-white/60')} />
                      ))}
                    </div>
                  </>
                )}
                {/* Top badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="badge badge-purple">{propertyTypeLabels[property.property_type]}</span>
                  {property.verified && <span className="badge badge-green">✓ Verified</span>}
                  {property.featured && <span className="badge badge-orange">⭐ Featured</span>}
                </div>
                {/* Action buttons */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button onClick={() => setFavorited(!favorited)}
                    className={cn('w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm',
                      favorited ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-600 hover:text-red-500')}>
                    <Heart className={cn('w-4 h-4', favorited && 'fill-current')} />
                  </button>
                  <button className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                    <Share2 className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
              {property.images.length > 1 && (
                <div className="p-3 flex gap-2 bg-white dark:bg-slate-800 overflow-x-auto">
                  {property.images.map((img, i) => (
                    <img key={i} src={img} alt="" onClick={() => setCurrentImage(i)}
                      className={cn('w-16 h-12 object-cover rounded-lg cursor-pointer flex-shrink-0 border-2 transition-all',
                        i === currentImage ? 'border-brand-500' : 'border-transparent opacity-70 hover:opacity-100')} />
                  ))}
                </div>
              )}
            </div>

            {/* Property Info */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">{property.title}</h1>
                  <div className="flex items-center gap-1.5 mt-2 text-slate-500 dark:text-slate-400 text-sm">
                    <MapPin className="w-4 h-4 text-brand-500" />
                    {property.address}, {property.city}, {property.state} - {property.pincode}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Star className="w-4 h-4 star-filled" />
                    <span className="font-bold text-slate-900 dark:text-white">{property.rating}</span>
                    <span className="text-slate-400 text-sm">({property.review_count})</span>
                  </div>
                  <span className={cn('badge mt-1', property.gender_preference === 'male' ? 'badge-blue' : property.gender_preference === 'female' ? 'bg-pink-100 text-pink-700' : 'badge-green')}>
                    {property.gender_preference === 'male' ? '👨 Boys Only' : property.gender_preference === 'female' ? '👩 Girls Only' : '👥 Any Gender'}
                  </span>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">{property.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 mb-6">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Monthly Rent</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(property.rent)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Security Deposit</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(property.deposit)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Available Rooms</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{property.available_rooms ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <span className={cn('badge', property.availability ? 'badge-green' : 'badge-red')}>
                    {property.availability ? '✓ Available' : 'Full'}
                  </span>
                </div>
              </div>

              <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {amenityList.map(({ key, icon, label }) => {
                  const has = property.amenities[key as keyof typeof property.amenities]
                  return (
                    <div key={key} className={cn('flex items-center gap-2 p-3 rounded-xl border', has ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700 opacity-50')}>
                      <span>{icon}</span>
                      <span className={cn('text-sm font-medium', has ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400')}>{label}</span>
                      {has && <CheckCircle className="w-3 h-3 text-emerald-500 ml-auto" />}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Reviews */}
            <div className="card p-6">
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-xl mb-6">
                Reviews ({property.review_count})
              </h3>
              <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div className="text-center">
                  <div className="text-5xl font-bold text-slate-900 dark:text-white">{property.rating}</div>
                  <div className="flex justify-center gap-0.5 my-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={cn('w-4 h-4', s <= Math.floor(property.rating) ? 'star-filled' : 'star-empty')} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">{property.review_count} reviews</p>
                </div>
                <div className="flex-1 space-y-2">
                  {[5,4,3,2,1].map(star => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-2">{star}</span>
                      <Star className="w-3 h-3 text-amber-400" />
                      <div className="flex-1 progress-bar">
                        <div className="progress-fill" style={{ width: `${star === 5 ? 60 : star === 4 ? 25 : star === 3 ? 10 : star === 2 ? 3 : 2}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Review Form */}
              <div className="mb-6 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
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

              {reviewsList.length > 0 ? (
                <div className="space-y-4">
                  {reviewsList.map(review => (
                    <div key={review.id} className="border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {getInitials(review.profiles?.full_name || 'U')}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm text-slate-900 dark:text-white">{review.profiles?.full_name}</p>
                            <p className="text-xs text-slate-400">{formatDate(review.created_at)}</p>
                          </div>
                          <div className="flex gap-0.5 my-1">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={cn('w-3 h-3', s <= review.rating ? 'star-filled' : 'star-empty')} />
                            ))}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-4">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>

          {/* Right: Contact + Location Card */}
          <div className="space-y-4">
            <div className="card p-6 sticky top-24 space-y-5">
              {/* Price */}
              <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(property.rent)}</div>
                <p className="text-slate-500 text-sm mt-0.5">/month + {formatCurrency(property.deposit)} deposit</p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <a href={`tel:${property.contact_phone}`}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-brand-500 text-brand-600 dark:text-brand-400 font-bold text-sm hover:bg-brand-500 hover:text-white transition-all">
                  <Phone className="w-4 h-4" /> CALL
                </a>
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-orange-500 text-orange-600 font-bold text-sm hover:bg-orange-500 hover:text-white transition-all">
                  <Navigation2 className="w-4 h-4" /> DIRECTION
                </a>
              </div>

              {property.contact_email && (
                <a href={`mailto:${property.contact_email}`} className="btn-ghost w-full justify-center border border-slate-200 dark:border-slate-700">
                  <Mail className="w-4 h-4" /> Send Email
                </a>
              )}

              {/* Property details */}
              <div className="space-y-2 text-sm pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between"><span className="text-slate-500">Property Type</span><span className="font-medium text-slate-900 dark:text-white">{propertyTypeLabels[property.property_type]}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Gender</span><span className="font-medium text-slate-900 dark:text-white capitalize">{property.gender_preference}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Available Rooms</span><span className="font-medium text-slate-900 dark:text-white">{property.available_rooms}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Verified</span>
                  <span className={property.verified ? 'text-emerald-500 font-medium flex items-center gap-1' : 'text-red-400 font-medium'}>
                    {property.verified ? <><ShieldCheck className="w-3.5 h-3.5" /> Yes</> : '✗ No'}
                  </span>
                </div>
              </div>

              {/* Location section */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" /> Location
                </p>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{property.address}</p>
                  <p className="text-xs text-slate-500 mt-1">{property.city}, {property.state} — {property.pincode}</p>
                </div>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-md shadow-orange-500/20"
                >
                  <Navigation2 className="w-4 h-4" /> Open in Google Maps <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
