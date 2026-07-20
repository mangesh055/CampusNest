import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Building2, TrendingUp, DollarSign, Star, Eye, MessageSquare,
  Trash2, ToggleLeft, ToggleRight, X, Plus, Check, MapPin, Phone
} from 'lucide-react'
import { usePropertyStore } from '../../store/propertyStore'
import { useAuthStore } from '../../store/authStore'
import { formatCurrency } from '../../lib/utils'
import { uploadToCloudinary } from '../../utils/cloudinary'
import type { Property, PropertyType } from '../../types'

export default function OwnerDashboard() {
  const { properties, loadProperties, addProperty, updateProperty, toggleAvailability, deleteProperty } = usePropertyStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formStep, setFormStep] = useState(1)
  const [isUploading, setIsUploading] = useState(false)

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

  const { profile, initialized } = useAuthStore()

  useEffect(() => {
    if (initialized) {
      loadProperties()
    }
  }, [initialized, loadProperties])

  // We show properties associated with the active property owner
  const myProperties = properties.filter(p => p.owner_id === (profile?.id || 'owner1'))
  const displayProperties = myProperties

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

  const handleEdit = (property: Property) => {
    setEditingId(property.id)
    setFormData({
      title: property.title,
      description: property.description || '',
      property_type: property.property_type,
      rent: property.rent?.toString() || '0',
      deposit: property.deposit?.toString() || '0',
      address: property.address || '',
      city: property.city || 'Pune',
      state: property.state || 'Maharashtra',
      pincode: property.pincode || '',
      latitude: property.latitude?.toString() || '18.5204',
      longitude: property.longitude?.toString() || '73.8567',
      google_maps_url: property.google_maps_url || '',
      contact_phone: property.contact_phone || '+91 98765 43210',
      gender_preference: property.gender_preference as any || 'any',
      total_rooms: property.total_rooms?.toString() || '10',
      available_rooms: property.available_rooms?.toString() || '5',
      images: property.images?.length ? property.images : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600'],
      amenities: {
        wifi: !!property.amenities?.wifi,
        ac: !!property.amenities?.ac,
        laundry: !!property.amenities?.laundry,
        water: !!property.amenities?.water,
        electricity: !!property.amenities?.electricity,
        cctv: !!property.amenities?.cctv,
        security: !!property.amenities?.security,
        parking: !!property.amenities?.parking,
        attached_bathroom: !!property.amenities?.attached_bathroom,
        study_table: !!property.amenities?.study_table,
        furnished: !!property.amenities?.furnished,
      }
    })
    setFormStep(1)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile?.id) {
      alert('You must be logged in to create a property.')
      return
    }

    const propertyData = {
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
      amenities: formData.amenities,
    }

    let result
    if (editingId) {
      result = await updateProperty(editingId, propertyData)
    } else {
      result = await addProperty({
        ...propertyData,
        owner_id: profile.id,
        availability: true,
        featured: false,
      })
    }

    if (!result.success) {
      alert('Failed to save property: ' + result.error)
      return
    }

    // Reset Form
    setIsModalOpen(false)
    setEditingId(null)
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Property Owner Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage listings and add rental properties</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setEditingId(null); setIsModalOpen(true); }} className="btn-primary text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Listing
          </button>
        </div>
      </div>


      {/* Listings Management Panel */}
        <div className="card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Active Properties</h3>
              <p className="text-sm text-slate-500">Total: {displayProperties.length} active listings</p>
            </div>
            <button onClick={() => { setEditingId(null); setIsModalOpen(true); }} className="btn-primary w-full sm:w-auto text-sm py-2 flex justify-center items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add Property
            </button>
          </div>

          {displayProperties.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto border border-slate-100 dark:border-slate-800">
                <Building2 className="w-6 h-6 text-slate-405" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">No Active Listings</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">Welcome to FlatsNFoods Housing! List your PG, flat, or hostel room to start receiving views and student inquiries.</p>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="btn-primary py-2 px-5 text-xs mx-auto flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Your First Listing
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-2xl">
              <table className="w-full text-sm text-left md:min-w-[800px] md:whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Property Details</th>
                    <th className="hidden sm:table-cell py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Type</th>
                    <th className="hidden sm:table-cell py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Rent</th>
                    <th className="hidden sm:table-cell py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Rooms Left</th>
                    <th className="hidden sm:table-cell py-3 px-4 font-semibold text-slate-600 dark:text-slate-300 text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayProperties.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="py-4 px-4 flex items-center gap-3">
                        <img src={p.images[0]} alt={p.title} className="w-14 h-10 rounded-lg object-cover flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[220px]">{p.title}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {p.address}, {p.city}</p>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell py-4 px-4 capitalize text-xs text-slate-600 dark:text-slate-400 font-medium">{p.property_type.replace('_', ' ')}</td>
                      <td className="hidden sm:table-cell py-4 px-4 font-bold text-slate-800 dark:text-slate-200">{formatCurrency(p.rent)}/mo</td>
                      <td className="hidden sm:table-cell py-4 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">{p.available_rooms}/{p.total_rooms}</td>
                      <td className="hidden sm:table-cell py-4 px-4 text-center">
                        <button onClick={() => toggleAvailability(p.id)} className="focus:outline-none">
                          {p.availability ? (
                            <span className="badge badge-green inline-flex items-center gap-1 cursor-pointer">
                              <ToggleRight className="w-4 h-4" /> Available
                            </span>
                          ) : (
                            <span className="badge badge-red inline-flex items-center gap-1 cursor-pointer">
                              <ToggleLeft className="w-4 h-4" /> Fully Booked
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-1.5 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/20 rounded-lg text-slate-400 transition-colors inline-flex"
                          title="Edit Listing"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button
                          onClick={() => deleteProperty(p.id)}
                          className="p-1.5 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 rounded-lg text-slate-400 transition-colors inline-flex"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* Add Listing Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-glass overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">{editingId ? '✏️ Edit Rental Listing' : '🆕 Add New Rental Listing'}</h3>
                  <p className="text-xs text-slate-400">Step {formStep} of 3</p>
                </div>
                <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
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
                          <span className="text-xs text-slate-500 font-medium">{isUploading ? 'Uploading...' : 'Upload Local Image'}</span>
                          <input type="file" multiple accept="image/*" onChange={handleFileUpload} disabled={isUploading} className="hidden" />
                        </label>
                        <button
                          type="button"
                          onClick={handleAddImageUrl}
                          className="flex-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-3 flex flex-col items-center justify-center transition-colors"
                        >
                          <Plus className="w-5 h-5 text-slate-400 mb-1" />
                          <span className="text-xs text-slate-500 font-medium">Add via Link</span>
                        </button>
                      </div>
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
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
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
                      🚀 Launch Listing
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
