import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Calendar, QrCode, TrendingUp, DollarSign, Bell, RefreshCw, BarChart2, Check, X, Search, Plus, Trash2, Edit2, ShieldAlert, Sparkles, ChefHat, MapPin, Phone, Building, Printer, Download, CreditCard, FileText, BookOpen, ToggleLeft, ToggleRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'
import { Link, useLocation } from 'react-router-dom'
import { formatCurrency, mealTypeLabels, formatDate } from '../../lib/utils'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import QRCode from 'qrcode'
import { cn } from '../../lib/utils'
import MapComponent from '../../components/map/MapComponent'

const weeklyData = [
  { day: 'Mon', breakfast: 18, lunch: 32, dinner: 28 },
  { day: 'Tue', breakfast: 22, lunch: 35, dinner: 30 },
  { day: 'Wed', breakfast: 15, lunch: 28, dinner: 25 },
  { day: 'Thu', breakfast: 20, lunch: 33, dinner: 29 },
  { day: 'Fri', breakfast: 25, lunch: 40, dinner: 35 },
  { day: 'Sat', breakfast: 30, lunch: 45, dinner: 40 },
  { day: 'Sun', breakfast: 28, lunch: 42, dinner: 38 },
]

const pieData = [
  { name: 'Breakfast', value: 158, color: '#f59e0b' },
  { name: 'Lunch', value: 255, color: '#6366f1' },
  { name: 'Dinner', value: 225, color: '#8b5cf6' },
]

const initialSubscribers = [
  { id: 'sub-1', name: 'Rahul Sharma', email: 'rahul@example.com', plan: 'Full Day', expiry: '2026-06-18', paid: true, attendance: '85%' },
  { id: 'sub-2', name: 'Priya Patel', email: 'priya@example.com', plan: 'Lunch Only', expiry: '2026-06-22', paid: true, attendance: '92%' },
  { id: 'sub-3', name: 'Amit Kumar', email: 'amit@example.com', plan: 'Dinner Plan', expiry: '2026-06-10', paid: false, attendance: '70%' },
  { id: 'sub-4', name: 'Sneha Joshi', email: 'sneha@example.com', plan: 'Full Day', expiry: '2026-06-25', paid: true, attendance: '78%' },
  { id: 'sub-5', name: 'Vikram Singh', email: 'vikram@example.com', plan: 'Lunch Only', expiry: '2026-06-30', paid: true, attendance: '95%' },
]

const defaultMenu = {
  breakfast: ['Aloo Paratha', 'Curd', 'Butter', 'Tea'],
  lunch: ['Jeera Rice', 'Dal Tadka', 'Paneer Butter Masala', 'Chapati', 'Salad', 'Buttermilk'],
  dinner: ['Plain Rice', 'Mix Veg Curry', 'Tandoori Roti', 'Gulab Jamun'],
  snack: ['Samosa', 'Chutney', 'Coffee']
}

