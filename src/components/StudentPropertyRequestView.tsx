import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Check, MapPin, Camera, Clock, CheckCircle, XCircle, Building2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { uploadToCloudinary } from '../utils/cloudinary'

import type { PropertyType } from '../types'

export default function StudentPropertyRequestView() {
  const { profile } = useAuthStore()
  const [formStep, setFormStep] = useState(1)
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'form' | 'logs'>('logs')
  const [requests, setRequests] = useState<any[]>([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(true)

  const fetchRequests = async () => {
    if (!profile?.id) return
    setIsLoadingRequests(true)
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', profile.id)
      .order('created_at', { ascending: false })
    
    if (data) setRequests(data)
    setIsLoadingRequests(false)
  }

  useEffect(() => {
    fetchRequests()
  }, [profile?.id])

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: 'pg' as PropertyType,
    rent: '',
    deposit: '',
    address: '',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '',
    latitude: '18.5204',
    longitude: '73.8567',
    google_maps_url: '',
    contact_phone: '+91 98765 43210',
    gender_preference: 'any' as 'male' | 'female' | 'any',
    total_rooms: '10',
    available_rooms: '5',
    images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600'] as string[],
    video_url: '',
    amenities: {
      wifi: true,
      ac: false,
      laundry: true,
      water: true,
      electricity: true,
      cctv: true,
      security: true,
      parking: false,
      attached_bathroom: false,
      study_table: true,
      furnished: true,
    }
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setIsUploading(true)
    try {
      const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file))
      const urls = await Promise.all(uploadPromises)

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...urls]
      }))
    } catch (error: any) {
      alert('Failed to upload image: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const url = await uploadToCloudinary(file)
      setFormData(prev => ({ ...prev, video_url: url }))
    } catch (error: any) {
      alert('Failed to upload video: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddImageUrl = () => {
    const url = prompt('Enter image URL:')
    if (url) {
      setFormData(prev => ({ ...prev, images: [...prev.images, url] }))
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleAmenityChange = (key: keyof typeof formData.amenities) => {
    setFormData(prev => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [key]: !prev.amenities[key]
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile?.id) {
      alert('You must be logged in to submit a request.')
      return
    }

    const propertyData: any = {
      id: 'prop-' + Date.now(),
      owner_id: profile.id, // Track who submitted the request
      title: formData.title || 'Cozy Shared PG Room',
      description: formData.description || 'Clean rooms with complete student amenities.',
      property_type: formData.property_type,
      rent: Number(formData.rent) || 6000,
      deposit: Number(formData.deposit) || 12000,
      address: formData.address || 'Kothrud, Pune',
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode || '411038',
      latitude: Number(formData.latitude) || 18.5204,
      longitude: Number(formData.longitude) || 73.8567,
      google_maps_url: formData.google_maps_url,
      contact_phone: formData.contact_phone,
      gender_preference: formData.gender_preference,
      total_rooms: Number(formData.total_rooms) || 10,
      available_rooms: Number(formData.available_rooms) || 5,
      images: formData.images,
      video_url: formData.video_url,
      amenities: formData.amenities,
      verified: false,
      is_student_request: true,
      availability: true,
      featured: false,
    }

    let { error } = await supabase.from('properties').insert([propertyData])

    // Fallback if is_student_request column is missing in DB schema
    if (error && (error.message.includes('is_student_request') || error.message.includes('column'))) {
      const fallbackData = { ...propertyData }
      delete fallbackData.is_student_request
      const retryResult = await supabase.from('properties').insert([fallbackData])
      error = retryResult.error
    }

    if (error) {
      alert('Failed to submit property request: ' + error.message)
      return
    }
    
    alert('Property request submitted to admin for approval!')

    fetchRequests()
    setActiveTab('logs')

    // Reset Form
    setFormStep(1)
    setFormData({
      title: '',
      description: '',
      property_type: 'pg',
      rent: '',
      deposit: '',
      address: '',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '',
      latitude: '18.5204',
      longitude: '73.8567',
      google_maps_url: '',
      contact_phone: '+91 98765 43210',
      gender_preference: 'any',
      total_rooms: '10',
      available_rooms: '5',
      images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600'],
      video_url: '',
      amenities: {
        wifi: true,
        ac: false,
        laundry: true,
        water: true,
        electricity: true,
        cctv: true,
        security: true,
        parking: false,
        attached_bathroom: false,
        study_table: true,
        furnished: true,
      }
    })
  }

  return (
    <div className="card w-full max-w-3xl mx-auto flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden mt-6">
      {/* Header Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'logs' ? 'text-brand-600 border-b-2 border-brand-500 bg-white dark:bg-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
        >
          My Requests History
        </button>
        <button
          onClick={() => setActiveTab('form')}
          className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'form' ? 'text-brand-600 border-b-2 border-brand-500 bg-white dark:bg-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Submit New Request
        </button>
      </div>

      {activeTab === 'logs' ? (
        <div className="p-6">
          <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-4">Your Applied Requests</h3>
          {isLoadingRequests ? (
            <div className="text-center py-8 text-slate-500">Loading your requests...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">You haven't submitted any property requests yet.</p>
              <button onClick={() => setActiveTab('form')} className="btn-primary mt-4 text-xs">Create Your First Request</button>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(req => (
                <div key={req.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
                  <div className="w-full sm:w-32 h-24 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0">
                    {req.images && req.images.length > 0 ? (
                      <img src={req.images[0]} alt={req.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Image</div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{req.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1 ${
                          req.verified 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {req.verified ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {req.verified ? 'Verified & Active' : 'Pending Approval'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{req.address}, {req.city}</p>
                    </div>
                    <div className="mt-3 flex gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>₹{req.rent}/mo</span>
                      <span>•</span>
                      <span className="capitalize">{req.property_type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
            <div>
              <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">🆕 Request to Add Property</h3>
              <p className="text-xs text-slate-500 mt-1">Submit a property listing request to the admin.</p>
              <p className="text-xs text-brand-500 font-medium mt-1">Step {formStep} of 3</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {formStep === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm border-b pb-1">1. Basic Information</h4>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Property Title / Name *</label>
                    <input
                      type="text" name="title" required value={formData.title} onChange={handleInputChange}
                      placeholder="e.g. Sunshine PG for Boys – Near MIT College" className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Description *</label>
                    <textarea
                      name="description" required rows={3} value={formData.description} onChange={handleInputChange}
                      placeholder="Detailed overview of PG layout, rules, and facilities..." className="input-field py-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Property Type</label>
                      <select name="property_type" value={formData.property_type} onChange={handleInputChange} className="input-field">
                        <option value="pg">PG</option>
                        <option value="hostel">Hostel</option>
                        <option value="flat">Flat</option>
                        <option value="shared_room">Shared Room</option>
                        <option value="private_room">Private Room</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Gender Preference</label>
                      <select name="gender_preference" value={formData.gender_preference} onChange={handleInputChange} className="input-field">
                        <option value="any">Any (Co-ed)</option>
                        <option value="male">Boys Only</option>
                        <option value="female">Girls Only</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {formStep === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm border-b pb-1">2. Price & Capacity</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Monthly Rent (₹) *</label>
                      <input
                        type="number" name="rent" required value={formData.rent} onChange={handleInputChange}
                        placeholder="e.g. 7500" className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Security Deposit (₹) *</label>
                      <input
                        type="number" name="deposit" required value={formData.deposit} onChange={handleInputChange}
                        placeholder="e.g. 15000" className="input-field"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Total Rooms</label>
                      <input
                        type="number" name="total_rooms" value={formData.total_rooms} onChange={handleInputChange}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Available Rooms Left</label>
                      <input
                        type="number" name="available_rooms" value={formData.available_rooms} onChange={handleInputChange}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Property Images</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                      {formData.images.map((img, i) => (
                        <div key={i} className="relative aspect-video rounded-lg overflow-hidden group">
                          <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <label className={`flex-1 cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-3 flex flex-col items-center justify-center transition-colors ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>
                        <Plus className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-xs text-slate-500 font-medium">{isUploading ? 'Uploading...' : 'Upload'}</span>
                        <input type="file" multiple accept="image/*" onChange={handleFileUpload} disabled={isUploading} className="hidden" />
                      </label>
                      <label className={`flex-1 cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-3 flex flex-col items-center justify-center transition-colors ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>
                        <Camera className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-xs text-slate-500 font-medium">Camera</span>
                        <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} disabled={isUploading} className="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="flex-[0.8] bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-3 flex flex-col items-center justify-center transition-colors"
                      >
                        <Plus className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-500 font-medium">Link</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Property Video (Optional)</label>
                    {formData.video_url ? (
                      <div className="relative aspect-video rounded-lg overflow-hidden group mb-2 border border-slate-200 dark:border-slate-700">
                        <video src={formData.video_url} controls className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, video_url: '' }))}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 w-full">
                        <label className={`cursor-pointer flex-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 flex flex-col items-center justify-center transition-colors ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>
                          <Plus className="w-6 h-6 text-slate-400 mb-2" />
                          <span className="text-sm text-slate-500 font-medium">{isUploading ? 'Uploading...' : 'Upload Video'}</span>
                          <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={isUploading} className="hidden" />
                        </label>
                        <label className={`cursor-pointer flex-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 flex flex-col items-center justify-center transition-colors ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>
                          <Camera className="w-6 h-6 text-slate-400 mb-2" />
                          <span className="text-sm text-slate-500 font-medium">{isUploading ? 'Uploading...' : 'Record Video'}</span>
                          <input type="file" accept="video/*" capture="environment" onChange={handleVideoUpload} disabled={isUploading} className="hidden" />
                        </label>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {formStep === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm border-b pb-1">3. Location & Amenities</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Address *</label>
                      <input
                        type="text" name="address" required value={formData.address} onChange={handleInputChange}
                        placeholder="e.g. Flat 12, Baner Road" className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">City</label>
                      <input
                        type="text" name="city" value={formData.city} onChange={handleInputChange}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Pincode *</label>
                      <input
                        type="text" name="pincode" required value={formData.pincode} onChange={handleInputChange}
                        placeholder="e.g. 411038" className="input-field"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">GPS Coordinates</label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              (pos) => {
                                setFormData(prev => ({
                                  ...prev,
                                  latitude: pos.coords.latitude.toString(),
                                  longitude: pos.coords.longitude.toString(),
                                  google_maps_url: `https://www.google.com/maps/search/?api=1&query=${pos.coords.latitude},${pos.coords.longitude}`
                                }))
                              },
                              (err) => alert('Unable to retrieve your location. Please ensure location permissions are granted.'),
                              { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                            )
                          } else {
                            alert('Geolocation is not supported by your browser.')
                          }
                        }}
                        className="btn-secondary whitespace-nowrap text-xs"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Auto-Detect Location
                      </button>
                    </div>

                    {/* Free Google Maps Embed Preview */}
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 mt-2">
                      <iframe
                        width="100%"
                        height="200"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        src={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}&output=embed`}
                      ></iframe>
                      <div className="p-2 text-center text-[10px] font-semibold text-slate-500 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                        Live Preview of Auto-Detected Coordinates
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Latitude (for OSM map)</label>
                      <input type="text" name="latitude" value={formData.latitude} onChange={handleInputChange} className="input-field py-1 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Longitude (for OSM map)</label>
                      <input type="text" name="longitude" value={formData.longitude} onChange={handleInputChange} className="input-field py-1 text-xs" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Direct Google Maps Link (Optional)</label>
                    <input
                      type="url" name="google_maps_url" value={formData.google_maps_url} onChange={handleInputChange}
                      placeholder="https://maps.app.goo.gl/..." className="input-field text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Amenities Provided</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.keys(formData.amenities).map((key) => {
                        const isChecked = formData.amenities[key as keyof typeof formData.amenities]
                        return (
                          <button
                            key={key} type="button"
                            onClick={() => handleAmenityChange(key as keyof typeof formData.amenities)}
                            className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all ${isChecked ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400' : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300'}`}
                          >
                            <span className="flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center">
                              {isChecked && <Check className="w-3 h-3 text-brand-500" />}
                            </span>
                            <span className="capitalize">{key.replace('_', ' ')}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10 relative">
                <button
                  type="button" disabled={formStep === 1}
                  onClick={() => setFormStep(p => p - 1)}
                  className="btn-secondary text-xs disabled:opacity-50"
                >
                  Previous
                </button>
          {formStep < 3 ? (
            <button
              type="button"
              onClick={() => setFormStep(p => p + 1)}
              className="btn-primary text-xs"
            >
              Next Step
            </button>
          ) : (
            <button type="submit" className="btn-primary text-xs shadow-glow">
              🚀 Submit Request
            </button>
          )}
        </div>
      </form>
        </>
      )}
    </div>
  )
}
