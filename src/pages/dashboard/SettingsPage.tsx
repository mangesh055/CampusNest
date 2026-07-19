import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, Bell, Moon, Sun, CreditCard, ShieldCheck, Save, Phone, Camera, X } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import { uploadToCloudinary } from '../../utils/cloudinary'

export default function SettingsPage() {
  const { profile, user, fetchProfile } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile')
  
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
    upiId: '',
    emergencyContact: '',
    dietaryPreference: 'none',
    emailNotifications: profile?.email_notifications ?? true,
    pushNotifications: profile?.push_notifications ?? false
  })

  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Password Update State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordVerified, setIsPasswordVerified] = useState(false)
  const [verifyingPassword, setVerifyingPassword] = useState(false)

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const cameraInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        emailNotifications: profile.email_notifications ?? prev.emailNotifications,
        pushNotifications: profile.push_notifications ?? prev.pushNotifications
      }))
    }
  }, [profile])

  const handleVerifyPassword = async () => {
    if (!currentPassword || !user?.email) return
    setVerifyingPassword(true)
    setMessage({ type: '', text: '' })
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      })
      if (error) throw new Error('Incorrect current password')
      
      setIsPasswordVerified(true)
      setMessage({ type: 'success', text: 'Password verified. You can now set a new password.' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to verify password' })
    } finally {
      setVerifyingPassword(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      if (activeTab === 'security' && isPasswordVerified) {
        if (!newPassword || newPassword !== confirmPassword) {
          throw new Error('New passwords do not match or are empty.')
        }
        if (newPassword.length < 6) {
          throw new Error('Password must be at least 6 characters.')
        }

        const { error: pwdError } = await supabase.auth.updateUser({ password: newPassword })
        if (pwdError) throw pwdError
        
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setIsPasswordVerified(false)
        setMessage({ type: 'success', text: 'Password updated successfully!' })
        setLoading(false)
        return
      }

      if (activeTab === 'profile') {
        if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
          throw new Error('Phone number must be exactly 10 digits.')
        }
      }

      if (activeTab === 'preferences' && profile?.role === 'student') {
        if (formData.emergencyContact && !/^[0-9]{10}$/.test(formData.emergencyContact)) {
          throw new Error('Emergency contact must be exactly 10 digits.')
        }
      }

      if (profile) {
        const { error: profileError } = await supabase.from('profiles').update({
          full_name: formData.fullName,
          phone: formData.phone,
          email_notifications: formData.emailNotifications,
          push_notifications: formData.pushNotifications,
          updated_at: new Date().toISOString()
        }).eq('id', profile.id)
        
        if (profileError) throw profileError
        await fetchProfile(profile.id)
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile.' })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setUploadingAvatar(true)
    setMessage({ type: '', text: '' })
    
    try {
      const publicUrl = await uploadToCloudinary(file);

      const { error: updateError } = await supabase.from('profiles').update({
        avatar_url: publicUrl
      }).eq('id', profile.id)

      if (updateError) throw updateError
      
      await fetchProfile(profile.id)
      setMessage({ type: 'success', text: 'Profile picture updated successfully!' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to upload profile picture.' })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleDeleteAvatar = async () => {
    if (!profile || !profile.avatar_url) return
    
    setUploadingAvatar(true)
    setMessage({ type: '', text: '' })
    
    try {
      // With Cloudinary from the frontend, we just remove the reference from the database.
      // Physical deletion requires backend authentication.

      const { error } = await supabase.from('profiles').update({ avatar_url: null }).eq('id', profile.id)
      if (error) throw error

      await fetchProfile(profile.id)
      setMessage({ type: 'success', text: 'Profile picture removed.' })
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to remove profile picture.' })
    } finally {
      setUploadingAvatar(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Account Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your profile, security, and application preferences</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'profile' ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <User className="w-4 h-4" /> Profile Info
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'security' ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Lock className="w-4 h-4" /> Security
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'notifications' ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Bell className="w-4 h-4" /> Notifications
          </button>
          {profile?.role === 'student' && (
            <button
              onClick={() => setActiveTab('preferences')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === 'preferences' ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Preferences
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            {message.text && (
              <div className={`p-4 mb-6 rounded-2xl text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                {message.text}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="relative">
                    {profile?.avatar_url ? (
                      <>
                        <img src={profile.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-white dark:border-slate-800" />
                        <button 
                          onClick={handleDeleteAvatar}
                          disabled={uploadingAvatar}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"
                          title="Remove Avatar"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                        {formData.fullName.charAt(0) || 'U'}
                      </div>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute bottom-0 right-0 bg-brand-500 text-white rounded-full p-1 shadow-md border-2 border-white dark:border-slate-900 hover:bg-brand-600 transition-colors"
                      title="Upload Photo"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>
                  <div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleAvatarUpload} 
                      accept="image/*" 
                      capture="user"
                      className="hidden" 
                    />
                    <input 
                      type="file" 
                      ref={cameraInputRef} 
                      onChange={handleAvatarUpload} 
                      accept="image/*" 
                      capture="user"
                      className="hidden" 
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="btn-secondary py-1.5 px-3 text-xs"
                      >
                        {uploadingAvatar ? 'Uploading...' : 'Upload File'}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="input-field opacity-70 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-slate-500">Email cannot be changed.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input-field pl-10"
                        placeholder="9876543210"
                        pattern="[0-9]{10}"
                        title="Please enter a 10 digit mobile number"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Role</label>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 capitalize">
                      {profile?.role?.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><Lock className="w-4 h-4" /> Change Password</h3>
                  
                  {!isPasswordVerified ? (
                    <div className="space-y-2 max-w-md">
                      <label className="text-xs font-bold text-slate-400 uppercase">Current Password</label>
                      <div className="flex gap-2">
                        <input 
                          type="password" 
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••" 
                          className="input-field flex-1" 
                        />
                        <button 
                          onClick={handleVerifyPassword}
                          disabled={!currentPassword || verifyingPassword}
                          className="btn-secondary whitespace-nowrap"
                        >
                          {verifyingPassword ? 'Verifying...' : 'Verify'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 max-w-md">
                        <label className="text-xs font-bold text-slate-400 uppercase text-brand-500">Current Password Verified ✓</label>
                      </div>
                      <div className="space-y-2 max-w-md">
                        <label className="text-xs font-bold text-slate-400 uppercase">New Password</label>
                        <input 
                          type="password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••" 
                          className="input-field" 
                        />
                      </div>
                      <div className="space-y-2 max-w-md">
                        <label className="text-xs font-bold text-slate-400 uppercase">Confirm New Password</label>
                        <input 
                          type="password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••" 
                          className="input-field" 
                        />
                      </div>
                    </>
                  )}
                </div>
                

              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Email Notifications</h4>
                    <p className="text-xs text-slate-500 mt-1">Receive updates and alerts via email.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.emailNotifications}
                      onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-brand-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Push Notifications</h4>
                    <p className="text-xs text-slate-500 mt-1">Receive real-time alerts on this browser.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.pushNotifications}
                      onChange={(e) => setFormData({ ...formData, pushNotifications: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-brand-500"></div>
                  </label>
                </div>
              </div>
            )}



            {activeTab === 'preferences' && profile?.role === 'student' && (
              <div className="space-y-6">
                <div className="space-y-2 max-w-md">
                  <label className="text-xs font-bold text-slate-400 uppercase">Dietary Preferences</label>
                  <select
                    value={formData.dietaryPreference}
                    onChange={(e) => setFormData({ ...formData, dietaryPreference: e.target.value })}
                    className="input-field"
                  >
                    <option value="none">None / Standard</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="jain">Jain (No Root Vegetables)</option>
                    <option value="halal">Halal</option>
                  </select>
                </div>
                <div className="space-y-2 max-w-md">
                  <label className="text-xs font-bold text-slate-400 uppercase">Emergency Contact</label>
                  <input
                    type="tel"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="input-field"
                    placeholder="Parent / Guardian 10-digit Phone"
                    pattern="[0-9]{10}"
                    title="Please enter a 10 digit mobile number"
                  />
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className="btn-primary py-2.5 px-6 gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