export default function MessOwnerDashboard() {
  const location = useLocation()
  const { profile } = useAuthStore()

  // Onboarding Mess Profile state
  const [myMess, setMyMess] = useState<any | null>(() => {
    if (!profile) return null
    const saved = localStorage.getItem(`campusnest-mess-profile-${profile.id}`)
    if (saved) return JSON.parse(saved)
    
    // Fallback for demo mess owner
    if (profile.role === 'mess_owner' && profile.email === 'messowner@example.com') {
      return {
        id: 'm1',
        owner_id: profile.id,
        name: 'Maa Ki Rasoi',
        description: 'Delicious home-cooked Indian meals serving students and faculty.',
        address: 'Opposite MIT Gate, Kothrud',
        contact_phone: '9876543210',
        monthly_charge: 3500,
        per_meal_charge: 120,
        meal_types: ['breakfast', 'lunch', 'dinner', 'snack']
      }
    }
    return null
  })

  // Onboarding wizard form states
  const [messName, setMessName] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [monthlyCharge, setMonthlyCharge] = useState('3200')
  const [perMealCharge, setPerMealCharge] = useState('110')
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>(['breakfast', 'lunch', 'dinner'])
  const [latitude, setLatitude] = useState(18.5204)
  const [longitude, setLongitude] = useState(73.8567)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // QR States
  const [qrUrl, setQrUrl] = useState('')
  const [qrGenerated, setQrGenerated] = useState(false)

  // System Notifications state
  const [bannerMsg, setBannerMsg] = useState('')

  // Subscribers State (scoped by owner ID)
  const [subscribers, setSubscribers] = useState<any[]>(() => {
    if (!profile) return initialSubscribers
    const saved = localStorage.getItem(`campusnest-mess-subscribers-${profile.id}`)
    if (saved) return JSON.parse(saved)
    
    // Fallback default list only for the demo account
    if (profile.email === 'messowner@example.com') {
      return initialSubscribers
    }
    return []
  })
  
  // Menu State (scoped by owner ID)
  const [menu, setMenu] = useState<any>(() => {
    if (!profile) return defaultMenu
    const saved = localStorage.getItem(`campusnest-mess-menu-${profile.id}`)
    if (saved) return JSON.parse(saved)

    if (profile.email === 'messowner@example.com') {
      return defaultMenu
    }
    return { breakfast: [], lunch: [], dinner: [], snack: [] }
  })

  // Scans Log State (scoped by owner ID)
  const [scans, setScans] = useState<any[]>(() => {
    if (!profile) return []
    const saved = localStorage.getItem(`campusnest-mess-scans-${profile.id}`)
    if (saved) return JSON.parse(saved)
    return [
      { id: 'scan-1', studentName: 'Rahul Sharma', time: '08:42 AM', meal: 'breakfast', gpsStatus: 'Verified (12m)', status: 'success' },
      { id: 'scan-2', studentName: 'Priya Patel', time: '01:15 PM', meal: 'lunch', gpsStatus: 'Verified (5m)', status: 'success' },
      { id: 'scan-3', studentName: 'Sneha Joshi', time: '01:30 PM', meal: 'lunch', gpsStatus: 'Verified (24m)', status: 'success' },
    ]
  })

  // Transactions Log State (scoped by owner ID)
  const [transactions, setTransactions] = useState<any[]>(() => {
    if (!profile) return []
    const saved = localStorage.getItem(`campusnest-mess-transactions-${profile.id}`)
    if (saved) return JSON.parse(saved)
    return [
      { id: 'TXN-9021', studentName: 'Rahul Sharma', amount: 3500, date: '2026-06-01', method: 'UPI (GPay)', status: 'Completed' },
      { id: 'TXN-8829', studentName: 'Priya Patel', amount: 3500, date: '2026-06-03', method: 'Debit Card', status: 'Completed' },
      { id: 'TXN-7104', studentName: 'Amit Kumar', amount: 3500, date: '2026-06-05', method: 'Cash', status: 'Pending Cash Collection' },
      { id: 'TXN-6391', studentName: 'Sneha Joshi', amount: 3500, date: '2026-06-07', method: 'UPI (PhonePe)', status: 'Completed' },
    ]
  })

  // Menu item inputs
  const [newItem, setNewItem] = useState('')
  const [activeMenuCategory, setActiveMenuCategory] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch')

  // Search
  const [search, setSearch] = useState('')

  // Plans State (scoped by owner ID)
  const [plans, setPlans] = useState<any[]>(() => {
    if (!profile) return []
    const saved = localStorage.getItem(`campusnest-mess-plans-${profile.id}`)
    if (saved) return JSON.parse(saved)
    // Default plans for demo account
    if (profile.email === 'messowner@example.com') {
      return [
        { id: 'p-default-1', name: 'Full Day Plan', description: 'Breakfast + Lunch + Dinner. Best value for money!', price: 3500, duration_days: 30, meal_types: ['breakfast', 'lunch', 'dinner'], active: true },
        { id: 'p-default-2', name: 'Lunch Plan', description: 'Lunch only. Perfect for hostel students.', price: 1800, duration_days: 30, meal_types: ['lunch'], active: true },
        { id: 'p-default-3', name: 'Dinner Plan', description: 'Dinner only. Great for evening students.', price: 1500, duration_days: 30, meal_types: ['dinner'], active: true },
      ]
    }
    return []
  })

  // Plan Form State
  const [planModalOpen, setPlanModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any | null>(null)
  const [planForm, setPlanForm] = useState({ name: '', description: '', price: '', duration_days: '30', meal_types: [] as string[] })

  useEffect(() => {
    if (profile) {
      localStorage.setItem(`campusnest-mess-subscribers-${profile.id}`, JSON.stringify(subscribers))
    }
  }, [subscribers, profile])

  useEffect(() => {
    if (profile) {
      localStorage.setItem(`campusnest-mess-menu-${profile.id}`, JSON.stringify(menu))
    }
  }, [menu, profile])

  useEffect(() => {
    if (profile) {
      localStorage.setItem(`campusnest-mess-scans-${profile.id}`, JSON.stringify(scans))
    }
  }, [scans, profile])

  useEffect(() => {
    if (profile) {
      localStorage.setItem(`campusnest-mess-transactions-${profile.id}`, JSON.stringify(transactions))
    }
  }, [transactions, profile])

  useEffect(() => {
    if (profile) {
      localStorage.setItem(`campusnest-mess-plans-${profile.id}`, JSON.stringify(plans))
    }
  }, [plans, profile])

  // Sync profile details from database if available
  useEffect(() => {
    if (!profile) return
    const fetchMess = async () => {
      try {
        const { data, error } = await supabase
          .from('messes')
          .select('*')
          .eq('owner_id', profile.id)
          .single()
        if (data) {
          setMyMess(data)
          localStorage.setItem(`campusnest-mess-profile-${profile.id}`, JSON.stringify(data))
        }
      } catch (err) {
        console.warn('Could not fetch mess details from Supabase. Falling back to local storage.')
      }
    }
    fetchMess()
  }, [profile])

  // Generate QR on mount or when mess loads
  useEffect(() => {
    if (myMess) {
      generateQR()
    }
  }, [myMess])

  // Handle Mess Onboarding Submission
  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    if (selectedMealTypes.length === 0) {
      alert('Please select at least one meal category served.')
      return
    }

    setIsSubmitting(true)
    const newMess = {
      id: `mess-${Date.now()}`,
      owner_id: profile.id,
      name: messName,
      description: description,
      address: address,
      city: 'Pune',
      state: 'Maharashtra',
      latitude: latitude,
      longitude: longitude,
      contact_phone: contactPhone,
      monthly_charge: Number(monthlyCharge),
      per_meal_charge: Number(perMealCharge),
      status: 'open',
      verified: false,
      featured: false,
      rating: 5.0,
      review_count: 0,
      meal_types: selectedMealTypes,
      photos: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Try saving to database
    try {
      await supabase.from('messes').insert([newMess])
    } catch (dbError) {
      console.warn('Database save skipped/failed. Storing locally instead.')
    }

    localStorage.setItem(`campusnest-mess-profile-${profile.id}`, JSON.stringify(newMess))
    setMyMess(newMess)
    
    // Set default category to first active meal type
    if (selectedMealTypes.length > 0) {
      setActiveMenuCategory(selectedMealTypes[0] as any)
    }
    setIsSubmitting(false)
  }

  // Generate QR for daily scanner
  const generateQR = async () => {
    if (!myMess) return
    const qrData = `CAMPUSNEST:MESS=${myMess.id}:DATE=${new Date().toISOString().split('T')[0]}:KEY=${Math.random().toString(36).substr(2, 12).toUpperCase()}`
    const url = await QRCode.toDataURL(qrData, { width: 250, margin: 2 })
    setQrUrl(url)
    setQrGenerated(true)
  }

  // Action: Print/Download QR Code
  const handlePrintQR = () => {
    setBannerMsg('Preparing high-resolution QR Poster PDF for printing...')
    setTimeout(() => setBannerMsg(''), 4000)
  }

  // Subscriber actions
  const togglePayment = (id: string) => {
    setSubscribers((prev: any[]) => prev.map(s => s.id === id ? { ...s, paid: !s.paid } : s))
  }

  const extendSubscription = (id: string) => {
    setSubscribers((prev: any[]) => prev.map(s => {
      if (s.id === id) {
        const curDate = new Date(s.expiry)
        curDate.setDate(curDate.getDate() + 7)
        return { ...s, expiry: curDate.toISOString().split('T')[0] }
      }
      return s
    }))
  }

  const removeSubscriber = (id: string) => {
    if (window.confirm('Are you sure you want to deactivate this student subscription?')) {
      setSubscribers((prev: any[]) => prev.filter(s => s.id !== id))
    }
  }

  // Inject a mock test student for live interactive testing
  const addDemoSubscriber = () => {
    const studentNames = ['Aditya Verma', 'Rohan Mehra', 'Kirti Sen', 'Snehal Joshi', 'Manish Goel']
    const planNames = ['Full Day Meal', 'Lunch + Dinner', 'Lunch Only', 'Breakfast + Dinner']
    const randomName = studentNames[Math.floor(Math.random() * studentNames.length)]
    const randomPlan = planNames[Math.floor(Math.random() * planNames.length)]
    const randomId = `demo-sub-${Date.now()}`
    
    const newSub = {
      id: randomId,
      name: randomName,
      email: `${randomName.toLowerCase().replace(' ', '')}@example.com`,
      plan: randomPlan,
      expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paid: Math.random() > 0.3,
      attendance: `${Math.floor(Math.random() * 20 + 80)}%`
    }

    setSubscribers(prev => [newSub, ...prev])

    // Create a matching mock transaction in payments list
    const newTxn = {
      id: `TXN-${Math.floor(Math.random() * 8999 + 1000)}`,
      studentName: randomName,
      amount: myMess?.monthly_charge || 3200,
      date: new Date().toISOString().split('T')[0],
      method: Math.random() > 0.5 ? 'UPI (PhonePe)' : 'Cash',
      status: Math.random() > 0.5 ? 'Completed' : 'Pending Cash Collection'
    }
    setTransactions(prev => [newTxn, ...prev])
  }

  // Simulate Today's QR Attendance Scan
  const handleSimulateScan = () => {
    if (subscribers.length === 0) {
      alert('Please add at least one subscriber first to simulate scans.')
      return
    }
    const randomSub = subscribers[Math.floor(Math.random() * subscribers.length)]
    const mealTypesList = myMess?.meal_types || ['breakfast', 'lunch', 'dinner']
    const randomMeal = mealTypesList[Math.floor(Math.random() * mealTypesList.length)]
    const now = new Date()
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    
    const newScan = {
      id: `scan-${Date.now()}`,
      studentName: randomSub.name,
      time: timeStr,
      meal: randomMeal,
      gpsStatus: `Verified (${Math.floor(Math.random() * 18 + 2)}m)`,
      status: 'success'
    }

    setScans(prev => [newScan, ...prev])
    setBannerMsg(`Scan Simulated: ${randomSub.name} checked in for ${randomMeal}!`)
    setTimeout(() => setBannerMsg(''), 3000)
  }

  // Verify pending Cash transaction
  const handleVerifyCash = (txnId: string) => {
    setTransactions(prev => prev.map(t => t.id === txnId ? { ...t, status: 'Completed' } : t))
    const txn = transactions.find(t => t.id === txnId)
    if (txn) {
      setSubscribers(prev => prev.map(s => s.name === txn.studentName ? { ...s, paid: true } : s))
      setBannerMsg(`Payment verified for ${txn.studentName}!`)
      setTimeout(() => setBannerMsg(''), 3000)
    }
  }

  // Menu actions
  const addMenuItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.trim()) return
    setMenu((prev: any) => ({
      ...prev,
      [activeMenuCategory]: [...(prev[activeMenuCategory] || []), newItem.trim()]
    }))
    setNewItem('')
  }

  // Plan CRUD actions
  const openCreatePlan = () => {
    setEditingPlan(null)
    setPlanForm({ name: '', description: '', price: '', duration_days: '30', meal_types: [] })
    setPlanModalOpen(true)
  }

  const openEditPlan = (plan: any) => {
    setEditingPlan(plan)
    setPlanForm({ name: plan.name, description: plan.description, price: String(plan.price), duration_days: String(plan.duration_days), meal_types: [...plan.meal_types] })
    setPlanModalOpen(true)
  }

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!planForm.name.trim() || !planForm.price || planForm.meal_types.length === 0) {
      alert('Please fill all required fields and select at least one meal type.')
      return
    }
    const planData = {
      id: editingPlan ? editingPlan.id : `plan-${Date.now()}`,
      name: planForm.name,
      description: planForm.description,
      price: Number(planForm.price),
      duration_days: Number(planForm.duration_days),
      meal_types: planForm.meal_types,
      active: editingPlan ? editingPlan.active : true,
    }
    if (editingPlan) {
      setPlans(prev => prev.map((p: any) => p.id === editingPlan.id ? planData : p))
    } else {
      setPlans(prev => [planData, ...prev])
    }
    setPlanModalOpen(false)
  }

  const deletePlan = (id: string) => {
    if (window.confirm('Delete this subscription plan? Students will no longer see it.')) {
      setPlans(prev => prev.filter((p: any) => p.id !== id))
    }
  }

  const togglePlanActive = (id: string) => {
    setPlans(prev => prev.map((p: any) => p.id === id ? { ...p, active: !p.active } : p))
  }

  const removeMenuItem = (category: string, idx: number) => {
    setMenu((prev: any) => ({
      ...prev,
      [category]: prev[category].filter((_: any, i: number) => i !== idx)
    }))
  }

  // ----------------------------------------------------
  // RENDER ONBOARDING WIZARD IF PROFILE LACKS MESS
  // ----------------------------------------------------
  if (!myMess) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="text-center py-6 space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-indigo-600 flex items-center justify-center mx-auto text-2xl shadow-glow text-white">
            <ChefHat className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">Mess Onboarding Setup</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">Register your kitchen or mess service details to start generating QR codes and managing menu listings.</p>
        </div>

        <form onSubmit={handleSetupSubmit} className="card p-8 space-y-6 max-w-2xl mx-auto shadow-glass border-slate-200 dark:border-slate-800">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mess Service Name</label>
              <input
                type="text"
                value={messName}
                onChange={e => setMessName(e.target.value)}
                placeholder="e.g. Sri Sai Deluxe Mess / Maa Ki Rasoi"
                className="input-field"
                required
              />
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Tell students about your menu, food quality, hygiene standards, etc."
                className="input-field min-h-24 resize-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Phone</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                placeholder="e.g. +91 9876543210"
                className="input-field"
                required
              />
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kitchen Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="e.g. Kothrud, near MIT Gate, Pune"
                className="input-field"
                required
              />
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mark Location on Map</label>
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <MapComponent
                  center={[latitude, longitude]}
                  zoom={14}
                  height="200px"
                  interactivePicker={true}
                  onLocationSelect={(lat, lng) => {
                    setLatitude(lat)
                    setLongitude(lng)
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Subscription Charge (₹)</label>
              <input
                type="number"
                value={monthlyCharge}
                onChange={e => setMonthlyCharge(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Single Meal Cost (₹)</label>
              <input
                type="number"
                value={perMealCharge}
                onChange={e => setPerMealCharge(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Checkbox categories */}
          <div className="space-y-2 border-t pt-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Meals Provided</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(type => {
                const selected = selectedMealTypes.includes(type)
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => {
                      setSelectedMealTypes(prev =>
                        prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                      )
                    }}
                    className={cn(
                      'p-3 rounded-2xl border text-xs font-bold capitalize transition-all text-center',
                      selected
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                    )}
                  >
                    {type}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full justify-center py-3 text-sm flex items-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Building className="w-4 h-4" /> Register Mess Profile & Open Dashboard
              </>
            )}
          </button>
        </form>
      </div>
    )
  }

  // ----------------------------------------------------
  // DETERMINE SUBVIEW ROUTE
  // ----------------------------------------------------
  const path = location.pathname
  const view = path.endsWith('/menu') 
    ? 'menu' 
    : path.endsWith('/plans')
      ? 'plans'
      : path.endsWith('/subscribers') 
        ? 'subscribers' 
        : path.endsWith('/attendance')
          ? 'attendance'
          : path.endsWith('/qr')
            ? 'qr'
            : path.endsWith('/analytics')
              ? 'analytics'
              : path.endsWith('/payments')
                ? 'payments'
                : path.endsWith('/reports')
                  ? 'reports'
                  : 'overview'

  // Helper Banner Notification
  const renderBanner = () => {
    if (!bannerMsg) return null
    return (
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} 
        className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-2xl border border-slate-800 flex items-center gap-2 shadow-xl">
        <Sparkles className="w-4 h-4 text-brand-400" />
        <span>{bannerMsg}</span>
      </motion.div>
    )
  }

  // 1. Overview View
  if (view === 'overview') {
    const stats = [
      { label: 'Total Subscribers', value: subscribers.length.toString(), icon: '👥', color: 'from-brand-400 to-brand-600', sub: subscribers.length > 0 ? '+1 active today' : 'No users registered' },
      { label: "Today's Attendance", value: scans.length.toString(), icon: '✅', color: 'from-emerald-400 to-emerald-600', sub: scans.length > 0 ? `${scans.length} checks logged` : 'No logs yet' },
      { label: 'Monthly Revenue', value: formatCurrency(subscribers.filter((s: any) => s.paid).length * myMess.monthly_charge), icon: '💰', color: 'from-amber-400 to-amber-600', sub: 'Calculated from active' },
      { label: 'Unpaid Accounts', value: subscribers.filter((s: any) => !s.paid).length.toString(), icon: '⚠️', color: 'from-red-400 to-red-600', sub: 'Requires notification' },
    ]

    return (
      <div className="p-6 space-y-6">
        <AnimatePresence>{bannerMsg && renderBanner()}</AnimatePresence>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">{myMess.name}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">📍 {myMess.address} | Owner Dashboard</p>
          </div>
          <div className="flex gap-2">
            <Link to="/dashboard/mess/menu" className="btn-secondary text-sm">Update Menu</Link>
            <button onClick={handleSimulateScan} className="btn-secondary text-xs flex items-center gap-1">
              ⚡ Scan Simulator
            </button>
            <Link to="/dashboard/mess/qr" className="btn-primary text-sm flex items-center gap-1">
              <QrCode className="w-4 h-4" /> View QR Poster
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <div className="card p-5">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl mb-3`}>{s.icon}</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{s.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                <div className="text-[11px] text-brand-500 mt-1">{s.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* QR & Meal Count Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* QR Generator Preview */}
          <div className="card p-6 text-center flex flex-col justify-between">
            <div>
              <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-2">
                <QrCode className="w-4 h-4 text-brand-500" /> Daily Check-In QR
              </h3>
              {qrGenerated && qrUrl ? (
                <div>
                  <div className="qr-container inline-block mb-3 bg-white p-2 rounded-2xl border border-slate-100">
                    <img src={qrUrl} alt="Daily QR" className="w-32 h-32 mx-auto" />
                  </div>
                  <p className="text-xs text-slate-500 mb-1">Valid: {new Date().toLocaleDateString('en-IN')}</p>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-2xl border-4 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                </div>
              )}
            </div>
            <Link to="/dashboard/mess/qr" className="btn-primary w-full text-xs py-2 mt-4">
              Open Printable QR Poster
            </Link>
          </div>

          {/* Today's Meal Counts */}
          <div className="card p-6">
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-500" /> Today's Meal Scans
            </h3>
            <div className="space-y-4">
              {myMess.meal_types.map((meal: string) => {
                const count = scans.filter((s: any) => s.meal === meal).length
                return (
                  <div key={meal}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize">
                        {meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : meal === 'dinner' ? '🌙' : '🍪'} {meal}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{count} checked in</span>
                    </div>
                    <div className="progress-bar h-1.5">
                      <div className={cn('h-full rounded-full transition-all duration-700', 
                        meal === 'breakfast' ? 'bg-amber-500' : meal === 'lunch' ? 'bg-brand-500' : 'bg-purple-500'
                      )} style={{ width: `${subscribers.length > 0 ? (count / subscribers.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Meal Distribution Pie */}
          <div className="card p-6">
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-500" /> Meal Attendance Rate
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="card p-6">
          <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-brand-500" /> Weekly Scans Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="breakfast" fill="#f59e0b" radius={[4,4,0,0]} name="Breakfast" />
              <Bar dataKey="lunch" fill="#6366f1" radius={[4,4,0,0]} name="Lunch" />
              <Bar dataKey="dinner" fill="#8b5cf6" radius={[4,4,0,0]} name="Dinner" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Subscribers Table Snippet */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-500" /> Active Subscribers
            </h3>
            <div className="flex gap-2">
              <button onClick={addDemoSubscriber} className="btn-secondary text-[10px] font-bold py-1 px-3">
                + Add Demo Student
              </button>
              <Link to="/dashboard/mess/subscribers" className="text-sm text-brand-600 hover:underline">View All</Link>
            </div>
          </div>
          {subscribers.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs italic">
              No students are currently subscribed to your mess. Click '+ Add Demo Student' to populate demo users.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-3 text-slate-500 font-medium">Student</th>
                    <th className="text-left py-3 px-3 text-slate-500 font-medium">Plan</th>
                    <th className="text-left py-3 px-3 text-slate-500 font-medium">Expiry</th>
                    <th className="text-center py-3 px-3 text-slate-500 font-medium">Payment</th>
                    <th className="text-center py-3 px-3 text-slate-500 font-medium">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.slice(0, 3).map((sub: any, i: number) => (
                    <tr key={i} className="table-row-hover border-b border-slate-100 dark:border-slate-800">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold font-display">
                            {sub.name[0]}
                          </div>
                          <span className="font-medium text-slate-700 dark:text-slate-350">{sub.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3"><span className="badge badge-purple text-[10px]">{sub.plan}</span></td>
                      <td className="py-3 px-3 text-slate-500">{sub.expiry}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`badge text-[10px] ${sub.paid ? 'badge-green' : 'badge-red'}`}>{sub.paid ? '✓ Paid' : '✗ Pending'}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-700 dark:text-slate-300">{sub.attendance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 2. Menu Manager View
  if (view === 'menu') {
    const activeCategories = (['breakfast', 'lunch', 'dinner', 'snack'] as const).filter(c =>
      myMess.meal_types.includes(c)
    )

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-brand-500" /> Daily Menu Manager
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Publish and edit today's menu at {myMess.name}</p>
          </div>
          <Link to="/dashboard/mess" className="btn-secondary text-sm">Back to Overview</Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Menu Categories selector */}
          <div className="card p-5 space-y-1 lg:col-span-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Meal Categories Served</label>
            {activeCategories.map(cat => {
              const isSelected = activeMenuCategory === cat
              const icons = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍪' }
              return (
                <button
                  key={cat}
                  onClick={() => setActiveMenuCategory(cat)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all capitalize',
                    isSelected
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  <span>{icons[cat]} {cat}</span>
                  <span className={cn('badge text-[9px] px-1.5', isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500')}>{menu[cat]?.length || 0} Items</span>
                </button>
              )
            })}
          </div>

          {/* Editor Area */}
          <div className="card p-6 lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize flex items-center gap-2">
                Editing: {activeMenuCategory} Menu
              </h3>
              <button onClick={() => {
                if (window.confirm(`Clear all items from ${activeMenuCategory}?`)) {
                  setMenu((prev: any) => ({ ...prev, [activeMenuCategory]: [] }))
                }
              }} className="text-xs text-red-500 hover:underline">Clear All</button>
            </div>

            {/* Current dishes list */}
            <div className="space-y-2 min-h-48">
              {(!menu[activeMenuCategory] || menu[activeMenuCategory].length === 0) ? (
                <div className="text-center py-12 text-slate-400 text-xs italic">
                  No items listed for {activeMenuCategory} today. Add your first dish below!
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-2">
                  {menu[activeMenuCategory].map((item: string, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-850 text-xs border border-slate-100 dark:border-slate-800">
                      <span className="font-semibold text-slate-700 dark:text-slate-350">{item}</span>
                      <button onClick={() => removeMenuItem(activeMenuCategory, idx)} className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Item form */}
            <form onSubmit={addMenuItem} className="flex gap-2 border-t pt-4">
              <input
                type="text"
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                placeholder={`Add item to ${activeMenuCategory} (e.g. Masala Dosa, Kheer)...`}
                className="input-field text-xs py-2 flex-1"
                required
              />
              <button type="submit" className="btn-primary py-2 px-5 text-xs flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // 3. Subscribers View
  if (view === 'subscribers') {
    const filteredSubs = subscribers.filter((s: any) => {
      if (search) {
        const q = search.toLowerCase()
        return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
      }
      return true
    })

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-brand-500" /> Subscribers Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage active plans and approve payments for {myMess.name}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={addDemoSubscriber} className="btn-secondary text-xs flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add Test Student
            </button>
            <Link to="/dashboard/mess" className="btn-secondary text-sm">Back to Overview</Link>
          </div>
        </div>

        {/* Search & Counts */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search subscribers by name..."
              className="input-field pl-10 text-xs py-2"
            />
          </div>
          <div className="flex gap-4 text-xs font-semibold text-slate-500">
            <span>Total: <span className="text-slate-800 dark:text-white font-bold">{subscribers.length}</span></span>
            <span>Paid: <span className="text-emerald-600 font-bold">{subscribers.filter((s: any) => s.paid).length}</span></span>
            <span>Pending: <span className="text-red-500 font-bold">{subscribers.filter((s: any) => !s.paid).length}</span></span>
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="card p-6">
          {filteredSubs.length === 0 ? (
            <div className="text-center py-16 text-slate-400 italic text-sm">
              No matching active subscribers found. Share your Mess profile QR code with students.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-3 text-slate-500 font-medium">Student Name</th>
                    <th className="text-left py-3 px-3 text-slate-500 font-medium">Plan Type</th>
                    <th className="text-left py-3 px-3 text-slate-500 font-medium">Expiry Date</th>
                    <th className="text-center py-3 px-3 text-slate-500 font-medium">Payment Status</th>
                    <th className="text-center py-3 px-3 text-slate-500 font-medium">Attendance</th>
                    <th className="text-right py-3 px-3 text-slate-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubs.map((sub: any) => (
                    <tr key={sub.id} className="table-row-hover border-b border-slate-100 dark:border-slate-800">
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold font-display">
                            {sub.name[0]}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-250 block leading-tight">{sub.name}</span>
                            <span className="text-[10px] text-slate-400">{sub.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <span className="badge badge-purple text-[10px]">{sub.plan}</span>
                      </td>
                      <td className="py-4 px-3 text-slate-500 font-medium">
                        {formatDate(sub.expiry)}
                      </td>
                      <td className="py-4 px-3 text-center">
                        <button
                          onClick={() => togglePayment(sub.id)}
                          className={cn(
                            'badge text-[10px] font-bold cursor-pointer transition-all hover:scale-105',
                            sub.paid ? 'badge-green' : 'badge-red'
                          )}
                        >
                          {sub.paid ? '✓ Paid' : '✗ Pending'}
                        </button>
                      </td>
                      <td className="py-4 px-3 text-center font-bold text-slate-700 dark:text-slate-350">{sub.attendance}</td>
                      <td className="py-4 px-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => extendSubscription(sub.id)}
                            className="btn-secondary py-1 px-2.5 text-[10px] font-bold border-brand-200 text-brand-600 hover:bg-brand-50"
                            title="Extend Validity by 7 Days"
                          >
                            +7 Days
                          </button>
                          <button
                            onClick={() => removeSubscriber(sub.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-lg hover:text-red-600"
                            title="Deactivate Subscriber"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 3b. Plans Manager View
  if (view === 'plans') {
    const mealIcons: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍪' }
    const allMealTypes = ['breakfast', 'lunch', 'dinner', 'snack']

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-brand-500" /> Subscription Plans Manager
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Create and manage meal plans visible to students on your mess listing</p>
          </div>
          <div className="flex gap-2">
            <button onClick={openCreatePlan} className="btn-primary text-sm flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Create New Plan
            </button>
            <Link to="/dashboard/mess" className="btn-secondary text-sm">Back to Overview</Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-5">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{plans.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">Total Plans</div>
          </div>
          <div className="card p-5">
            <div className="text-2xl font-bold text-emerald-600">{plans.filter((p: any) => p.active).length}</div>
            <div className="text-xs text-slate-500 mt-0.5">Active Plans</div>
          </div>
          <div className="card p-5">
            <div className="text-2xl font-bold text-brand-600">
              {plans.length > 0 ? formatCurrency(Math.min(...plans.map((p: any) => p.price))) : '—'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Starting Price</div>
          </div>
        </div>

        {/* Plans Grid */}
        {plans.length === 0 ? (
          <div className="card p-12 text-center space-y-4">
            <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
              <CreditCard className="w-7 h-7 text-slate-300" />
            </div>
            <div>
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Subscription Plans Yet</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">Create plans that students can browse and subscribe to. Active plans appear on your mess detail page.</p>
            </div>
            <button onClick={openCreatePlan} className="btn-primary mx-auto flex items-center gap-1.5 text-sm">
              <Plus className="w-4 h-4" /> Create First Plan
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {plans.map((plan: any, idx: number) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  'card p-6 flex flex-col justify-between border-2 transition-all relative overflow-hidden',
                  plan.active ? 'border-brand-200 dark:border-brand-900/60' : 'border-dashed border-slate-200 dark:border-slate-800 opacity-65'
                )}
              >
                {/* Active toggle badge */}
                <button
                  onClick={() => togglePlanActive(plan.id)}
                  className={cn(
                    'absolute top-4 right-4 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border transition-all',
                    plan.active
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800/60 dark:text-emerald-400'
                      : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700'
                  )}
                  title="Toggle plan visibility to students"
                >
                  {plan.active
                    ? <><ToggleRight className="w-3.5 h-3.5" /> Active</>
                    : <><ToggleLeft className="w-3.5 h-3.5" /> Inactive</>}
                </button>

                <div className="space-y-3 pr-20">
                  <div>
                    <h3 className="font-display font-bold text-slate-900 dark:text-white text-base leading-tight">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{plan.description || 'No description provided.'}</p>
                  </div>

                  {/* Meal chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {plan.meal_types.map((m: string) => (
                      <span key={m} className="inline-flex items-center gap-1 badge bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-[10px] border border-indigo-200 dark:border-indigo-800/50 capitalize">
                        {mealIcons[m]} {m}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatCurrency(plan.price)}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Valid for {plan.duration_days} days</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => openEditPlan(plan)}
                    className="flex-1 btn-secondary py-1.5 text-xs flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="p-2 rounded-xl border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    title="Delete plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info note */}
        {plans.length > 0 && (
          <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/40 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-brand-700 dark:text-brand-300 leading-relaxed">
              <strong>Active plans</strong> are visible to students when they browse your mess listing and can be subscribed to. 
              <strong> Inactive plans</strong> are hidden from students but remain saved here for future reactivation.
            </p>
          </div>
        )}

        {/* Create / Edit Plan Modal */}
        <AnimatePresence>
          {planModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPlanModalOpen(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.95, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-glass overflow-hidden z-10 flex flex-col max-h-[90vh]"
              >
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                      {editingPlan ? '✏️ Edit Subscription Plan' : '🆕 Create New Plan'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Students will see this plan on your mess listing page</p>
                  </div>
                  <button onClick={() => setPlanModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSavePlan} className="flex-1 overflow-y-auto p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Plan Name *</label>
                    <input
                      type="text"
                      required
                      value={planForm.name}
                      onChange={e => setPlanForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Full Day Meal Plan, Lunch Only..."
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                    <textarea
                      rows={2}
                      value={planForm.description}
                      onChange={e => setPlanForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Short description about what's included..."
                      className="input-field resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Price (₹) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={planForm.price}
                        onChange={e => setPlanForm(f => ({ ...f, price: e.target.value }))}
                        placeholder="e.g. 3500"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Validity (Days)</label>
                      <input
                        type="number"
                        min="1"
                        value={planForm.duration_days}
                        onChange={e => setPlanForm(f => ({ ...f, duration_days: e.target.value }))}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Meals Included *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {allMealTypes.map(meal => {
                        const selected = planForm.meal_types.includes(meal)
                        return (
                          <button
                            key={meal}
                            type="button"
                            onClick={() => {
                              setPlanForm(f => ({
                                ...f,
                                meal_types: selected
                                  ? f.meal_types.filter(m => m !== meal)
                                  : [...f.meal_types, meal]
                              }))
                            }}
                            className={cn(
                              'flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all capitalize',
                              selected
                                ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400'
                                : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-brand-300'
                            )}
                          >
                            <span>{mealIcons[meal]}</span> {meal}
                            {selected && <Check className="w-3.5 h-3.5 ml-auto text-brand-500" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                    <button type="button" onClick={() => setPlanModalOpen(false)} className="btn-secondary flex-1 justify-center text-sm">
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary flex-1 justify-center text-sm">
                      {editingPlan ? '✓ Save Changes' : '🚀 Create Plan'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // 4. Attendance View
  if (view === 'attendance') {
    return (
      <div className="p-6 space-y-6">
        <AnimatePresence>{bannerMsg && renderBanner()}</AnimatePresence>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-brand-500" /> Attendance Scan Logs
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Real-time check-in logs for today's meals</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSimulateScan} className="btn-secondary text-xs flex items-center gap-1.5">
              ⚡ Simulate QR Scan
            </button>
            <Link to="/dashboard/mess" className="btn-secondary text-sm">Back to Overview</Link>
          </div>
        </div>

        {/* Scan Logs list */}
        <div className="card p-6">
          <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            📋 Scans Today ({scans.length})
          </h3>
          {scans.length === 0 ? (
            <div className="text-center py-16 text-slate-400 italic text-sm">
              No students have scanned today's QR code yet. Share your poster or simulate a scan!
            </div>
          ) : (
            <div className="space-y-3">
              {scans.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-950 dark:text-white">{scan.studentName}</p>
                      <p className="text-[10px] text-slate-400">Scanned at {scan.time} • GPS: {scan.gpsStatus}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-purple text-[10px] capitalize">{scan.meal}</span>
                    <span className="badge badge-green text-[10px]">Checked In</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // 5. QR Code Poster View
  if (view === 'qr') {
    return (
      <div className="p-6 space-y-6 max-w-2xl mx-auto">
        <AnimatePresence>{bannerMsg && renderBanner()}</AnimatePresence>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">QR Poster Setup</h1>
          <Link to="/dashboard/mess" className="btn-secondary text-sm">Back</Link>
        </div>

        {/* Printable Poster Card */}
        <div className="bg-white text-slate-900 p-8 rounded-3xl border-4 border-slate-900 shadow-glass text-center space-y-6">
          <div className="border-b-4 border-slate-900 pb-4">
            <h2 className="text-3xl font-display font-extrabold tracking-tight">CAMPUSNEST MEAL TOKEN</h2>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Please Scan To Check-In</p>
          </div>

          <div className="py-6 bg-slate-50 rounded-2xl max-w-sm mx-auto border-2 border-dashed border-slate-300">
            {qrUrl ? (
              <img src={qrUrl} alt="Poster QR Code" className="w-56 h-56 mx-auto" />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center mx-auto text-slate-400">
                Loading QR Code...
              </div>
            )}
            <p className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mt-4">Mess ID: {myMess.id}</p>
          </div>

          <div className="space-y-1 max-w-md mx-auto text-left border-t border-slate-200 pt-4">
            <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Instructions:</h4>
            <ol className="text-xs text-slate-600 list-decimal list-inside space-y-1 font-medium">
              <li>Open the CampusNest App on your mobile device</li>
              <li>Navigate to Dashboard &rarr; Attendance &rarr; Scan QR Code</li>
              <li>Scan this QR and wait for GPS location verification</li>
              <li>Present the check-in confirmation to the mess counter operator</li>
            </ol>
          </div>

          <div className="border-t-4 border-slate-900 pt-6 flex justify-center gap-3">
            <button onClick={handlePrintQR} className="btn-secondary text-xs flex items-center gap-1.5 border-slate-900 text-slate-900 hover:bg-slate-100">
              <Printer className="w-4 h-4" /> Print Poster Poster
            </button>
            <button onClick={handlePrintQR} className="btn-primary bg-slate-900 hover:bg-slate-800 text-white text-xs flex items-center gap-1.5">
              <Download className="w-4 h-4" /> Save PNG Image
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 6. Analytics View
  if (view === 'analytics') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-brand-500" /> Revenue & Business Analytics
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Check income, meal scans, and customer distributions</p>
          </div>
          <Link to="/dashboard/mess" className="btn-secondary text-sm">Back</Link>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Monthly Income Projection (INR)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={[
                { month: 'Jan', revenue: 12000 },
                { month: 'Feb', revenue: 15400 },
                { month: 'Mar', revenue: 19800 },
                { month: 'Apr', revenue: 23200 },
                { month: 'May', revenue: 28500 },
                { month: 'Jun', revenue: subscribers.length * myMess.monthly_charge },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="#e0e7ff" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Daily Meal Performance (Avg Scans)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[
                { name: 'Mon', count: 32 },
                { name: 'Tue', count: 38 },
                { name: 'Wed', count: 29 },
                { name: 'Thu', count: 34 },
                { name: 'Fri', count: 42 },
                { name: 'Sat', count: 48 },
                { name: 'Sun', count: 45 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )
  }

  // 7. Payments View
  if (view === 'payments') {
    return (
      <div className="p-6 space-y-6">
        <AnimatePresence>{bannerMsg && renderBanner()}</AnimatePresence>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-brand-500" /> Subscription Payment Ledger
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Audit subscription receipts and approve pending Cash payouts</p>
          </div>
          <Link to="/dashboard/mess" className="btn-secondary text-sm">Back</Link>
        </div>

        {/* Ledger */}
        <div className="card p-6">
          <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Transaction History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-3 text-slate-500 font-medium">Receipt ID</th>
                  <th className="text-left py-3 px-3 text-slate-500 font-medium">Student</th>
                  <th className="text-left py-3 px-3 text-slate-500 font-medium">Amount</th>
                  <th className="text-left py-3 px-3 text-slate-500 font-medium">Date</th>
                  <th className="text-left py-3 px-3 text-slate-500 font-medium">Method</th>
                  <th className="text-center py-3 px-3 text-slate-500 font-medium">Status</th>
                  <th className="text-right py-3 px-3 text-slate-500 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, i) => (
                  <tr key={i} className="table-row-hover border-b border-slate-100 dark:border-slate-800">
                    <td className="py-4 px-3 font-semibold text-slate-600 dark:text-slate-400">{txn.id}</td>
                    <td className="py-4 px-3 font-bold text-slate-900 dark:text-white">{txn.studentName}</td>
                    <td className="py-4 px-3 font-bold">{formatCurrency(txn.amount)}</td>
                    <td className="py-4 px-3 text-slate-500">{txn.date}</td>
                    <td className="py-4 px-3 text-slate-500 font-medium">{txn.method}</td>
                    <td className="py-4 px-3 text-center">
                      <span className={cn(
                        'badge text-[10px] font-bold',
                        txn.status === 'Completed' ? 'badge-green' : 'badge-amber'
                      )}>{txn.status}</span>
                    </td>
                    <td className="py-4 px-3 text-right">
                      {txn.status === 'Pending Cash Collection' && (
                        <button
                          onClick={() => handleVerifyCash(txn.id)}
                          className="btn-primary py-1 px-3 text-[10px] font-bold"
                        >
                          Verify Collection
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // 8. Reports View
  if (view === 'reports') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-brand-500" /> Business Performance Reports
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Download payouts summaries and view food resource statistics</p>
          </div>
          <Link to="/dashboard/mess" className="btn-secondary text-sm">Back</Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6 space-y-4">
            <h3 className="font-display font-bold text-slate-950 dark:text-white text-base">Monthly Statement</h3>
            <p className="text-xs text-slate-500">Download audited statements containing student subscription counts, collection methods summaries, and attendance rate sheets.</p>
            <button onClick={() => {
              alert('Generating Monthly Statement PDF. Check your downloads directory in a moment.')
            }} className="btn-primary text-xs flex items-center gap-1">
              <Download className="w-4 h-4" /> Download Statement (PDF)
            </button>
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="font-display font-bold text-slate-950 dark:text-white text-base flex items-center gap-1.5">
              🌱 Food Resource Tracker
            </h3>
            <p className="text-xs text-slate-500">By comparing active subscription selections against QR attendance patterns, your kitchen successfully predicted serving margins.</p>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-2xl">
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-350">Estimated Food Waste Savings Today:</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">~14.5 kg saved</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
