import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, MapPin, Camera, Save, Shield, Calendar, BookOpen } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { getInitials } from '../../lib/utils'
import { supabase } from '../../lib/supabase'
import { uploadToCloudinary } from '../../utils/cloudinary'

export default function ProfilePage() {
  const { profile, fetchProfile } = useAuthStore()
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    course: 'B.Tech Computer Science', // Mock additional data
    year: '3rd Year',
    bio: 'Student at University. Looking for a quiet PG and good vegetarian mess.',
    address: '123 Campus Road, City'
  })

  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    // In a real app, this would call supabase to update the profile table
    setIsEditing(false)
    alert('Profile updated successfully! (Simulated)')
  }

  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setUploadingAvatar(true)
    try {
      const publicUrl = await uploadToCloudinary(file)

      const { error: updateError } = await supabase.from('profiles').update({
        avatar_url: publicUrl
      }).eq('id', profile.id)

      if (updateError) throw updateError
      
      await fetchProfile(profile.id)
    } catch (error: any) {
      alert('Failed to upload profile picture: ' + error.message)
    } finally {
      setUploadingAvatar(false)
    }
  }

  if (!profile) return null

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your personal information and public profile</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Avatar & Quick Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="card p-6 flex flex-col items-center text-center">
            <div className="relative mb-4 group inline-block">
              <div className="relative w-32 h-32 rounded-full shadow-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-4xl font-bold">
                    {getInitials(profile.full_name || 'User')}
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-700 text-brand-500 hover:text-brand-600 hover:scale-110 transition-transform z-10"
              >
                <Camera className="w-5 h-5" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                accept="image/*" 
                capture="user"
                className="hidden" 
              />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{formData.full_name}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">{profile.email}</p>
            <span className="badge badge-purple uppercase tracking-wider text-xs px-3 py-1">
              {profile.role.replace('_', ' ')}
            </span>
            
            <div className="w-full mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3 text-sm text-left">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <Shield className="w-4 h-4 text-emerald-500" /> Account Verified
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <Calendar className="w-4 h-4 text-brand-500" /> Joined June 2026
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Profile Details */}
        <div className="md:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h3>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`btn-${isEditing ? 'primary' : 'secondary'} py-2 px-4 text-sm flex items-center gap-2`}
              >
                {isEditing ? <><Save className="w-4 h-4" /> Save Changes</> : 'Edit Profile'}
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      className="input-field" 
                      value={formData.full_name}
                      onChange={e => setFormData({...formData, full_name: e.target.value})}
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-900 dark:text-white font-medium text-sm">{formData.full_name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone Number</label>
                  {isEditing ? (
                    <input 
                      type="tel" 
                      className="input-field" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-900 dark:text-white font-medium text-sm">{formData.phone || 'Not provided'}</span>
                    </div>
                  )}
                </div>
              </div>

              {profile.role === 'student' && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Course / Degree</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="input-field" 
                        value={formData.course}
                        onChange={e => setFormData({...formData, course: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-900 dark:text-white font-medium text-sm">{formData.course}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Year of Study</label>
                    {isEditing ? (
                      <select 
                        className="input-field"
                        value={formData.year}
                        onChange={e => setFormData({...formData, year: e.target.value})}
                      >
                        <option>1st Year</option>
                        <option>2nd Year</option>
                        <option>3rd Year</option>
                        <option>4th Year</option>
                        <option>Postgraduate</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-900 dark:text-white font-medium text-sm">{formData.year}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Address</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    className="input-field" 
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900 dark:text-white font-medium text-sm">{formData.address}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bio / About</label>
                {isEditing ? (
                  <textarea 
                    className="input-field min-h-[100px] resize-none" 
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell us a little about yourself..."
                  />
                ) : (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 min-h-[100px]">
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{formData.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
