import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MessageSquare, Phone, ExternalLink, X, MapPin, Tag } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { cn, formatCurrency } from '../lib/utils'

export default function CommunityDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('community_posts')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) throw error
        setPost(data)
      } catch (err) {
        console.error('Failed to load community post details:', err)
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

  if (!post) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Post Not Found</h2>
        <button onClick={() => navigate('/community')} className="btn-primary">Back to Community</button>
      </div>
    )
  }

  let textContent = post.content
  let phone = ''
  let location = ''
  let images: string[] = post.images || []
  
  let video_url = ''
  
  try {
    const parsed = JSON.parse(post.content)
    if (parsed.text) {
      textContent = parsed.text
      phone = parsed.phone || ''
      location = parsed.location || ''
      if (parsed.images && parsed.images.length > 0) {
        images = parsed.images
      }
      if (parsed.video_url) {
        video_url = parsed.video_url
      }
    }
  } catch (e) {}

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/community')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to board
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-3xl shadow-card overflow-hidden">
          {images.length > 0 && (
            <div className="h-48 sm:h-64 w-full bg-slate-200 dark:bg-slate-800 relative cursor-pointer" onClick={() => setSelectedImage(images[0])}>
              <img src={images[0]} alt="Post Banner" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-5 md:p-8">
            {images.length === 0 && (
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {(post.full_name || 'U').split(' ').map((n: string) => n[0]).join('')}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-purple px-2 py-1 text-xs capitalize">{post.category}</span>
                  <span className="text-xs text-slate-400 font-medium">{new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <h1 className="text-2xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-2">
                  {post.title}
                </h1>
                <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                  Posted by <span className="text-brand-600 dark:text-brand-400">{post.full_name || 'Anonymous'}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
              {post.price !== undefined && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Asking Price</p>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(post.price)}</p>
                </div>
              )}
              {location && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 col-span-2">
                  <p className="text-xs text-slate-400 font-semibold uppercase mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{location}</p>
                </div>
              )}
            </div>

            <div className="mb-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Description</h3>
              <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                {textContent}
              </div>
            </div>

            {(images.length > 0 || video_url) && (
              <div className="mb-5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-between">
                  <span>📸 Media Gallery</span>
                  <span className="text-xs font-normal text-slate-400">
                    {images.length} images {video_url && '• 1 video'}
                  </span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {video_url && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setSelectedVideo(video_url)}
                      className="relative rounded-2xl overflow-hidden w-24 h-24 sm:w-28 sm:h-28 cursor-pointer group bg-black shrink-0 shadow-sm border border-slate-200 dark:border-slate-700"
                    >
                      <video src={video_url} className="w-full h-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-105" preload="metadata" />
                      <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-all duration-200 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {images.map((photo: string, i: number) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setSelectedImage(photo)}
                      className="relative rounded-2xl overflow-hidden w-24 h-24 sm:w-28 sm:h-28 cursor-pointer group shrink-0 shadow-sm border border-slate-200 dark:border-slate-700"
                    >
                      <img src={photo} alt={`Post attachment ${i + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all duration-200 flex items-center justify-center">
                        <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 mt-5 flex flex-col sm:flex-row gap-3">
              {phone ? (
                <>
                  <a href={`tel:${phone}`} className="btn-primary flex-1 py-3.5 justify-center text-sm shadow-brand hover:shadow-brand-hover flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Call {phone}
                  </a>
                  <a href={`https://wa.me/${phone.replace(/\D/g, '')}?text=Hi, I saw your post "${post.title}" on FlatsNFood!`} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-1 py-3.5 justify-center text-sm flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border-[#25D366]/20">
                    <MessageSquare className="w-4 h-4" /> WhatsApp
                  </a>
                </>
              ) : (
                <div className="w-full text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-sm text-slate-500 italic">The author did not provide contact details for this post.</p>
                </div>
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
