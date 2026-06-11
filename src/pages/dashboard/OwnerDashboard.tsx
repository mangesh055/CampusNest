import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Building2, TrendingUp, DollarSign, Star, Eye, MessageSquare, 
  Trash2, ToggleLeft, ToggleRight, X, Plus, Check, MapPin, Phone
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { usePropertyStore } from '../../store/propertyStore'
import { useAuthStore } from '../../store/authStore'
import { formatCurrency } from '../../lib/utils'
import type { Property, PropertyType } from '../../types'
import MapComponent from '../../components/map/MapComponent'

const viewsData = [
  { day: 'Mon', views: 24 }, { day: 'Tue', views: 38 }, { day: 'Wed', views: 52 },
  { day: 'Thu', views: 41 }, { day: 'Fri', views: 68 }, { day: 'Sat', views: 55 }, { day: 'Sun', views: 34 },
]

export default function OwnerDashboard() {
  const { properties, addProperty, toggleAvailability, deleteProperty } = usePropertyStore()
  const [view, setView] = useState<'overview' | 'listings'>('overview')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formStep, setFormStep] = useState(1)

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
    contact_phone: '+91 98765 43210',
    gender_preference: 'any' as 'male' | 'female' | 'any',
    total_rooms: '10',
    available_rooms: '5',
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600',
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

  const { profile } = useAuthStore()

  // We show properties associated with the active property owner
  const myProperties = properties.filter(p => p.owner_id === (profile?.id || 'owner1'))
  const displayProperties = myProperties

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    addProperty({
      owner_id: profile?.id || 'owner1',
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
      contact_phone: formData.contact_phone,
      gender_preference: formData.gender_preference,
      total_rooms: Number(formData.total_rooms) || 10,
      available_rooms: Number(formData.available_rooms) || 5,
      images: [formData.imageUrl],
      amenities: formData.amenities,
      availability: true,
      featured: false,
    })

    // Reset Form
    setIsModalOpen(false)
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
      contact_phone: '+91 98765 43210',
      gender_preference: 'any',
      total_rooms: '10',
      available_rooms: '5',
      imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600',
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

  const stats = [
    { label: 'Total Listings', value: displayProperties.length.toString(), icon: '🏠', color: 'from-brand-400 to-brand-600', change: '+1 this week' },
    { label: 'Total Views', value: '1,248', icon: '👁️', color: 'from-blue-400 to-blue-600', change: '+18% vs last month' },
    { label: 'Inquiries', value: '34', icon: '💬', color: 'from-emerald-400 to-emerald-600', change: '+5 this week' },
    { label: 'Avg Rating', value: '4.5', icon: '⭐', color: 'from-amber-400 to-amber-600', change: 'Based on 45 reviews' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Property Owner Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage listings, add rental properties, and view student analytics</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setView(view === 'overview' ? 'listings' : 'overview')}
            className="btn-secondary text-sm"
          >
            {view === 'overview' ? '📁 Manage Listings' : '📊 View Analytics'}
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Listing
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button 
          onClick={() => setView('overview')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${view === 'overview' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setView('listings')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${view === 'listings' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Manage Listings ({displayProperties.length})
        </button>
      </div>

      {view === 'overview' ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="card p-5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl mb-3`}>{s.icon}</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                  <div className="text-[11px] text-emerald-500 mt-1">{s.change}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Views Chart */}
            <div className="card p-6 lg:col-span-2">
              <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-500" /> Views This Week
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={viewsData}>
                  <defs>
                    <linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="views" stroke="#6366f1" fill="url(#viewGrad)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Listings View */}
            <div className="card p-6">
              <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">My Listings</h3>
              {displayProperties.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-xs text-slate-500 italic">No listings added yet.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {displayProperties.map(p => (
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <img src={p.images[0]} alt={p.title} className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{p.title}</p>
                          <p className="text-[10px] text-slate-500">{formatCurrency(p.rent)}/mo • {p.available_rooms} left</p>
                        </div>
                        <div className="flex items-center gap-0.5 text-xs">
                          <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                          <span className="text-[10px] font-medium">{p.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setView('listings')} className="btn-secondary w-full justify-center mt-4 text-xs">
                    Manage All Listings ({displayProperties.length})
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Inquiries */}
          <div className="card p-6">
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-500" /> Recent Inquiries
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Rahul Sharma', property: 'Sunshine PG for Boys', time: '2 hours ago', msg: 'Is the room still available for August?' },
                { name: 'Priya Patel', property: 'Sunshine PG for Boys', time: '5 hours ago', msg: 'Can I visit tomorrow for inspection?' },
                { name: 'Amit Kumar', property: 'Modern 2BHK Flat', time: '1 day ago', msg: 'What are the security deposit terms?' },
              ].map((inq, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {inq.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{inq.name}</p>
                      <p className="text-xs text-slate-400">{inq.time}</p>
                    </div>
                    <p className="text-xs text-slate-500">{inq.property}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{inq.msg}</p>
                  </div>
                  <button className="btn-ghost text-xs px-2.5 py-1">Reply</button>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Listings Management Panel */
        <div className="card p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">Active Properties</h3>
              <p className="text-xs text-slate-400">Total: {displayProperties.length} active listings</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary text-xs flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add Property
            </button>
          </div>

          {displayProperties.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto border border-slate-100 dark:border-slate-800">
                <Building2 className="w-6 h-6 text-slate-405" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">No Active Listings</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">Welcome to CampusNest Housing! List your PG, flat, or hostel room to start receiving views and student inquiries.</p>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="btn-primary py-2 px-5 text-xs mx-auto flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Your First Listing
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-2xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Property Details</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Type</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Rent</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Rooms Left</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300 text-center">Status</th>
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
                    <td className="py-4 px-4 capitalize text-xs text-slate-600 dark:text-slate-400 font-medium">{p.property_type.replace('_', ' ')}</td>
                    <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">{formatCurrency(p.rent)}/mo</td>
                    <td className="py-4 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">{p.available_rooms}/{p.total_rooms}</td>
                    <td className="py-4 px-4 text-center">
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
                    <td className="py-4 px-4 text-right space-x-1.5">
                      <button 
                        onClick={() => deleteProperty(p.id)}
                        className="p-1.5 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 rounded-lg text-slate-400 transition-colors"
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
      )}

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
                  <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">🆕 Add New Rental Listing</h3>
                  <p className="text-xs text-slate-400">Step {formStep} of 3</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600">
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
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Cover Image URL</label>
                      <input 
                        type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange}
                        placeholder="https://images.unsplash.com/..." className="input-field text-xs" 
                      />
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

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Mark Location on Map</label>
                      <MapComponent
                        center={[Number(formData.latitude) || 18.5204, Number(formData.longitude) || 73.8567]}
                        zoom={14}
                        height="200px"
                        interactivePicker={true}
                        onLocationSelect={(lat, lng) => {
                          setFormData(prev => ({
                            ...prev,
                            latitude: lat.toString(),
                            longitude: lng.toString()
                          }))
                        }}
                      />
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
