import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Calendar, QrCode, TrendingUp, DollarSign, Bell, RefreshCw, BarChart2, Search, Plus, Trash2, Edit2, Sparkles, ChefHat, MapPin, Phone, Building, Download, CreditCard, FileText, BookOpen, ToggleLeft, ToggleRight, Camera, Link2, X } from 'lucide-react'
import { BarChart, Bar as ReBar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import { cn, formatCurrency, formatDate, mealTypeLabels } from '../../lib/utils'

type MessRow = {
  id: string
  owner_id: string
  name: string
  description: string
  address: string
  city: string
  state: string
  contact_phone: string
  monthly_charge: number
  per_meal_charge: number
  status: string
  verified: boolean
  featured: boolean
  rating: number
  review_count: number
  meal_types: string[]
  latitude?: number | null
  longitude?: number | null
  google_maps_url?: string | null
  photos?: string[] | null
}

type PlanRow = {
  id: string
  mess_id: string
  name: string
  description: string
  price: number
  duration_days: number
  meal_types: string[]
  active: boolean
}

type SubscriptionRow = {
  id: string
  student_id: string
  mess_id: string
  plan_id: string
  status: string
  start_date: string
  end_date: string
  amount_paid: number
  payment_status: string
  created_at: string
}

type AttendanceRow = {
  id: string
  student_id: string
  mess_id?: string | null
  date: string
  breakfast: boolean
  lunch: boolean
  dinner: boolean
  snack: boolean
}

type TransactionRow = {
  id: string
  owner_id: string
  student_name: string
  amount: number
  date: string
  method: string
  status: string
}

type PaymentSettingsRow = {
  owner_id: string
  upi_id: string
  phone_number: string
}

type MenuRow = {
  id: string
  owner_id: string
  breakfast: string[] | null
  lunch: string[] | null
  dinner: string[] | null
  snack: string[] | null
  date: string
}

type StudentProfile = {
  id: string
  full_name: string | null
  email: string | null
}

const defaultMenu = {
  breakfast: [],
  lunch: [],
  dinner: [],
  snack: [],
}

const defaultStatistics = [
  { label: 'Total Subscribers', value: '0', icon: '👥', color: 'from-brand-400 to-brand-600', sub: 'No users yet' },
  { label: 'Today\'s Attendance', value: '0', icon: '✅', color: 'from-emerald-400 to-emerald-600', sub: 'No scans yet' },
  { label: 'Monthly Revenue', value: '₹0', icon: '💰', color: 'from-amber-400 to-amber-600', sub: 'Calculated from paid users' },
  { label: 'Unpaid Accounts', value: '0', icon: '⚠️', color: 'from-red-400 to-red-600', sub: 'Requires review' },
]

export default function MessOwnerDashboard() {
  const location = useLocation()
  const { profile } = useAuthStore()

  const [mess, setMess] = useState<MessRow | null>(null)
  const [plans, setPlans] = useState<PlanRow[]>([])
  const [subscribers, setSubscribers] = useState<Array<SubscriptionRow & { student?: StudentProfile; plan?: PlanRow }>>([])
  const [attendance, setAttendance] = useState<AttendanceRow[]>([])
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [menu, setMenu] = useState<MenuRow | null>(null)
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettingsRow>({ owner_id: profile?.id || '', upi_id: '', phone_number: '' })
  const [loading, setLoading] = useState(false)
  const [bannerMsg, setBannerMsg] = useState('')

  const [messName, setMessName] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [monthlyCharge, setMonthlyCharge] = useState('3200')
  const [perMealCharge, setPerMealCharge] = useState('110')
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>(['breakfast', 'lunch', 'dinner'])
  const [latitude, setLatitude] = useState(18.5204)
  const [longitude, setLongitude] = useState(73.8567)
  const [googleMapsUrl, setGoogleMapsUrl] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)

  const startCamera = async () => {
    setIsCameraOpen(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      alert("Could not access camera. Please check permissions.")
      setIsCameraOpen(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
    setIsCameraOpen(false)
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setPhotos(prev => [...prev, dataUrl])
        stopCamera()
      }
    }
  }

  const renderCameraModal = () => (
    <AnimatePresence>
      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-lg bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
            <div className="p-4 flex justify-between items-center border-b border-slate-800">
              <h3 className="text-white font-bold flex items-center gap-2"><Camera className="w-5 h-5 text-brand-400" /> Take Photo</h3>
              <button onClick={stopCamera} className="text-slate-400 hover:text-white p-1 bg-slate-800 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="relative bg-black flex items-center justify-center h-[60vh] sm:h-96">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
            <div className="p-6 flex justify-center bg-slate-900">
              <button onClick={capturePhoto} className="w-16 h-16 rounded-full bg-white border-4 border-slate-300 shadow-glow flex items-center justify-center hover:bg-slate-200 transition-all focus:outline-none">
                <div className="w-12 h-12 rounded-full border border-slate-400"></div>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleAddImageUrl = () => {
    const url = prompt('Enter image URL:')
    if (url) {
      setPhotos(prev => [...prev, url])
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const [newItem, setNewItem] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [activeMenuCategory, setActiveMenuCategory] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch')
  const [planForm, setPlanForm] = useState({ name: '', description: '', price: '', duration_days: '30', meal_types: [] as string[] })
  const [selectedPlan, setSelectedPlan] = useState<PlanRow | null>(null)
  const [paymentForm, setPaymentForm] = useState({ upi_id: '', phone_number: '' })

  const path = location.pathname
  const view = path.endsWith('/menu') ? 'menu' : path.endsWith('/plans') ? 'plans' : path.endsWith('/subscribers') ? 'subscribers' : path.endsWith('/attendance') ? 'attendance' : path.endsWith('/qr') ? 'qr' : path.endsWith('/analytics') ? 'analytics' : path.endsWith('/payments') ? 'payments' : path.endsWith('/reports') ? 'reports' : path.endsWith('/settings') ? 'settings' : 'overview'

  const loadDashboard = async () => {
    if (!profile) return
    setLoading(true)
    try {
      const { data: messRows } = await supabase.from('messes').select('*').eq('owner_id', profile.id).maybeSingle()
      if (!messRows) {
        setMess(null)
        setPlans([])
        setSubscribers([])
        setAttendance([])
        setTransactions([])
        setMenu(null)
        setPaymentSettings({ owner_id: profile.id, upi_id: '', phone_number: '' })
        return
      }

      const currentMess = messRows as MessRow
      setMess(currentMess)
      setMessName(currentMess.name || '')
      setDescription(currentMess.description || '')
      setAddress(currentMess.address || '')
      setContactPhone(currentMess.contact_phone || '')
      setMonthlyCharge(String(currentMess.monthly_charge || 3200))
      setPerMealCharge(String(currentMess.per_meal_charge || 110))
      setSelectedMealTypes(currentMess.meal_types || ['breakfast', 'lunch', 'dinner'])
      setLatitude(currentMess.latitude || 18.5204)
      setLongitude(currentMess.longitude || 73.8567)
      setGoogleMapsUrl(currentMess.google_maps_url || '')
      setPhotos(currentMess.photos || [])

      const [plansResult, subscriptionsResult, attendanceResult, transactionsResult, paymentResult, menuResult] = await Promise.all([
        supabase.from('mess_plans').select('*').eq('mess_id', currentMess.id).order('created_at', { ascending: false }),
        supabase.from('student_subscriptions').select('*').eq('mess_id', currentMess.id).order('created_at', { ascending: false }),
        supabase.from('student_attendance').select('*').eq('mess_id', currentMess.id).order('date', { ascending: false }),
        supabase.from('mess_transactions').select('*').eq('owner_id', profile.id).order('date', { ascending: false }),
        supabase.from('mess_payment_settings').select('*').eq('owner_id', profile.id).maybeSingle(),
        supabase.from('mess_menus').select('*').eq('owner_id', profile.id).order('date', { ascending: false }).limit(1),
      ])

      const planRows = (plansResult.data || []) as PlanRow[]
      const subscriptionRows = (subscriptionsResult.data || []) as SubscriptionRow[]
      const attendanceRows = (attendanceResult.data || []) as AttendanceRow[]
      const transactionRows = (transactionsResult.data || []) as TransactionRow[]
      const menuRows = (menuResult.data || []) as MenuRow[]

      const studentIds = Array.from(new Set(subscriptionRows.map((row) => row.student_id)))
      const planIds = Array.from(new Set(subscriptionRows.map((row) => row.plan_id)))
      const [profileRows, planLookupResult] = await Promise.all([
        studentIds.length ? supabase.from('profiles').select('id, full_name, email').in('id', studentIds) : Promise.resolve({ data: [] }),
        planIds.length ? supabase.from('mess_plans').select('*').in('id', planIds) : Promise.resolve({ data: [] }),
      ])

      const profilesById = new Map<string, StudentProfile>((profileRows.data || []) as StudentProfile[] as any)
      const plansById = new Map<string, PlanRow>((planLookupResult.data || []) as PlanRow[] as any)

      setPlans(planRows)
      setSubscribers(subscriptionRows.map((row) => ({
        ...row,
        student: profilesById.get(row.student_id),
        plan: plansById.get(row.plan_id),
      })))
      setAttendance(attendanceRows)
      setTransactions(transactionRows)
      setPaymentSettings((paymentResult.data || { owner_id: profile.id, upi_id: '', phone_number: '' }) as PaymentSettingsRow)
      setPaymentForm({
        upi_id: (paymentResult.data as PaymentSettingsRow | null)?.upi_id || '',
        phone_number: (paymentResult.data as PaymentSettingsRow | null)?.phone_number || '',
      })
      setMenu(menuRows[0] || null)
    } catch (error) {
      console.error('Failed to load mess owner dashboard data:', error)
      setBannerMsg('Failed to load Supabase data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDashboard()
  }, [profile])

  const currentMenu = useMemo(() => menu || { ...defaultMenu }, [menu])
  const todayStr = new Date().toISOString().split('T')[0]
  const todaysScans = attendance.filter((row) => row.date === todayStr)

  const stats = useMemo(() => ([
    { label: 'Total Subscribers', value: subscribers.length.toString(), icon: '👥', color: 'from-brand-400 to-brand-600', sub: subscribers.length > 0 ? `${subscribers.length} active users` : 'No users registered' },
    { label: "Today's Attendance", value: todaysScans.length.toString(), icon: '✅', color: 'from-emerald-400 to-emerald-600', sub: todaysScans.length > 0 ? `${todaysScans.length} scans logged` : 'No logs yet' },
    { label: 'Monthly Revenue', value: formatCurrency(subscribers.filter((s) => s.payment_status === 'paid').reduce((sum, s) => sum + s.amount_paid, 0)), icon: '💰', color: 'from-amber-400 to-amber-600', sub: 'Calculated from paid subscriptions' },
    { label: 'Unpaid Accounts', value: subscribers.filter((s) => s.payment_status !== 'paid').length.toString(), icon: '⚠️', color: 'from-red-400 to-red-600', sub: 'Requires review' },
  ]), [subscribers, todaysScans])

  const dynamicWeeklyData = useMemo(() => Array.from({ length: 7 }).map((_, index) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - index))
    const dateStr = d.toISOString().split('T')[0]
    const dayScans = attendance.filter((row) => row.date === dateStr)
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      breakfast: dayScans.filter((row) => row.breakfast).length,
      lunch: dayScans.filter((row) => row.lunch).length,
      dinner: dayScans.filter((row) => row.dinner).length,
    }
  }), [attendance])

  const dynamicPieData = useMemo(() => ([
    { name: 'Breakfast', value: todaysScans.filter((row) => row.breakfast).length, color: '#f59e0b' },
    { name: 'Lunch', value: todaysScans.filter((row) => row.lunch).length, color: '#6366f1' },
    { name: 'Dinner', value: todaysScans.filter((row) => row.dinner).length, color: '#8b5cf6' },
  ].filter((row) => row.value > 0)), [todaysScans])

  const handleAddItem = () => {
    if (!newItem.trim()) return
    const text = newItemPrice.trim() ? `${newItem.trim()} - ₹${newItemPrice.trim()}` : newItem.trim()
    setMenu((prev) => {
      const p = prev || { id: `menu-${Date.now()}`, owner_id: profile?.id || '', breakfast: [], lunch: [], dinner: [], snack: [], date: todayStr }
      return {
        ...p,
        [activeMenuCategory]: [...(p[activeMenuCategory] || []), text]
      }
    })
    setNewItem('')
    setNewItemPrice('')
  }

  const updateMenu = async () => {
    if (!profile || !mess) return
    const payload = {
      id: menu?.id || `menu-${Date.now()}`,
      owner_id: profile.id,
      date: todayStr,
      breakfast: currentMenu.breakfast || [],
      lunch: currentMenu.lunch || [],
      dinner: currentMenu.dinner || [],
      snack: currentMenu.snack || [],
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('mess_menus').upsert(payload)
    if (error) {
      console.error('Failed to save menu:', error)
      return
    }
    setMenu(payload as MenuRow)
    setBannerMsg('Menu saved to Supabase')
    setTimeout(() => setBannerMsg(''), 2500)
  }

  const savePlan = async () => {
    if (!profile || !mess || !planForm.name.trim() || !planForm.price || planForm.meal_types.length === 0) return
    const payload = {
      id: `plan-${Date.now()}`,
      mess_id: mess.id,
      name: planForm.name,
      description: planForm.description,
      price: Number(planForm.price),
      duration_days: Number(planForm.duration_days),
      meal_types: planForm.meal_types,
      active: true,
    }
    const { error } = await supabase.from('mess_plans').insert(payload)
    if (error) {
      console.error('Failed to save plan:', error)
      return
    }
    setPlans((prev) => [payload as PlanRow, ...prev])
    setPlanForm({ name: '', description: '', price: '', duration_days: '30', meal_types: [] })
  }

  const togglePlanActive = async (id: string) => {
    const target = plans.find((item) => item.id === id)
    if (!target) return
    const { error } = await supabase.from('mess_plans').update({ active: !target.active }).eq('id', id)
    if (error) return console.error('Failed to toggle plan:', error)
    setPlans((prev) => prev.map((plan) => plan.id === id ? { ...plan, active: !plan.active } : plan))
  }

  const deletePlan = async (id: string) => {
    if (!window.confirm('Delete this subscription plan?')) return
    const { error } = await supabase.from('mess_plans').delete().eq('id', id)
    if (error) return console.error('Failed to delete plan:', error)
    setPlans((prev) => prev.filter((plan) => plan.id !== id))
  }

  const savePaymentSettings = async () => {
    if (!profile) return
    const payload = { owner_id: profile.id, upi_id: paymentForm.upi_id, phone_number: paymentForm.phone_number }
    const { error } = await supabase.from('mess_payment_settings').upsert(payload)
    if (error) return console.error('Failed to save payment settings:', error)
    setPaymentSettings(payload)
    setBannerMsg('Payment settings saved to Supabase')
    setTimeout(() => setBannerMsg(''), 2500)
  }

  const saveProfile = async () => {
    if (!profile) {
      alert('User session not found. Please log in again.')
      return
    }
    if (!selectedMealTypes.length) {
      alert('Please select at least one meal category served.')
      return
    }

    const payload = {
      id: mess?.id || `mess-${Date.now()}`,
      owner_id: profile.id,
      name: messName,
      description,
      address,
      city: mess?.city || 'Pune',
      state: mess?.state || 'Maharashtra',
      latitude,
      longitude,
      google_maps_url: googleMapsUrl,
      contact_phone: contactPhone,
      monthly_charge: Number(monthlyCharge),
      per_meal_charge: Number(perMealCharge),
      status: mess?.status || 'open',
      verified: mess?.verified || false,
      featured: mess?.featured || false,
      rating: mess?.rating || 5,
      review_count: mess?.review_count || 0,
      meal_types: selectedMealTypes,
      photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600'],
      created_at: mess?.id ? undefined : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('messes').upsert(payload)
    if (error) {
      console.error('Failed to save mess profile:', error)
      alert(`Failed to save: ${error.message}`)
      return
    }

    setBannerMsg('Mess profile saved to Supabase')
    setTimeout(() => setBannerMsg(''), 2500)
    await loadDashboard()
  }

  const handleGeneratePaymentQR = async (plan: PlanRow) => {
    if (!paymentSettings.upi_id) {
      alert('Please configure your UPI ID first.')
      return
    }
    const QRCode = (await import('qrcode')).default
    const url = await QRCode.toDataURL(`upi://pay?pa=${paymentSettings.upi_id}&pn=${encodeURIComponent(mess?.name || 'Mess')}&am=${plan.price}&cu=INR`)
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(`<img src="${url}" style="width:320px;height:320px" />`)
      win.document.close()
    }
  }

  const handleSimulateScan = async () => {
    if (!mess || subscribers.length === 0) {
      alert('Need at least one subscriber to simulate scans.')
      return
    }
    const random = subscribers[0]
    const meal = mess.meal_types[Math.floor(Math.random() * mess.meal_types.length)] || 'lunch'
    const payload = {
      id: `att-${Date.now()}`,
      student_id: random.student_id,
      mess_id: mess.id,
      date: todayStr,
      breakfast: meal === 'breakfast',
      lunch: meal === 'lunch',
      dinner: meal === 'dinner',
      snack: meal === 'snack',
    }
    const { error } = await supabase.from('student_attendance').insert(payload)
    if (error) return console.error('Failed to save attendance scan:', error)
    setAttendance((prev) => [payload as AttendanceRow, ...prev])
    setBannerMsg(`Scan saved for ${random.student?.full_name || 'Student'}`)
    setTimeout(() => setBannerMsg(''), 2500)
  }

  const handleVerifyCash = async (txnId: string) => {
    const { error } = await supabase.from('mess_transactions').update({ status: 'Completed' }).eq('id', txnId)
    if (error) return console.error('Failed to update transaction:', error)
    setTransactions((prev) => prev.map((txn) => txn.id === txnId ? { ...txn, status: 'Completed' } : txn))
  }

  const renderBanner = () => bannerMsg ? <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-2xl border border-slate-800 flex items-center gap-2 shadow-xl"><Sparkles className="w-4 h-4 text-brand-400" />{bannerMsg}</motion.div> : null

  if (!mess) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="text-center py-6 space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-indigo-600 flex items-center justify-center mx-auto text-2xl shadow-glow text-white">
            <ChefHat className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">Mess Onboarding Setup</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">Register your kitchen or mess service details in Supabase.</p>
        </div>

        <div className="card p-8 space-y-4 max-w-2xl mx-auto">
          {renderBanner()}
          <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Mess Service Name</label><input value={messName} onChange={(e) => setMessName(e.target.value)} placeholder="Mess Service Name" className="input-field" /></div>
          <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="input-field min-h-24" /></div>
          <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Contact Phone</label><input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Contact Phone" className="input-field" /></div>
          <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Address</label><input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" className="input-field" /></div>
          <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Google Maps Embed URL (Optional)</label><input value={googleMapsUrl} onChange={(e) => setGoogleMapsUrl(e.target.value)} placeholder="Google Maps Embed URL (Optional)" className="input-field" /></div>
          {googleMapsUrl && (
            <div className="text-sm">
              <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="text-brand-500 hover:underline flex items-center gap-1 mb-2">
                <MapPin className="w-4 h-4" /> Open Link
              </a>
              {googleMapsUrl.includes('embed') && (
                <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-200">
                  <iframe src={googleMapsUrl.match(/src="([^"]+)"/)?.[1] || googleMapsUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Monthly Charge (₹)</label><input value={monthlyCharge} onChange={(e) => setMonthlyCharge(e.target.value)} placeholder="Monthly Charge" className="input-field" /></div>
            <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Per Meal Charge (₹)</label><input value={perMealCharge} onChange={(e) => setPerMealCharge(e.target.value)} placeholder="Per Meal Charge" className="input-field" /></div>
          </div>
          
          {/* Location Detection */}
          <div className="flex items-center gap-4 py-2">
            <button 
              type="button"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setLatitude(position.coords.latitude)
                      setLongitude(position.coords.longitude)
                      setBannerMsg('Location detected automatically!')
                      setTimeout(() => setBannerMsg(''), 2500)
                    },
                    (error) => alert('Could not detect location. Please allow location access.')
                  )
                }
              }}
              className="btn-secondary flex items-center justify-center gap-2 flex-1"
            >
              <MapPin className="w-4 h-4 text-brand-500" /> Detect Current Location
            </button>
            <div className="flex-1 text-xs text-slate-500">
              {(latitude && longitude && latitude !== 18.5204) ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  ✓ Location captured ({latitude.toFixed(4)}, {longitude.toFixed(4)})
                </span>
              ) : (
                <span>📍 Location not detected yet</span>
              )}
            </div>
          </div>

          {(latitude && longitude && latitude !== 18.5204) && (
            <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-200 mt-2">
              <iframe 
                src={`https://maps.google.com/maps?q=${latitude},${longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade" 
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Mess Photos</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
              {photos.map((img, i) => (
                <div key={i} className="relative aspect-video rounded-lg overflow-hidden group">
                  <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-3 flex flex-col items-center justify-center transition-colors">
                <Plus className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-xs text-slate-500 font-medium">Upload Image</span>
                <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
              <button 
                type="button"
                onClick={startCamera}
                className="flex-1 cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-3 flex flex-col items-center justify-center transition-colors"
              >
                <Camera className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-xs text-slate-500 font-medium">Take Photo</span>
              </button>
              <button 
                type="button" 
                onClick={handleAddImageUrl}
                className="flex-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-3 flex flex-col items-center justify-center transition-colors"
              >
                <Link2 className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-xs text-slate-500 font-medium">Add via Link</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Meals Provided</label>
            <div className="flex flex-wrap gap-2">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(meal => (
                <button
                  key={meal}
                  type="button"
                  onClick={() => setSelectedMealTypes(prev => prev.includes(meal) ? prev.filter(m => m !== meal) : [...prev, meal])}
                  className={`flex-1 py-2 text-xs font-medium rounded-xl border capitalize ${selectedMealTypes.includes(meal) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                  {meal}
                </button>
              ))}
            </div>
          </div>

          <button onClick={saveProfile} className="btn-primary w-full mt-4">Register Mess Profile</button>
        </div>
        {renderCameraModal()}
      </div>
    )
  }

  if (view === 'overview') {
    return (
      <div className="p-6 space-y-6">
        {renderBanner()}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">{mess.name} <Link to="/dashboard/mess/settings" className="text-slate-400 hover:text-brand-500"><Edit2 className="w-5 h-5" /></Link></h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">📍 {mess.address} | Owner Dashboard</p>
          </div>
          <div className="flex gap-2 items-center flex-wrap justify-end"><button onClick={handleSimulateScan} className="btn-secondary text-xs flex items-center gap-1">⚡ Scan Simulator</button><Link to="/dashboard/mess/qr" className="btn-primary text-sm flex items-center gap-1"><QrCode className="w-4 h-4" /> View QR Poster</Link></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{stats.map((s) => (<div key={s.label} className="card p-5"><div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl mb-3`}>{s.icon}</div><div className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{s.value}</div><div className="text-xs text-slate-500 mt-0.5">{s.label}</div><div className="text-[11px] text-brand-500 mt-1">{s.sub}</div></div>))}</div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card p-6 text-center"><h3 className="font-display font-bold mb-4 flex items-center justify-center gap-2"><QrCode className="w-4 h-4 text-brand-500" /> Daily Check-In QR</h3><div className="w-40 h-40 rounded-2xl border-4 border-dashed border-slate-300 mx-auto flex items-center justify-center text-slate-400">QR</div><Link to="/dashboard/mess/qr" className="btn-primary w-full text-xs py-2 mt-4">Open Printable QR Poster</Link></div>
          <div className="card p-6"><h3 className="font-display font-bold mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-brand-500" /> Today's Meal Scans</h3><div className="space-y-4">{mess.meal_types.map((meal) => { const count = todaysScans.filter((s) => s[meal as keyof AttendanceRow]).length; return (<div key={meal}><div className="flex justify-between items-center mb-1"><span className="text-xs font-medium capitalize">{mealTypeLabels[meal as keyof typeof mealTypeLabels] || meal}</span><span className="text-xs font-bold">{count} checked in</span></div><div className="progress-bar h-1.5"><div className="h-full rounded-full bg-brand-500" style={{ width: `${subscribers.length > 0 ? (count / subscribers.length) * 100 : 0}%` }} /></div></div>)})}</div></div>
          <div className="card p-6"><h3 className="font-display font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-brand-500" /> Meal Attendance Rate</h3><ResponsiveContainer width="100%" height={160}>{dynamicPieData.length > 0 ? <PieChart><Pie data={dynamicPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">{dynamicPieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}</Pie><Tooltip /></PieChart> : <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 italic">No attendance yet today</div>}</ResponsiveContainer></div>
        </div>

        <div className="card p-6"><h3 className="font-display font-bold mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-brand-500" /> Weekly Scans Breakdown</h3><ResponsiveContainer width="100%" height={220}><BarChart data={dynamicWeeklyData}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="day" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><ReBar dataKey="breakfast" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Breakfast" /><ReBar dataKey="lunch" fill="#6366f1" radius={[4, 4, 0, 0]} name="Lunch" /><ReBar dataKey="dinner" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Dinner" /></BarChart></ResponsiveContainer></div>

        <div className="card p-6"><div className="flex items-center justify-between mb-5"><h3 className="font-display font-bold flex items-center gap-2"><Users className="w-4 h-4 text-brand-500" /> Active Subscribers</h3><Link to="/dashboard/mess/subscribers" className="text-sm text-brand-600 hover:underline">View All</Link></div>{subscribers.length === 0 ? <div className="text-center py-10 text-slate-400 text-xs italic">No subscriptions yet.</div> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-200"><th className="text-left py-3 px-3">Student</th><th className="text-left py-3 px-3">Plan</th><th className="text-left py-3 px-3">Expiry</th><th className="text-center py-3 px-3">Payment</th></tr></thead><tbody>{subscribers.slice(0, 5).map((sub) => (<tr key={sub.id} className="border-b border-slate-100"><td className="py-3 px-3">{sub.student?.full_name || sub.student?.email || sub.student_id}</td><td className="py-3 px-3">{sub.plan?.name || sub.plan_id}</td><td className="py-3 px-3">{formatDate(sub.end_date)}</td><td className="py-3 px-3 text-center"><span className={cn('badge text-[10px]', sub.payment_status === 'paid' ? 'badge-green' : 'badge-red')}>{sub.payment_status}</span></td></tr>))}</tbody></table></div>}</div>
      </div>
    )
  }

  if (view === 'menu') {
    const activeCategories = (['breakfast', 'lunch', 'dinner', 'snack'] as const).filter((cat) => mess.meal_types.includes(cat))
    return (
      <div className="p-6 space-y-6">
        {renderBanner()}
        <div className="flex items-center justify-between"><div><h1 className="text-2xl font-display font-bold flex items-center gap-2"><ChefHat className="w-6 h-6 text-brand-500" /> Daily Menu Manager</h1><p className="text-slate-500 text-sm mt-1">Publish and edit today's menu at {mess.name}</p></div><Link to="/dashboard/mess" className="btn-secondary text-sm">Back to Overview</Link></div>
        <div className="grid lg:grid-cols-3 gap-8"><div className="card p-5 space-y-1 lg:col-span-1">{activeCategories.map((cat) => <button key={cat} onClick={() => setActiveMenuCategory(cat)} className={cn('w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold capitalize', activeMenuCategory === cat ? 'bg-brand-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800')}>{cat}<span className="badge text-[9px]">{(currentMenu[cat] || []).length} Items</span></button>)}</div><div className="card p-6 lg:col-span-2 space-y-4"><div className="flex justify-between items-center"><h3 className="font-bold capitalize">Editing: {activeMenuCategory}</h3><button onClick={() => setMenu({ id: menu?.id || '', owner_id: profile?.id || '', breakfast: [], lunch: [], dinner: [], snack: [], date: todayStr })} className="text-xs text-red-500 hover:underline font-medium">Clear All</button></div><div className="grid sm:grid-cols-2 gap-3">{(currentMenu[activeMenuCategory] || []).map((item, idx) => <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-sm font-medium text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 shadow-sm"><span className="truncate pr-2">{item}</span><button onClick={() => setMenu((prev) => prev ? { ...prev, [activeMenuCategory]: (prev[activeMenuCategory] || []).filter((_: string, i: number) => i !== idx) } : prev)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-500" /></button></div>)} </div><div className="flex gap-2 mt-2"><input value={newItem} onChange={(e) => setNewItem(e.target.value)} className="input-field flex-1" placeholder="Add menu item (e.g. Paneer Masala)" /><input value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} className="input-field w-24 sm:w-32" placeholder="Price (₹)" /><button onClick={handleAddItem} className="btn-secondary whitespace-nowrap">Add</button><button onClick={updateMenu} className="btn-primary whitespace-nowrap">Save Menu</button></div></div></div>
      </div>
    )
  }

  if (view === 'plans') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div><h1 className="text-2xl font-display font-bold flex items-center gap-2"><CreditCard className="w-6 h-6 text-brand-500" /> Subscription Plans Manager</h1><p className="text-slate-500 text-sm mt-1">Manage meal plans stored in Supabase.</p></div><button onClick={() => setPlanForm({ name: '', description: '', price: '', duration_days: '30', meal_types: [] })} className="btn-secondary">New Plan</button></div>
        <div className="grid lg:grid-cols-3 gap-6"><div className="card p-6 space-y-3"><input className="input-field" value={planForm.name} onChange={(e) => setPlanForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Plan name" /><textarea className="input-field min-h-24" value={planForm.description} onChange={(e) => setPlanForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Description" /><div className="grid grid-cols-2 gap-2"><input className="input-field" value={planForm.price} onChange={(e) => setPlanForm((prev) => ({ ...prev, price: e.target.value }))} placeholder="Price" /><input className="input-field" value={planForm.duration_days} onChange={(e) => setPlanForm((prev) => ({ ...prev, duration_days: e.target.value }))} placeholder="Days" /></div><div className="grid grid-cols-2 gap-2">{(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((meal) => <button key={meal} onClick={() => setPlanForm((prev) => ({ ...prev, meal_types: prev.meal_types.includes(meal) ? prev.meal_types.filter((item) => item !== meal) : [...prev.meal_types, meal] }))} className={cn('p-2 rounded-xl border text-xs capitalize', planForm.meal_types.includes(meal) ? 'border-brand-500 bg-brand-50' : 'border-slate-200')}>{meal}</button>)}</div><button onClick={savePlan} className="btn-primary w-full">Save Plan</button></div><div className="card p-6 lg:col-span-2 space-y-3">{plans.map((plan) => <div key={plan.id} className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between"><div><div className="font-bold">{plan.name}</div><div className="text-xs text-slate-500">{formatCurrency(plan.price)} • {plan.duration_days} days</div></div><div className="flex gap-2"><button onClick={() => handleGeneratePaymentQR(plan)} className="btn-secondary text-xs">QR</button><button onClick={() => togglePlanActive(plan.id)} className="btn-secondary text-xs">{plan.active ? 'Deactivate' : 'Activate'}</button><button onClick={() => deletePlan(plan.id)} className="btn-secondary text-xs text-red-500">Delete</button></div></div>)}</div></div>
      </div>
    )
  }

  if (view === 'subscribers') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><h1 className="text-2xl font-display font-bold">Active Subscribers</h1><button onClick={handleSimulateScan} className="btn-secondary text-xs">Simulate Scan</button></div>
        <div className="card p-6 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-3 px-3">Student</th><th className="text-left py-3 px-3">Plan</th><th className="text-left py-3 px-3">Expiry</th><th className="text-left py-3 px-3">Status</th></tr></thead><tbody>{subscribers.map((sub) => <tr key={sub.id} className="border-b"><td className="py-3 px-3">{sub.student?.full_name || sub.student?.email || sub.student_id}</td><td className="py-3 px-3">{sub.plan?.name || sub.plan_id}</td><td className="py-3 px-3">{formatDate(sub.end_date)}</td><td className="py-3 px-3"><span className={cn('badge text-[10px]', sub.payment_status === 'paid' ? 'badge-green' : 'badge-red')}>{sub.payment_status}</span></td></tr>)}</tbody></table></div>
      </div>
    )
  }

  if (view === 'attendance') {
    return (
      <div className="p-6 space-y-6">
        <div><h1 className="text-2xl font-display font-bold">Attendance Scan Logs</h1><p className="text-slate-500 text-sm mt-1">Loaded from Supabase attendance rows.</p></div>
        <div className="card p-6 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-3 px-3">Date</th><th className="text-left py-3 px-3">Student</th><th className="text-center py-3 px-3">Meal</th></tr></thead><tbody>{attendance.slice(0, 20).map((row) => <tr key={row.id} className="border-b"><td className="py-3 px-3">{formatDate(row.date)}</td><td className="py-3 px-3">{subscribers.find((sub) => sub.student_id === row.student_id)?.student?.full_name || row.student_id}</td><td className="py-3 px-3 text-center">{['breakfast', 'lunch', 'dinner', 'snack'].filter((meal) => row[meal as keyof AttendanceRow]).map((meal) => mealTypeLabels[meal as keyof typeof mealTypeLabels]).join(', ')}</td></tr>)}</tbody></table></div>
      </div>
    )
  }

  if (view === 'payments') {
    return (
      <div className="p-6 space-y-6">
        <div className="grid lg:grid-cols-3 gap-6"><div className="card p-6 space-y-3"><h3 className="font-bold flex items-center gap-2"><CreditCard className="w-4 h-4 text-brand-500" /> Payment Settings</h3><input className="input-field" value={paymentForm.upi_id} onChange={(e) => setPaymentForm((prev) => ({ ...prev, upi_id: e.target.value }))} placeholder="UPI ID" /><input className="input-field" value={paymentForm.phone_number} onChange={(e) => setPaymentForm((prev) => ({ ...prev, phone_number: e.target.value }))} placeholder="Phone number" /><button onClick={savePaymentSettings} className="btn-primary w-full">Save Settings</button></div><div className="card p-6 lg:col-span-2 overflow-x-auto"><h3 className="font-bold mb-4">Transactions</h3><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-3 px-3">Student</th><th className="text-left py-3 px-3">Amount</th><th className="text-left py-3 px-3">Date</th><th className="text-left py-3 px-3">Status</th></tr></thead><tbody>{transactions.map((txn) => <tr key={txn.id} className="border-b"><td className="py-3 px-3">{txn.student_name}</td><td className="py-3 px-3">{formatCurrency(txn.amount)}</td><td className="py-3 px-3">{formatDate(txn.date)}</td><td className="py-3 px-3"><button onClick={() => handleVerifyCash(txn.id)} className={cn('badge text-[10px]', txn.status === 'Completed' ? 'badge-green' : 'badge-yellow')}>{txn.status}</button></td></tr>)}</tbody></table></div></div>
      </div>
    )
  }

  if (view === 'settings') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div><h1 className="text-2xl font-display font-bold">Mess Settings</h1><p className="text-slate-500 text-sm mt-1">Edit your mess profile and save it directly to Supabase.</p></div><button onClick={loadDashboard} className="btn-secondary text-xs">Refresh</button></div>
        <div className="card p-6 space-y-4">
          <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Mess Name</label><input className="input-field" value={messName} onChange={(e) => setMessName(e.target.value)} placeholder="Mess name" /></div>
          <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label><textarea className="input-field min-h-24" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" /></div>
          <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Contact Phone</label><input className="input-field" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Contact Phone" /></div>
          <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Address</label><input className="input-field" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" /></div>
          
          <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Google Maps Embed URL (Optional)</label><input value={googleMapsUrl} onChange={(e) => setGoogleMapsUrl(e.target.value)} placeholder="Google Maps Embed URL (Optional)" className="input-field" /></div>
          {googleMapsUrl && (
            <div className="text-sm">
              <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="text-brand-500 hover:underline flex items-center gap-1 mb-2">
                <MapPin className="w-4 h-4" /> Open Link
              </a>
              {googleMapsUrl.includes('embed') && (
                <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-200">
                  <iframe src={googleMapsUrl.match(/src="([^"]+)"/)?.[1] || googleMapsUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Monthly Charge (₹)</label><input className="input-field" value={monthlyCharge} onChange={(e) => setMonthlyCharge(e.target.value)} placeholder="Monthly charge" /></div>
            <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Per Meal Charge (₹)</label><input className="input-field" value={perMealCharge} onChange={(e) => setPerMealCharge(e.target.value)} placeholder="Per meal charge" /></div>
          </div>

          {/* Location Detection */}
          <div className="flex items-center gap-4 py-2">
            <button 
              type="button"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setLatitude(position.coords.latitude)
                      setLongitude(position.coords.longitude)
                      setBannerMsg('Location detected automatically!')
                      setTimeout(() => setBannerMsg(''), 2500)
                    },
                    (error) => alert('Could not detect location. Please allow location access.')
                  )
                }
              }}
              className="btn-secondary flex items-center justify-center gap-2 flex-1"
            >
              <MapPin className="w-4 h-4 text-brand-500" /> Detect Current Location
            </button>
            <div className="flex-1 text-xs text-slate-500">
              {(latitude && longitude && latitude !== 18.5204) ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  ✓ Location captured ({latitude.toFixed(4)}, {longitude.toFixed(4)})
                </span>
              ) : (
                <span>📍 Location not detected yet</span>
              )}
            </div>
          </div>

          {(latitude && longitude && latitude !== 18.5204) && (
            <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-200 mt-2">
              <iframe 
                src={`https://maps.google.com/maps?q=${latitude},${longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade" 
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Mess Photos</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
              {photos.map((img, i) => (
                <div key={i} className="relative aspect-video rounded-lg overflow-hidden group">
                  <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-3 flex flex-col items-center justify-center transition-colors">
                <Plus className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-xs text-slate-500 font-medium">Upload Image</span>
                <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
              <button 
                type="button"
                onClick={startCamera}
                className="flex-1 cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-3 flex flex-col items-center justify-center transition-colors"
              >
                <Camera className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-xs text-slate-500 font-medium">Take Photo</span>
              </button>
              <button 
                type="button" 
                onClick={handleAddImageUrl}
                className="flex-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-3 flex flex-col items-center justify-center transition-colors"
              >
                <Link2 className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-xs text-slate-500 font-medium">Add via Link</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Meals Provided</label>
            <div className="flex gap-2">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(meal => (
                <button
                  key={meal}
                  type="button"
                  onClick={() => setSelectedMealTypes(prev => prev.includes(meal) ? prev.filter(m => m !== meal) : [...prev, meal])}
                  className={`flex-1 py-2 text-xs font-medium rounded-xl border capitalize ${selectedMealTypes.includes(meal) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                  {meal}
                </button>
              ))}
            </div>
          </div>

          <button onClick={saveProfile} className="btn-primary mt-4">Save Mess Profile</button>
        </div>
        {renderCameraModal()}
      </div>
    )
  }

  return null
}
