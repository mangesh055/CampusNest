import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Users, DollarSign, Shield, Compass, MessageSquare, ArrowLeft, Phone, Check, ExternalLink, X } from 'lucide-react'
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

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

  let descObj = { text: roommate.description, deposit: 0, total_roommates: 1, location: '', amenities: [] as string[], images: [] as string[], video_url: '', phone: '', whatsapp: '' }
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
            <div className="h-48 sm:h-64 w-full bg-slate-200 dark:bg-slate-800 relative cursor-pointer" onClick={() => setSelectedImage(descObj.images?.[0] || null)}>
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

            {(descObj.images?.length > 0 || descObj.video_url) && (
              <div className="mb-10">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                  <span>📸 Media Gallery</span>
                  <span className="text-xs font-normal text-slate-400">
                    {descObj.images?.length || 0} images {descObj.video_url && '• 1 video'}
                  </span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {descObj.video_url && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setSelectedVideo(descObj.video_url!)}
                      className="relative rounded-2xl overflow-hidden w-24 h-24 sm:w-28 sm:h-28 cursor-pointer group bg-black shrink-0 shadow-sm border border-slate-200 dark:border-slate-700"
                    >
                      <video src={descObj.video_url} className="w-full h-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-105" preload="metadata" />
                      <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-all duration-200 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {descObj.images?.map((photo: string, i: number) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setSelectedImage(photo)}
                      className="relative rounded-2xl overflow-hidden w-24 h-24 sm:w-28 sm:h-28 cursor-pointer group shrink-0 shadow-sm border border-slate-200 dark:border-slate-700"
                    >
                      <img src={photo} alt={`Room photo ${i + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all duration-200 flex items-center justify-center">
                        <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {((descObj.amenities?.length || 0) > 0 || roommate.gender || roommate.food_preference) && (
              <div className="mb-10">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Amenities & Rules</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {roommate.gender && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Gender</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">{roommate.gender} Only</p>
                      </div>
                    </div>
                  )}
                  {roommate.food_preference && roommate.food_preference !== 'both' && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Diet</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">{roommate.food_preference}</p>
                      </div>
                    </div>
                  )}
                  {roommate.sleep_schedule && roommate.sleep_schedule !== 'flexible' && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Schedule</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">{roommate.sleep_schedule.replace('_', ' ')}</p>
                      </div>
                    </div>
                  )}
                  {roommate.smoking && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Smoking</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">Allowed</p>
                      </div>
                    </div>
                  )}

                  {descObj.amenities?.filter(Boolean).map(am => (
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
                <a href={`https://wa.me/${descObj.whatsapp.replace(/\D/g, '')}?text=Hi, I saw your room post on FlatsNFood!`} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-1 py-3.5 justify-center text-sm flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border-[#25D366]/20">
                  <MessageSquare className="w-4 h-4" /> WhatsApp
                </a>
              ) : descObj.phone ? (
                <a href={`https://wa.me/${descObj.phone.replace(/\D/g, '')}?text=Hi, I saw your room post on FlatsNFood!`} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-1 py-3.5 justify-center text-sm flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border-[#25D366]/20">
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

      {/* Fullscreen Media Modal */}
      {(selectedImage || selectedVideo) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setSelectedImage(null); setSelectedVideo(null); }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-pointer"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative z-10 max-w-5xl w-full h-full flex flex-col items-center justify-center pointer-events-none"
          >
            <button
              onClick={() => { setSelectedImage(null); setSelectedVideo(null); }}
              className="absolute top-0 right-0 sm:-right-4 sm:-top-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors pointer-events-auto z-20"
            >
              <X className="w-6 h-6" />
            </button>
            
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Fullscreen view"
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl pointer-events-auto"
              />
            ) : selectedVideo ? (
              <video
                src={selectedVideo}
                controls
                autoPlay
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl pointer-events-auto bg-black"
              />
            ) : null}
          </motion.div>
        </div>
      )}
    </div>
  )
}
