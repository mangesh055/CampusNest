import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, Bell, Moon, Sun, CreditCard, ShieldCheck, Save, Phone } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'

export default function SettingsPage() {
  const { profile, user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile')
  
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
    upiId: '',
    emergencyContact: '',
    dietaryPreference: 'none'
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  React.useEffect(() => {
    const loadSettings = async () => {
      if (!profile || profile.role !== 'mess_owner') return
      const { data } = await supabase.from('mess_payment_settings').select('*').eq('owner_id', profile.id).maybeSingle()
      if (data) {
        setFormData((current) => ({ ...current, upiId: data.upi_id || '' }))
      }
    }

    void loadSettings()
  }, [profile])

  const handleSave = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      if (profile?.role === 'mess_owner') {
        const { error } = await supabase.from('mess_payment_settings').upsert({
          owner_id: profile.id,
          upi_id: formData.upiId,
          phone_number: formData.phone || '',
          updated_at: new Date().toISOString(),
        })

        if (error) throw error
      }

      setMessage({ type: 'success', text: 'Settings updated successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update settings.' })
    } finally {
      setLoading(false)
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
          {(profile?.role === 'student' || profile?.role === 'mess_owner') && (
            <button
              onClick={() => setActiveTab('preferences')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === 'preferences' ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <CreditCard className="w-4 h-4" /> {profile?.role === 'mess_owner' ? 'Payment Settings' : 'Preferences'}
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
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-2xl font-bold">
                    {formData.fullName.charAt(0) || 'U'}
                  </div>
                  <div>
                    <button className="btn-secondary py-1.5 px-3 text-xs">Change Avatar</button>
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
                        placeholder="+91 "
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
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Current Password</label>
                    <input type="password" placeholder="••••••••" className="input-field max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">New Password</label>
                    <input type="password" placeholder="••••••••" className="input-field max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className="input-field max-w-md" />
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Two-Factor Authentication</h3>
                  <p className="text-sm text-slate-500">Add an extra layer of security to your account. We'll ask for a code when you sign in from a new device.</p>
                  <button className="btn-secondary">Enable 2FA</button>
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
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-brand-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Push Notifications</h4>
                    <p className="text-xs text-slate-500 mt-1">Receive real-time alerts on this browser.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-brand-500"></div>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && profile?.role === 'mess_owner' && (
              <div className="space-y-6">
                <div className="space-y-2 max-w-md">
                  <label className="text-xs font-bold text-slate-400 uppercase">UPI ID for Payments</label>
                  <input
                    type="text"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    className="input-field font-mono"
                    placeholder="merchant@upi"
                  />
                  <p className="text-xs text-slate-500 mt-1">This UPI ID will be used to generate dynamic QR codes for student subscriptions.</p>
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
                    placeholder="Parent / Guardian Phone"
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
