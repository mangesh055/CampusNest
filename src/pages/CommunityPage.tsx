import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, MessageSquare, Heart, ThumbsUp, Send, Share2, X, ShoppingBag, BookOpen, Bike, Calendar, Megaphone, HelpCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import type { CommunityPost } from '../types'
import { cn, formatCurrency } from '../lib/utils'

// Mock Initial Community Posts
const initialPosts: (CommunityPost & { commentsList?: { author: string; content: string; date: string }[] })[] = [
  {
    id: 'post-1',
    author_id: 'stud-1',
    title: 'Selling 3rd Semester IT Notes (Covers DS, OOP, DLD)',
    content: 'Complete handwritten and typed notes with exam solutions. Very neat and easy to understand. Price is negotiable.',
    category: 'notes',
    price: 150,
    likes: 12,
    comment_count: 3,
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hours ago
    profiles: {
      id: 'stud-1',
      email: 'rahul@example.com',
      full_name: 'Rahul Sharma',
      role: 'student',
      created_at: '',
      updated_at: ''
    },
    commentsList: [
      { author: 'Amit Deshmukh', content: 'Are these according to SPPU syllabus?', date: '2 hours ago' },
      { author: 'Rahul Sharma', content: 'Yes, fully aligned with SPPU syllabus!', date: '1 hour ago' },
      { author: 'Priya Joshi', content: 'I want this. DMing you!', date: '30 mins ago' }
    ]
  },
  {
    id: 'post-2',
    author_id: 'stud-2',
    title: 'Hero Sprint Cycle for Sale - Good Condition',
    content: 'Bought last year. Single-owner, 18-speed gears. Perfect for college commuting. Rear tyre is newly replaced.',
    category: 'cycles',
    price: 3200,
    likes: 24,
    comment_count: 2,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(), // 8 hours ago
    profiles: {
      id: 'stud-2',
      email: 'amit@example.com',
      full_name: 'Amit Deshmukh',
      role: 'student',
      created_at: '',
      updated_at: ''
    },
    commentsList: [
      { author: 'Vikram Singh', content: 'Is the price negotiable?', date: '6 hours ago' },
      { author: 'Amit Deshmukh', content: 'Yes, slightly. Check your messages.', date: '5 hours ago' }
    ]
  },
  {
    id: 'post-3',
    author_id: 'admin-1',
    title: 'Important: Hostel In-time Extended to 10:30 PM',
    content: 'Official notice from college administration: The weekend hostel curfew has been extended starting this Friday. Please carry your student IDs.',
    category: 'announcements',
    likes: 56,
    comment_count: 1,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    profiles: {
      id: 'admin-1',
      email: 'admin@demo.com',
      full_name: 'Campus Administrator',
      role: 'admin',
      created_at: '',
      updated_at: ''
    },
    commentsList: [
      { author: 'Rahul Sharma', content: 'Great news! Much needed.', date: '18 hours ago' }
    ]
  },
  {
    id: 'post-4',
    author_id: 'stud-3',
    title: 'Hiring React Native Intern at Campus Startup',
    content: 'Looking for a student intern who has built at least one React Native app. Stipend: ₹8,000/month. 3 months duration. Flexible hours.',
    category: 'events',
    likes: 18,
    comment_count: 0,
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    profiles: {
      id: 'stud-3',
      email: 'priya@example.com',
      full_name: 'Priya Joshi',
      role: 'student',
      created_at: '',
      updated_at: ''
    },
    commentsList: []
  }
]

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
  const [posts, setPosts] = useState<typeof initialPosts>(() => {
    const saved = localStorage.getItem('campusnest-posts')
    return saved ? JSON.parse(saved) : initialPosts
  })
  
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null)
  const [newCommentText, setNewCommentText] = useState('')

  // Form State
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'general' as keyof typeof categoryConfig,
    price: '',
  })

  useEffect(() => {
    localStorage.setItem('campusnest-posts', JSON.stringify(posts))
  }, [posts])

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) {
      navigate('/auth')
      return
    }

    const newPost: typeof initialPosts[0] = {
      id: `post-${Date.now()}`,
      author_id: profile.id,
      title: form.title,
      content: form.content,
      category: form.category as any,
      price: form.price ? Number(form.price) : undefined,
      likes: 0,
      comment_count: 0,
      created_at: new Date().toISOString(),
      profiles: profile,
      commentsList: []
    }

    setPosts(prev => [newPost, ...prev])
    setShowModal(false)
    setForm({ title: '', content: '', category: 'general', price: '' })
  }

  const handleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          // simple toggle: check if user has already liked it
          // for the demo, we just increase or decrease the likes by checking if the post is already liked
          const likedKey = `post-liked-${postId}`
          const isLiked = localStorage.getItem(likedKey) === 'true'
          if (isLiked) {
            localStorage.setItem(likedKey, 'false')
            return { ...p, likes: p.likes - 1 }
          } else {
            localStorage.setItem(likedKey, 'true')
            return { ...p, likes: p.likes + 1 }
          }
        }
        return p
      })
    )
  }

  const handleAddComment = (postId: string) => {
    if (!newCommentText.trim()) return
    if (!profile) {
      navigate('/auth')
      return
    }

    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const list = p.commentsList || []
          const updatedComments = [
            ...list,
            {
              author: profile.full_name || 'Anonymous Student',
              content: newCommentText,
              date: 'Just now'
            }
          ]
          return {
            ...p,
            commentsList: updatedComments,
            comment_count: updatedComments.length
          }
        }
        return p
      })
    )
    setNewCommentText('')
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
                const likedKey = `post-liked-${post.id}`
                const isLiked = localStorage.getItem(likedKey) === 'true'

                return (
                  <motion.div
                    layout
                    key={post.id}
                    className="card p-6 border-slate-200 hover:border-slate-300 transition-all dark:border-slate-800"
                  >
                    {/* Post Meta */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-brand-600">
                          {post.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                            {post.profiles?.full_name || 'Anonymous Student'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(post.created_at).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <span className={cn('badge text-[10px] px-2 py-0.5 inline-flex items-center gap-1 font-semibold', config.color)}>
                        <CategoryIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                      {post.content}
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

                    {/* Buttons */}
                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-xs">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={cn(
                          'flex items-center gap-1.5 p-1.5 rounded-lg font-semibold transition-all hover:bg-slate-50 dark:hover:bg-slate-850',
                          isLiked ? 'text-brand-600 bg-brand-50/50 dark:text-brand-400' : 'text-slate-500'
                        )}
                      >
                        <ThumbsUp className={cn('w-4 h-4', isLiked && 'fill-current')} />
                        <span>{post.likes}</span>
                      </button>

                      <button
                        onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                        className={cn(
                          'flex items-center gap-1.5 p-1.5 rounded-lg font-semibold text-slate-500 transition-all hover:bg-slate-50 dark:hover:bg-slate-850',
                          expandedPostId === post.id && 'text-brand-600 bg-brand-50/50'
                        )}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comment_count} Comments</span>
                      </button>

                    </div>

                    {/* Expanded Comments Panel */}
                    <AnimatePresence>
                      {expandedPostId === post.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-slate-150 dark:border-slate-800 overflow-hidden space-y-3"
                        >
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Comments</p>
                          
                          {/* Comments List */}
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {post.commentsList && post.commentsList.length > 0 ? (
                              post.commentsList.map((c, i) => (
                                <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 text-xs">
                                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                                    <span>{c.author}</span>
                                    <span className="text-[10px] text-slate-400 font-normal">{c.date}</span>
                                  </div>
                                  <p className="text-slate-600 dark:text-slate-400">{c.content}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-slate-400 italic">No comments yet. Write one below!</p>
                            )}
                          </div>

                          {/* Add Comment Input */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newCommentText}
                              onChange={e => setNewCommentText(e.target.value)}
                              placeholder="Write a comment..."
                              className="input-field text-xs py-2 flex-1"
                              onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id)}
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              className="p-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, y: 15, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-glass overflow-hidden z-10 p-6 space-y-4">
              
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">🆕 Post on Community Board</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
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

                {['books', 'notes', 'cycles', 'bikes'].includes(form.category) && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Selling Price (₹, optional)</label>
                    <input type="number" value={form.price} onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="e.g. 500" className="input-field text-sm" />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Post Body Content *</label>
                  <textarea rows={4} value={form.content} onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Provide details about your post or notice..." className="input-field py-2 text-sm" required />
                </div>

                <button type="submit" className="btn-primary w-full justify-center py-2.5 text-sm mt-3">
                  🚀 Publish Post
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
