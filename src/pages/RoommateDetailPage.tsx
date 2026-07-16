import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Users, DollarSign, Shield, Compass, MessageSquare, ArrowLeft, Phone, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { RoommateProfile } from '../types'
import { cn, formatCurrency } from '../lib/utils'

export default function RoommateDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const [roommate, setRoommate] = useState<RoommateProfile & { full_name?: string | null; email?: string | null } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('roommate_profiles')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) throw error
        setRoommate(data)
      } catch (err) {
        console.error('Failed to load roommate details:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!roommate) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Room Post Not Found</h2>
        <button onClick={() => navigate('/roommates')} className="btn-primary">Back to Roommates</button>
      </div>
    )
  }

  let descObj = { text: roommate.description, deposit: 0, total_roommates: 1, location: '', amenities: [] as string[], images: [] as string[], phone: '', whatsapp: '' }
  try {
    const parsed = JSON.parse(roommate.description || '{}')
    if (parsed.text !== undefined) descObj = { ...descObj, ...parsed }
  } catch (e) {}

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/roommates')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-3xl shadow-card overflow-hidden">
          
          {(descObj.images?.length || 0) > 0 && (
            <div className="h-64 sm:h-96 w-full bg-slate-200 dark:bg-slate-800 relative">
              <img src={descObj.images?.[0]} alt="Room" className="w-full h-full object-cover" />
            </div>
          )}
          
          <div className="p-6 md:p-10">
            {!(descObj.images?.length || 0) && (
              <div className="flex justify-between items-start mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                  {((roommate as any).full_name || 'U').split(' ').map((n: string) => n[0]).join('')}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
                  {(roommate as any).full_name || 'Anonymous Student'}
                </h1>
                <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">{roommate.college} • {roommate.branch}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Rent</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{formatCurrency(roommate.budget_min)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Deposit</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{descObj.deposit ? formatCurrency(descObj.deposit) : 'N/A'}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Roommates</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{descObj.total_roommates}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Type</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-200 capitalize">{roommate.looking_for}</p>
              </div>
            </div>

            {descObj.location && (
              <div className="mb-10">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-500" /> Location Details
                </h3>
                <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {descObj.location}
                </div>
              </div>
            )}

            <div className="mb-10">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">About the Room</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                {descObj.text}
              </p>
            </div>

            {((descObj.amenities?.length || 0) > 0 || roommate.gender || roommate.food_preference) && (
              <div className="mb-10">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Amenities & Rules</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Gender</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">{roommate.gender} Only</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center shrink-0">
                      <span className="text-sm">🍲</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Diet</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">{roommate.food_preference}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                      <span className="text-sm">🕒</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Schedule</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">{roommate.sleep_schedule.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', roommate.smoking ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600')}>
                      <span className="text-sm">{roommate.smoking ? '🚬' : '🚭'}</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Smoking</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">{roommate.smoking ? 'Allowed' : 'Not Allowed'}</p>
                    </div>
                  </div>

                  {descObj.amenities?.map(am => (
                    <div key={am} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">{am}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 dark:border-slate-800 pt-8 mt-8 flex flex-col sm:flex-row gap-4">
              {descObj.phone ? (
                <a href={`tel:${descObj.phone}`} className="btn-primary flex-1 py-3.5 justify-center text-sm shadow-brand hover:shadow-brand-hover flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Call {descObj.phone}
                </a>
              ) : (
                <button className="btn-primary flex-1 py-3.5 justify-center text-sm shadow-brand hover:shadow-brand-hover flex items-center gap-2 opacity-50 cursor-not-allowed">
                  <Phone className="w-4 h-4" /> No Number
                </button>
              )}
              
              {descObj.whatsapp ? (
                <a href={`https://wa.me/${descObj.whatsapp.replace(/\D/g, '')}?text=Hi, I saw your room post on CampusNest!`} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-1 py-3.5 justify-center text-sm flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border-[#25D366]/20">
                  <MessageSquare className="w-4 h-4" /> WhatsApp
                </a>
              ) : descObj.phone ? (
                <a href={`https://wa.me/${descObj.phone.replace(/\D/g, '')}?text=Hi, I saw your room post on CampusNest!`} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-1 py-3.5 justify-center text-sm flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border-[#25D366]/20">
                  <MessageSquare className="w-4 h-4" /> WhatsApp
                </a>
              ) : (
                <button className="btn-secondary flex-1 py-3.5 justify-center text-sm flex items-center gap-2 opacity-50 cursor-not-allowed">
                  <MessageSquare className="w-4 h-4" /> No WhatsApp
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
