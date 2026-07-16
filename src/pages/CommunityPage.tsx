import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, MessageSquare, Heart, ThumbsUp, Send, Share2, X, ShoppingBag, BookOpen, Bike, Calendar, Megaphone, HelpCircle, Pencil } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import type { CommunityPost } from '../types'
import { cn, formatCurrency } from '../lib/utils'
import { fetchCommunityComments, fetchCommunityPosts } from '../lib/platformData'
import { supabase } from '../lib/supabase'

const categoryConfig = {
  all: { label: 'All Board', icon: HelpCircle, color: 'text-slate-500 bg-slate-100' },
  notes: { label: 'Study Notes', icon: BookOpen, color: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/20' },
  books: { label: 'Textbooks', icon: BookOpen, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20' },
  cycles: { label: 'Bicycles', icon: Bike, color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20' },
  bikes: { label: 'Motorbikes', icon: Bike, color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20' },
  events: { label: 'Events / Jobs', icon: Calendar, color: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/20' },
  announcements: { label: 'Announcements', icon: Megaphone, color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/20' },
  general: { label: 'General', icon: HelpCircle, color: 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-800' }
}

export default function CommunityPage() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()

  // State
  const [posts, setPosts] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [isEditingPostId, setIsEditingPostId] = useState<string | null>(null)

  // Form State
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'general' as keyof typeof categoryConfig,
    price: '',
    phone: '',
    phone_code: '+91',
    location: '',
    images: [] as string[]
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, images: [...prev.images, reader.result as string].slice(0, 3) }))
      }
      reader.readAsDataURL(file)
    })
  }

  useEffect(() => {
    const load = async () => {
      try {
        const postRows = await fetchCommunityPosts()
        const merged = (postRows || []).map((post: any) => ({
          ...post,
          profiles: { id: post.author_id, full_name: post.full_name, email: post.email }
        }))
        setPosts(merged)
      } catch (error) {
        console.error('Failed to load community data from Supabase:', error)
        setPosts([])
      }
    }

    load()
  }, [])

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) {
      navigate('/auth')
      return
    }

    const contentObj = JSON.stringify({ text: form.content, phone: `${form.phone_code}${form.phone}`, location: form.location, images: form.images })

    if (isEditingPostId) {
      void (async () => {
        const { error } = await supabase.from('community_posts').update({
          title: form.title,
          content: contentObj,
          category: form.category,
          price: form.price ? Number(form.price) : undefined,
        }).eq('id', isEditingPostId)

        if (error) {
          console.error('Failed to update community post in Supabase:', error)
          return
        }

        setPosts(prev => prev.map(p => p.id === isEditingPostId ? {
          ...p,
          title: form.title,
          content: contentObj,
          category: form.category,
          price: form.price ? Number(form.price) : undefined,
        } : p))
        
        setShowModal(false)
        setIsEditingPostId(null)
        setForm({ title: '', content: '', category: 'general', price: '', phone: '', phone_code: '+91', location: '', images: [] })
      })()
      return
    }

    const newPost = {
      id: `post-${Date.now()}`,
      author_id: profile.id,
      title: form.title,
      content: contentObj,
      category: form.category as any,
      price: form.price ? Number(form.price) : undefined,
      likes: 0,
      comment_count: 0,
      created_at: new Date().toISOString(),
      full_name: profile.full_name,
      email: profile.email,
    }

    void (async () => {
      const { error } = await supabase.from('community_posts').insert([newPost])
      if (error) {
        console.error('Failed to save community post to Supabase:', error)
        return
      }

      setPosts(prev => [{ ...newPost, profiles: profile }, ...prev])
      setShowModal(false)
      setForm({ title: '', content: '', category: 'general', price: '', phone: '', phone_code: '+91', location: '', images: [] })
    })()
  }

  // Filter posts
  const filteredPosts = posts.filter(post => {
    if (selectedCategory !== 'all' && post.category !== selectedCategory) return false

    if (search) {
      const q = search.toLowerCase()
      const matchesTitle = post.title.toLowerCase().includes(q)
      const matchesContent = post.content.toLowerCase().includes(q)
      const matchesAuthor = post.profiles?.full_name?.toLowerCase().includes(q)
      if (!matchesTitle && !matchesContent && !matchesAuthor) return false
    }

    return true
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
      {/* Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-10 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center relative z-10 gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl md:text-4xl font-display font-bold">Campus Bulletin & Marketplace</h1>
            <p className="text-slate-300 mt-1.5 text-sm md:text-base">
              Buy/sell books, check notices, find local events, and connect with other students.
            </p>
          </div>
          <button onClick={() => { if (!profile) navigate('/auth'); else setShowModal(true) }} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" /> Create Board Post
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar: Categories & Search */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
          {/* Search */}
          <div className="card p-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Search Posts</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search notes, cycles..." className="input-field pl-10 text-xs py-2" />
            </div>
          </div>

          {/* Categories */}
          <div className="card p-4 space-y-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Categories</label>
            {Object.entries(categoryConfig).map(([key, value]) => {
              const Icon = value.icon
              const isSelected = selectedCategory === key
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left',
                    isSelected
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isSelected ? 'text-white' : 'text-slate-400')} />
                  {value.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Area: Posts Feed */}
        <div className="flex-1 space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="text-6xl mb-4">📢</div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No board posts found</h3>
              <p className="text-slate-500 mt-2 mb-4">Be the first to share an update, announcement, or item for sale!</p>
              <button onClick={() => { setSearch(''); setSelectedCategory('all') }} className="btn-primary">
                View All Board
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map(post => {
                const config = categoryConfig[post.category as keyof typeof categoryConfig] || categoryConfig.general
                const CategoryIcon = config.icon
                
                let textContent = post.content
                let phone = ''
                let location = ''
                let images: string[] = post.images || []
                try {
                  const parsed = JSON.parse(post.content)
                  if (parsed.text) {
                    textContent = parsed.text
                    phone = parsed.phone || ''
                    location = parsed.location || ''
                    if (parsed.images && parsed.images.length > 0) {
                      images = parsed.images
                    }
                  }
                } catch (e) {}

                return (
                  <motion.div
                    layout
                    key={post.id}
                    className="card p-6 border-slate-200 hover:border-slate-300 transition-all dark:border-slate-800"
                  >
                    {/* Post Meta */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-brand-600">
                          {post.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                            {post.profiles?.full_name || 'Anonymous Student'}
                            {post.author_id === profile?.id && (
                              <span className="badge badge-purple text-[8px] px-1.5 py-0">You</span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(post.created_at).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className={cn('badge text-[10px] px-2 py-0.5 inline-flex items-center gap-1 font-semibold', config.color)}>
                          <CategoryIcon className="w-3 h-3" />
                          {config.label}
                        </span>
                        
                        {post.author_id === profile?.id && (
                          <button
                            onClick={() => {
                              const phoneNoCode = phone.replace(/^\+\d+/, '')
                              const phoneCode = phone.match(/^\+(\d+)/)?.[0] || '+91'
                              setForm({
                                title: post.title,
                                content: textContent,
                                category: post.category as any,
                                price: post.price ? post.price.toString() : '',
                                phone: phoneNoCode,
                                phone_code: phoneCode,
                                location: location,
                                images: images,
                              })
                              setIsEditingPostId(post.id)
                              setShowModal(true)
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-brand-600 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                            title="Edit Post"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    {images.length > 0 && (
                      <div className="mb-4 h-48 w-full bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative">
                        <img src={images[0]} alt="Post attachment" className="w-full h-full object-cover" />
                        {images.length > 1 && (
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-sm">
                            1 of {images.length}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                      {textContent}
                    </p>

                    {/* Price Tag if available */}
                    {post.price !== undefined && (
                      <div className="mt-3 flex items-center gap-1">
                        <span className="text-xs text-slate-400">Asking Price:</span>
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-lg">
                          {formatCurrency(post.price)}
                        </span>
                      </div>
                    )}

                    {location && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="shrink-0">📍</span>
                        <span className="truncate">{location}</span>
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 text-xs">
                      {phone ? (
                        <>
                          <a href={`tel:${phone}`} className="flex-1 btn-primary py-2 justify-center shadow-brand text-xs flex items-center gap-1.5">
                            <span className="text-sm">📞</span> Call
                          </a>
                          <a href={`https://wa.me/${phone.replace(/\D/g, '')}?text=Hi, I saw your post "${post.title}" on CampusNest!`} target="_blank" rel="noopener noreferrer" className="flex-1 btn-secondary py-2 justify-center text-xs flex items-center gap-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border-[#25D366]/20">
                            <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                        </>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No contact details provided.</p>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* New Post Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowModal(false); setIsEditingPostId(null); setForm({ title: '', content: '', category: 'general', price: '', phone: '', phone_code: '+91', location: '', images: [] }) }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, y: 15, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-glass overflow-hidden z-10 p-6 space-y-4">
              
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">{isEditingPostId ? '📝 Edit Board Post' : '🆕 Post on Community Board'}</h3>
                <button onClick={() => { setShowModal(false); setIsEditingPostId(null); setForm({ title: '', content: '', category: 'general', price: '', phone: '', phone_code: '+91', location: '', images: [] }) }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Post Title *</label>
                  <input type="text" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Selling study books, extended curfew notice" className="input-field text-sm" required />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Board Category</label>
                  <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value as any }))} className="input-field text-sm">
                    <option value="general">General Discussion</option>
                    <option value="notes">Study Notes</option>
                    <option value="books">Textbooks</option>
                    <option value="cycles">Bicycles</option>
                    <option value="bikes">Motorbikes / Scooters</option>
                    <option value="events">Events / Jobs</option>
                    <option value="announcements">Announcement / Notice</option>
                  </select>
                </div>

                {['books', 'notes', 'cycles', 'bikes', 'events'].includes(form.category) && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Selling Price / Entry Fee (₹, optional)</label>
                    <input type="number" value={form.price} onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="e.g. 500" className="input-field text-sm" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Contact Number</label>
                    <div className="flex gap-2">
                      <select value={form.phone_code} onChange={e => setForm(prev => ({ ...prev, phone_code: e.target.value }))} className="input-field text-sm w-[85px] px-2 font-medium">
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+61">+61</option>
                        <option value="+971">+971</option>
                      </select>
                      <input type="tel" value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                        placeholder="9876543210" className="input-field text-sm flex-1" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Location (Optional)</label>
                    <input type="text" value={form.location} onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g. Campus Library" className="input-field text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Upload Images (Max 3)</label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-200">
                        <img src={img} alt="Upload" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                    {form.images.length < 3 && (
                      <label className="w-16 h-16 shrink-0 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer transition-colors">
                        <Plus className="w-5 h-5" />
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Post Body Content *</label>
                  <textarea rows={4} value={form.content} onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Provide details about your post or notice..." className="input-field py-2 text-sm" required />
                </div>

                <button type="submit" className="btn-primary w-full justify-center py-2.5 text-sm mt-3">
                  {isEditingPostId ? '💾 Save Changes' : '🚀 Publish Post'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
