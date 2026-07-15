import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart2, TrendingUp, CreditCard, Calendar, QrCode, Star, CheckCircle, ArrowUpRight, Plus, MapPin, Phone, ShieldCheck, Download, CalendarCheck, Sparkles, DollarSign, X, Search, Utensils } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useAuthStore } from '../../store/authStore'
import { mockAttendance as initialAttendance, mockMesses, mockPlans } from '../../data/mockData'
import { formatCurrency, formatDate, getRemainingDays, mealTypeLabels } from '../../lib/utils'
import { cn } from '../../lib/utils'

const defaultSub = {
  plan: mockPlans[0],
  mess: mockMesses[0],
  start_date: new Date().toISOString().split('T')[0], // Use today as start date
  end_date: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from today
  status: 'active',
  amount_paid: 3500,
}

export default function StudentDashboard() {
  const { profile } = useAuthStore()
  const location = useLocation()

  // Combine mock + localStorage messes
  const allMesses = (() => {
    const defaultMesses = [...mockMesses]
    try {
      const customMesses: any[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('campusnest-mess-profile-')) {
          const val = localStorage.getItem(key)
          if (val) customMesses.push(JSON.parse(val))
        }
      }
      const combined = [...customMesses]
      defaultMesses.forEach(m => {
        if (!combined.some(c => c.id === m.id)) combined.push(m)
      })
      return combined
    } catch {
      return defaultMesses
    }
  })()

  // State
  const [subscription, setSubscription] = useState(() => {
    const saved = localStorage.getItem('campusnest-student-subscription')
    if (saved) return JSON.parse(saved)
    return defaultSub
  })

  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem('campusnest-student-attendance')
    if (saved) return JSON.parse(saved)
    // Return empty array for new users instead of mock data
    return []
  })

  const [subscriptionHistory, setSubscriptionHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('campusnest-student-subscription-history')
    if (saved) return JSON.parse(saved)
    return []
  })

  // Generate dynamic spending data for the last 6 months
  const generateSpendingData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const data = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = months[date.getMonth()]
      
      // Only show spending if subscription existed during this month
      const subStart = new Date(subscription.start_date)
      if (date >= subStart) {
        data.push({ month, amount: subscription.amount_paid })
      } else {
        data.push({ month, amount: 0 })
      }
    }
    
    return data
  }

  // Filter attendance to only show records from subscription start date onwards
  const filteredAttendance = attendance.filter((record: any) => {
    if (!subscription || !subscription.start_date) return false
    return new Date(record.date) >= new Date(subscription.start_date)
  }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Purchase Modal State
  const [selectedMess, setSelectedMess] = useState(allMesses[0])
  const [selectedPlan, setSelectedPlan] = useState(mockPlans[0])
  const [showCheckout, setShowCheckout] = useState(false)
  const [messSearchQuery, setMessSearchQuery] = useState('')
  const [showAllMesses, setShowAllMesses] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'details' | 'upi_qr' | 'paying' | 'success'>('details')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'upi' | 'card'>('upi')
  const [checkoutQRUrl, setCheckoutQRUrl] = useState('')
  const [checkoutMessage, setCheckoutMessage] = useState('')

  useEffect(() => {
    localStorage.setItem('campusnest-student-subscription', JSON.stringify(subscription))
  }, [subscription])

  useEffect(() => {
    localStorage.setItem('campusnest-student-attendance', JSON.stringify(attendance))
  }, [attendance])

  useEffect(() => {
    localStorage.setItem('campusnest-student-subscription-history', JSON.stringify(subscriptionHistory))
  }, [subscriptionHistory])



  // Fetch mess owner payment settings
  const getMessPaymentSettings = (mess: any) => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('campusnest-mess-profile-')) {
        const profile = JSON.parse(localStorage.getItem(key) || '{}')
        if (profile.id === mess.id || profile.name === mess.name) {
          const ownerId = profile.owner_id
          const settingsStr = localStorage.getItem(`campusnest-mess-payment-settings-${ownerId}`)
          if (settingsStr) return JSON.parse(settingsStr)
        }
      }
    }
    return { upi_id: 'messowner@ybl', phone_number: '9876543210' } // Mock fallback
  }

  // Handle plan purchase simulation
  const handlePurchaseClick = async () => {
    if (selectedPaymentMethod === 'upi') {
      const settings = getMessPaymentSettings(selectedMess)
      if (!settings.upi_id) {
        alert("This mess has not configured UPI payments. Please pay at the mess counter.")
        return
      }
      
      const upiUri = `upi://pay?pa=${settings.upi_id}&pn=${encodeURIComponent(selectedMess.name)}&am=${selectedPlan.price}&cu=INR&tn=Plan+${encodeURIComponent(selectedPlan.name)}`
      try {
        const QRCode = (await import('qrcode')).default
        const url = await QRCode.toDataURL(upiUri, { width: 250, margin: 2 })
        setCheckoutQRUrl(url)
        setPaymentStep('upi_qr')
      } catch (err) {
        console.error('Failed to generate QR', err)
      }
    } else {
      processPurchase()
    }
  }

  const processPurchase = () => {
    setPaymentStep('paying')
    setTimeout(() => {
      const today = new Date()
      const end = new Date()
      end.setDate(today.getDate() + selectedPlan.duration_days)

      const newSub = {
        plan: selectedPlan,
        mess: selectedMess,
        start_date: today.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
        status: 'active',
        amount_paid: selectedPlan.price
      }

      if (subscription) {
        setSubscriptionHistory(prev => [{...subscription, status: 'expired'}, ...prev])
      }

      setSubscription(newSub)
      setPaymentStep('success')
    }, 2000)
  }

  const handleDownloadReceipt = () => {
    alert(`Generating payment receipt for ${formatCurrency(selectedPlan.price)}... The PDF has been downloaded to your device.`)
  }

  // Determine which view/tab to render
  const path = location.pathname
  const view = path.endsWith('/subscription') 
    ? 'subscription' 
    : path.endsWith('/attendance') 
      ? 'attendance' 
      : 'overview'

  // Calculate dynamic attendanceData for the chart
  const dynamicAttendanceData = (() => {
    let w1 = 0, w2 = 0, w3 = 0, w4 = 0
    const subStart = new Date(subscription?.start_date || new Date())
    
    filteredAttendance.forEach((record: any) => {
      const meals = [record.breakfast, record.lunch, record.dinner, record.snack].filter(Boolean).length
      const recordDate = new Date(record.date)
      const daysSinceStart = Math.floor((recordDate.getTime() - subStart.getTime()) / (24 * 60 * 60 * 1000))
      
      if (daysSinceStart < 7) w1 += meals
      else if (daysSinceStart < 14) w2 += meals
      else if (daysSinceStart < 21) w3 += meals
      else if (daysSinceStart < 28) w4 += meals
    })
    
    return [
      { week: 'Week 1', meals: w1 },
      { week: 'Week 2', meals: w2 },
      { week: 'Week 3', meals: w3 },
      { week: 'Week 4', meals: w4 },
    ]
  })()

  // Overview Tab
  if (view === 'overview') {
    const remaining = subscription ? getRemainingDays(subscription.end_date) : 0
    const totalMeals = filteredAttendance.reduce((acc: number, d: any) => {
      return acc + [d.breakfast, d.lunch, d.dinner, d.snack].filter(Boolean).length
    }, 0)

    const stats = [
      { label: 'Active Plan', value: subscription ? subscription.plan.name : 'No Plan', icon: '💳', color: 'from-brand-400 to-brand-600', sub: subscription ? `${remaining} days left` : 'Subscribe now' },
      { label: 'Meals This Month', value: totalMeals, icon: '🍽️', color: 'from-emerald-400 to-emerald-600', sub: subscription ? `Out of ${subscription.plan.meal_types?.length || 3} daily` : 'No data' },
      { label: 'Amount Paid', value: subscription ? formatCurrency(subscription.amount_paid) : '₹0', icon: '💰', color: 'from-amber-400 to-amber-600', sub: 'This period' },
      { label: 'Days Remaining', value: remaining, icon: '📅', color: 'from-purple-400 to-purple-600', sub: subscription ? 'In current plan' : '-' },
    ]

    // Dynamic spending data based on actual subscription
    const dynamicSpendingData = generateSpendingData()

    return (
      <div className="p-6 space-y-6">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
              Good morning, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Here's your campus life at a glance
            </p>
          </div>
          <Link to="/dashboard/student/scan" className="btn-primary gap-2">
            <QrCode className="w-4 h-4" /> Scan QR
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <div className="card p-5">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl mb-3`}>
                  {stat.icon}
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{stat.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</div>
                <div className="text-[11px] text-slate-400 mt-1">{stat.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active Subscription */}
          <div className="card p-6">
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-500" /> Active Subscription
            </h3>
            {subscription ? (
              <>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white mb-4 shadow-md">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-brand-200 text-xs">Current Plan</p>
                      <p className="font-bold text-lg">{subscription.plan.name}</p>
                    </div>
                    <span className="badge bg-white/20 text-white border-white/30 border">Active</span>
                  </div>
                  <p className="text-brand-200 text-xs">{subscription.mess.name}</p>
                  <div className="mt-3 progress-bar bg-white/20">
                    <div className="progress-fill bg-white" style={{ width: `${Math.max(0, Math.min(100, (remaining / 30) * 100))}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-brand-200 mt-1">
                    <span>{formatDate(subscription.start_date)}</span>
                    <span>{remaining} days left</span>
                    <span>{formatDate(subscription.end_date)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {subscription.plan.meal_types.map((meal: string) => (
                    <div key={meal} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-slate-700 dark:text-slate-300">{mealTypeLabels[meal as keyof typeof mealTypeLabels] || meal}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm mb-4">You don't have an active subscription.</p>
                <Link to="/dashboard/student/subscription" className="btn-primary w-full justify-center text-sm">
                  Find a Meal Plan
                </Link>
              </div>
            )}
            
            {subscription && (
              <div className="flex gap-2 mt-4">
                <button onClick={() => {
                  alert(`Generating payment receipt for ${formatCurrency(subscription.amount_paid)}... The PDF has been downloaded to your device.`)
                }} className="btn-secondary w-full justify-center text-xs flex items-center gap-1.5">
                  <Download className="w-4 h-4" /> Receipt
                </button>
                <Link to="/dashboard/student/subscription" className="btn-secondary w-full justify-center text-xs">
                  Manage Plan
                </Link>
              </div>
            )}
          </div>

          {/* Today's Meals */}
          <div className="card p-6">
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-500" /> Today's Meals
            </h3>
            <div className="space-y-3">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(meal => {
                const todayStr = new Date().toISOString().split('T')[0]
                const todayRecord = attendance.find((r: any) => r.date.startsWith(todayStr))
                const today = todayRecord || { breakfast: false, lunch: false, dinner: false, snack: false }
                const attended = today[meal]
                return (
                  <div key={meal} className={cn('flex items-center justify-between p-3 rounded-xl border',
                    attended ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700')}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : meal === 'dinner' ? '🌙' : '🍪'}</span>
                      <span className={cn('text-sm font-medium capitalize', attended ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400')}>
                        {meal}
                      </span>
                    </div>
                    {attended ? (
                      <span className="badge badge-green text-[10px]">✓ Done</span>
                    ) : (
                      <Link to="/dashboard/student/scan" className="badge badge-purple text-[10px] hover:opacity-85">Scan QR</Link>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Attendance Chart */}
          <div className="card p-6">
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-brand-500" /> Meals This Month
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dynamicAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="meals" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 flex justify-between text-xs text-slate-500">
              <span>Total: {totalMeals} meals</span>
              <span>Avg: {(totalMeals / 4).toFixed(1)}/week</span>
            </div>
          </div>
        </div>

        {/* Spending Trend */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card p-6 lg:col-span-2">
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-500" /> Monthly Spending
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dynamicSpendingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`₹${v}`, 'Spent']} />
                <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Actions */}
          <div className="card p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">⚡ Quick Links</h3>
              <div className="space-y-3">
                <Link to="/roommates" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">👥 Match Roommates</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </Link>
                <Link to="/community" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">📢 Campus Board</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </Link>
                <Link to="/properties" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">🏠 Search Housing</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 text-center border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
              Need assistance? Contact the Admin through support.
            </div>
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="card p-6">
          <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">📋 Recent Meal Logs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">Date</th>
                  <th className="text-center py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">🌅 Breakfast</th>
                  <th className="text-center py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">☀️ Lunch</th>
                  <th className="text-center py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">🌙 Dinner</th>
                  <th className="text-center py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">🍪 Snack</th>
                  <th className="text-right py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {(filteredAttendance && filteredAttendance.length > 0) ? (
                  filteredAttendance.slice(0, 5).map((record: any, i: number) => {
                    const total = [record.breakfast, record.lunch, record.dinner, record.snack].filter(Boolean).length
                    return (
                      <tr key={record.date} className="table-row-hover border-b border-slate-100 dark:border-slate-800">
                        <td className="py-3 px-2 font-medium text-slate-700 dark:text-slate-300">{formatDate(record.date)}</td>
                        {['breakfast', 'lunch', 'dinner', 'snack'].map(meal => (
                          <td key={meal} className="py-3 px-2 text-center">
                            {record[meal as keyof typeof record] ? (
                              <span className="text-emerald-500 font-bold">✓</span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-700">—</span>
                            )}
                          </td>
                        ))}
                        <td className="py-3 px-2 text-right">
                          <span className={cn('badge text-[10px]', total >= 3 ? 'badge-green' : total >= 2 ? 'badge-yellow' : 'badge-red')}>
                            {total}/4
                          </span>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No attendance records found. Start scanning QR codes at your mess to see logs!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Link to="/dashboard/student/attendance" className="btn-secondary w-full justify-center mt-4 text-sm">
            View Full History
          </Link>
        </div>
      </div>
    )
  }

  // Subscription Tab Page
  if (view === 'subscription') {
    // Load mess owner's plans dynamically from localStorage
    const getPlansForMess = (mess: typeof mockMesses[0]) => {
      // Try to find owner's saved plans in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('campusnest-mess-plans-')) {
          const messProfileKey = key.replace('campusnest-mess-plans-', 'campusnest-mess-profile-')
          const messProfile = localStorage.getItem(messProfileKey)
          if (messProfile) {
            const parsed = JSON.parse(messProfile)
            if (parsed.id === mess.id || parsed.name === mess.name) {
              const plansData = localStorage.getItem(key)
              if (plansData) {
                const ownerPlans = JSON.parse(plansData).filter((p: any) => p.active)
                if (ownerPlans.length > 0) return ownerPlans
              }
            }
          }
        }
      }
      // Fallback to mockPlans
      return mockPlans.filter(p => p.mess_id === mess.id)
    }

    const availablePlans = getPlansForMess(selectedMess)

    const activeMenu = (() => {
      if (!subscription || !subscription.mess) return null;
      const saved = localStorage.getItem(`campusnest-mess-menu-${subscription.mess.owner_id}`)
      if (saved) return JSON.parse(saved)
      return { 
        breakfast: ['Poha', 'Upma', 'Tea'], 
        lunch: ['Roti', 'Dal Tadka', 'Jeera Rice', 'Mix Veg', 'Papad'], 
        snack: ['Samosa', 'Coffee'], 
        dinner: ['Chapati', 'Paneer Masala', 'Dal Makhani', 'Rice', 'Gulab Jamun'] 
      }
    })()

    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Mess Subscriptions</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Select and purchase meal plans from verified campus messes</p>
        </div>

        {/* Current Active Plan Card */}
        {subscription && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card p-6 md:col-span-1 bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-700 text-white flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-brand-100 text-[10px] uppercase font-bold tracking-wider">Active Meal Plan</p>
                    <h3 className="text-2xl font-display font-bold">{subscription.plan.name}</h3>
                  </div>
                  <span className="bg-white/20 border border-white/30 text-white rounded-full text-[10px] px-2 py-0.5 font-bold uppercase">Active</span>
                </div>
                <p className="text-sm font-semibold text-brand-100 mb-2">📍 {subscription.mess.name}</p>
                <div className="space-y-1 mt-4">
                  <p className="text-xs text-brand-200">Start Date: <span className="text-white font-semibold">{formatDate(subscription.start_date)}</span></p>
                  <p className="text-xs text-brand-200">End Date: <span className="text-white font-semibold">{formatDate(subscription.end_date)}</span></p>
                </div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-4">
                <div className="flex justify-between text-xs mb-1 text-brand-200 font-semibold">
                  <span>Validity</span>
                  <span>{getRemainingDays(subscription.end_date)} Days Remaining</span>
                </div>
                <div className="progress-bar bg-white/20 h-2">
                  <div className="progress-fill bg-white" style={{ width: `${Math.max(0, Math.min(100, (getRemainingDays(subscription.end_date) / 30) * 100))}%` }} />
                </div>
              </div>
            </div>

            {/* Quick Info & Verification */}
            {/* Quick Info & Verification */}
            <div className="card p-6 md:col-span-1 flex flex-col justify-between border-slate-200 dark:border-slate-800">
              <div className="space-y-4">
                <h3 className="font-display font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" /> Safe Messes
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  All listed mess partners are inspected and certified. Your payment remains secure with our 24h refund guarantee.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 font-medium">Refund Policy</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">Cancel within 3 days for a full refund</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 font-medium">Flexible Scheduling</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">Mark leaves to carry forward balances</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Menu */}
            <div className="card p-6 md:col-span-1 flex flex-col border-slate-200 dark:border-slate-800">
              <h3 className="font-display font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2 mb-4">
                <Utensils className="w-5 h-5 text-brand-500" /> Today's Menu
              </h3>
              <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                {activeMenu && (['breakfast', 'lunch', 'snack', 'dinner'] as const).map(meal => {
                  if (!activeMenu[meal] || activeMenu[meal].length === 0) return null;
                  return (
                    <div key={meal}>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{meal}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {activeMenu[meal].map((item: string, i: number) => (
                          <span key={i} className="badge bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
                {(!activeMenu || !['breakfast', 'lunch', 'snack', 'dinner'].some(m => activeMenu[m]?.length > 0)) && (
                  <div className="text-slate-400 text-xs italic">Menu not updated by owner for today.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Subscription History Section */}
        {subscriptionHistory.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-500" /> Subscription History
            </h3>
            
            <div className="grid gap-4">
              {subscriptionHistory.map((sub, idx) => (
                <div key={idx} className="card p-5 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">{sub.plan.name}</h4>
                      <span className="badge bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] uppercase">{sub.status || 'expired'}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">📍 {sub.mess.name}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDate(sub.start_date)} to {formatDate(sub.end_date)}
                    </p>
                  </div>
                  <div className="text-right w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between">
                    <p className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">{formatCurrency(sub.amount_paid)}</p>
                    <button onClick={() => alert(`Downloading receipt for ${sub.plan.name} at ${sub.mess.name} (${formatCurrency(sub.amount_paid)})`)} className="btn-secondary py-1.5 px-3 text-[10px] flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5" /> Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subscribe / Purchase Section */}
        <div className="space-y-4 pt-8 border-t border-slate-200 dark:border-slate-800 mt-8">
          <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-500" /> Purchase New Subscription
          </h3>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Mess Selector */}
            <div className="card p-6 space-y-4 lg:col-span-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Step 1: Choose Mess</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search mess by name..."
                  value={messSearchQuery}
                  onChange={e => setMessSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1 pb-1">
                {(() => {
                  const filtered = allMesses.filter(m => m.name.toLowerCase().includes(messSearchQuery.toLowerCase()))
                  const displayed = showAllMesses ? filtered : filtered.slice(0, 5)
                  return (
                    <>
                      {displayed.map(mess => (
                        <button
                          key={mess.id}
                          onClick={() => { setSelectedMess(mess) }}
                          className={cn(
                            'w-full p-3.5 rounded-2xl border text-left transition-all',
                            selectedMess.id === mess.id
                              ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          )}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-800 dark:text-white text-sm">{mess.name}</span>
                            <span className="badge bg-amber-50 text-amber-700 text-[9px] font-bold flex-shrink-0">★ {mess.rating || 'New'}</span>
                          </div>
                          <p className="text-slate-500 text-[11px] mt-1.5 line-clamp-1">{mess.address}</p>
                          <p className="text-brand-600 dark:text-brand-400 font-bold text-xs mt-2">Starts from {formatCurrency(mess.monthly_charge)}/mo</p>
                        </button>
                      ))}
                      {!showAllMesses && filtered.length > 5 && (
                        <button
                          onClick={() => setShowAllMesses(true)}
                          className="w-full py-2.5 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/20 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors"
                        >
                          View All {filtered.length} Messes
                        </button>
                      )}
                      {filtered.length === 0 && (
                        <div className="text-center py-4 text-slate-500 text-xs">
                          No messes found matching "{messSearchQuery}"
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>

            {/* Plan Selector */}
            <div className="card p-6 space-y-4 lg:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Step 2: Choose Meal Plan</label>
              {availablePlans.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm space-y-2">
                  <div className="text-3xl">📋</div>
                  <p>No active plans available for this mess yet.</p>
                  <p className="text-xs">The owner hasn't created subscription plans. Please check back later or contact the mess directly.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {availablePlans.map((plan: any) => (
                    <button
                      key={plan.id}
                      onClick={() => { setSelectedPlan(plan) }}
                      className={cn(
                        'p-4 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-48',
                        selectedPlan.id === plan.id
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 ring-1 ring-brand-500'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                      )}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-800 dark:text-white text-sm">{plan.name}</span>
                          <span className="badge badge-purple text-[9px] font-semibold">{plan.duration_days} Days</span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-2 leading-relaxed">{plan.description}</p>
                        
                        <div className="flex flex-wrap gap-1 mt-3">
                          {(plan.meal_types || []).map((m: string) => (
                            <span key={m} className="badge bg-slate-100 dark:bg-slate-800 text-[9px] capitalize">{m}</span>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                        <span className="text-lg font-extrabold text-slate-900 dark:text-white">{formatCurrency(plan.price)}</span>
                        <span className="text-[10px] text-brand-600 font-bold">Select Plan</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-500">Selected: <span className="font-bold text-slate-700 dark:text-white">{selectedMess.name} — {selectedPlan.name}</span></p>
                  <p className="text-xs text-slate-500 mt-0.5">Total Amount: <span className="font-extrabold text-slate-900 dark:text-white text-sm">{formatCurrency(selectedPlan.price)}</span></p>
                </div>
                <button onClick={() => { setPaymentStep('details'); setShowCheckout(true) }} className="btn-primary flex items-center gap-2 py-2 px-6">
                  Proceed to Payment <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Modal */}
        <AnimatePresence>
          {showCheckout && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCheckout(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.95, y: 15, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 15, opacity: 0 }}
                className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-glass overflow-hidden z-10 p-6 space-y-5">
                
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-500" /> Checkout & Payment
                  </h3>
                  <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
                </div>

                {paymentStep === 'details' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-850">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Order Summary</p>
                      <h4 className="font-bold text-slate-800 dark:text-white mt-1 text-sm">{selectedPlan.name}</h4>
                      <p className="text-xs text-slate-500">{selectedMess.name}</p>
                      <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 mt-3 pt-2 text-xs">
                        <span className="text-slate-500">Validity:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedPlan.duration_days} Days</span>
                      </div>
                      <div className="flex justify-between mt-1 text-xs">
                        <span className="text-slate-500">Subtotal:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(selectedPlan.price)}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Select Payment Method</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentMethod('upi')}
                          className={cn(
                            'p-3 rounded-2xl border text-xs font-bold text-center transition-all',
                            selectedPaymentMethod === 'upi'
                              ? 'border-brand-500 bg-brand-50/30 text-brand-700 dark:text-brand-400 dark:bg-brand-950/20'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                          )}
                        >
                          📲 UPI (QR Code)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentMethod('card')}
                          className={cn(
                            'p-3 rounded-2xl border text-xs font-bold text-center transition-all',
                            selectedPaymentMethod === 'card'
                              ? 'border-brand-500 bg-brand-50/30 text-brand-700 dark:text-brand-400 dark:bg-brand-950/20'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                          )}
                        >
                          💳 Credit / Debit Card
                        </button>
                      </div>
                    </div>

                    <button onClick={handlePurchaseClick} className="btn-primary w-full justify-center py-3 text-sm mt-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" /> Pay {formatCurrency(selectedPlan.price)} Now
                    </button>
                  </div>
                )}

                {paymentStep === 'upi_qr' && (
                  <div className="text-center py-6 space-y-5">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-lg">Scan to Pay</h4>
                      <p className="text-xs text-slate-500 mt-1">Open GPay, PhonePe, or Paytm and scan this code</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-2xl inline-block border-2 border-slate-100 shadow-sm mx-auto">
                      {checkoutQRUrl ? (
                        <img src={checkoutQRUrl} alt="UPI Payment QR" className="w-48 h-48" />
                      ) : (
                        <div className="w-48 h-48 flex items-center justify-center bg-slate-50 text-slate-400">Loading...</div>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-slate-500">Amount to Pay</p>
                      <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatCurrency(selectedPlan.price)}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                      <button onClick={() => setPaymentStep('details')} className="btn-secondary flex-1">
                        Back
                      </button>
                      <button onClick={processPurchase} className="btn-primary flex-1">
                        I Have Paid
                      </button>
                    </div>
                  </div>
                )}

                {paymentStep === 'paying' && (
                  <div className="text-center py-12 space-y-4">
                    <div className="inline-block w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-base">Processing Payment...</h4>
                      <p className="text-xs text-slate-500 mt-1">Please do not refresh the page or click back.</p>
                    </div>
                  </div>
                )}

                {paymentStep === 'success' && (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto shadow-md">✓</div>
                    <div>
                      <h4 className="font-bold text-emerald-600 text-lg">Subscription Activated!</h4>
                      <p className="text-xs text-slate-500 mt-1">Your meal plan is active. You can now scan at the mess counter.</p>
                    </div>
                    <div className="flex gap-3 justify-center mt-3">
                      <button onClick={handleDownloadReceipt} className="btn-secondary py-2 px-4 text-xs flex items-center gap-1.5">
                        <Download className="w-4 h-4" /> Download Receipt
                      </button>
                      <button onClick={() => setShowCheckout(false)} className="btn-primary py-2 px-6 text-xs">
                        Go to Dashboard
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Attendance Tab Page
  if (view === 'attendance') {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const monthName = now.toLocaleString('default', { month: 'long' })

    // Generate dates for current month to render calendar grid
    const daysInMonth = Array.from({ length: daysInCurrentMonth }, (_, i) => {
      const dayNum = i + 1
      const monthStr = (currentMonth + 1).toString().padStart(2, '0')
      const dayStr = dayNum.toString().padStart(2, '0')
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`
      
      // Find if we have attendance data for this day
      const record = attendance.find((d: any) => d.date === dateStr)
      let status: 'attended' | 'missed' | 'none' = 'none'
      
      let isWithinPlan = false
      if (subscription && subscription.start_date) {
        const dateObj = new Date(dateStr)
        const startObj = new Date(subscription.start_date)
        const endObj = new Date(subscription.end_date)
        if (dateObj >= startObj && dateObj <= endObj && dateObj <= now) {
          isWithinPlan = true
        }
      }

      if (record) {
        const totalMealsOnDay = [record.breakfast, record.lunch, record.dinner, record.snack].filter(Boolean).length
        status = totalMealsOnDay > 0 ? 'attended' : 'missed'
      } else if (isWithinPlan) {
        const dateObj = new Date(dateStr)
        if (dateObj < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
            status = 'missed'
        }
      }
      
      return { dayNum, dateStr, status }
    })

    const handleExport = () => {
      alert('Simulating PDF Export... Your official attendance certificate has been downloaded!')
    }

    const handleReset = () => {
      if (confirm('Are you sure you want to reset all your attendance logs? This action cannot be undone.')) {
        setAttendance([])
        localStorage.removeItem('campusnest-student-attendance')
      }
    }

    const totalMeals = filteredAttendance.reduce((acc: number, d: any) => {
      return acc + [d.breakfast, d.lunch, d.dinner, d.snack].filter(Boolean).length
    }, 0)

    let daysSinceSignup = 0
    let attendanceRate = 0
    if (subscription && subscription.start_date) {
      const start = new Date(subscription.start_date)
      daysSinceSignup = Math.floor((now.getTime() - start.getTime()) / (1000 * 3600 * 24))
      if (daysSinceSignup < 0) daysSinceSignup = 0
      
      const expectedMeals = daysSinceSignup * (subscription.plan.meal_types?.length || 3)
      if (expectedMeals > 0) {
        attendanceRate = Math.min(100, Math.round((totalMeals / expectedMeals) * 100))
      }
    }

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Meal Attendance Log</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track your scanned meals, calendar attendance rate, and report exports</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleReset} className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-4 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/20">
              <X className="w-4 h-4" /> Reset Logs
            </button>
            <button onClick={handleExport} className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-4">
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-5">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalMeals}</div>
            <div className="text-xs text-slate-500 mt-1">Scanned Meals This Month</div>
          </div>
          <div className="card p-5">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{attendanceRate}%</div>
            <div className="text-xs text-slate-500 mt-1">Attendance rate</div>
          </div>
          <div className="card p-5">
            <div className="text-2xl font-extrabold text-emerald-600">0</div>
            <div className="text-xs text-slate-500 mt-1">Leaves Registered</div>
          </div>
          <div className="card p-5">
            <div className="text-2xl font-extrabold text-brand-500">{daysSinceSignup}</div>
            <div className="text-xs text-slate-500 mt-1">Days since signup</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar Check Grid */}
          <div className="card p-6 lg:col-span-2">
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-brand-500" /> Attendance Calendar ({monthName} {currentYear})
            </h3>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2.5 max-w-md">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase py-1">{day}</div>
              ))}
              {daysInMonth.map(day => (
                <div
                  key={day.dayNum}
                  className={cn(
                    'w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all relative border border-slate-100 dark:border-slate-800/40',
                    day.status === 'attended' && 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 border-emerald-500',
                    day.status === 'missed' && 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                    day.status === 'none' && 'bg-slate-50 text-slate-400 dark:bg-slate-900/20 dark:text-slate-600'
                  )}
                >
                  {day.dayNum}
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-md bg-emerald-500 border border-emerald-600" />
                <span className="text-slate-600 dark:text-slate-400">Checked In</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-md bg-slate-200 dark:bg-slate-800" />
                <span className="text-slate-600 dark:text-slate-400">Missed / Skipped</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-md bg-slate-50 dark:bg-slate-900/20" />
                <span className="text-slate-600 dark:text-slate-400">No Plan Active</span>
              </div>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="card p-6 flex flex-col justify-between border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-display font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                📢 Rules & Curfew info
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed space-y-2">
                1. Students must scan their QR code within the specified meal window.<br />
                - Breakfast: 8:00 AM - 10:00 AM<br />
                - Lunch: 12:30 PM - 2:30 PM<br />
                - Snack: 5:00 PM - 6:00 PM<br />
                - Dinner: 8:00 PM - 10:00 PM<br /><br />
                2. If you are traveling, report a leave 12 hours in advance to extend your active subscription plan.
              </p>
            </div>
            <Link to="/dashboard/student/scan" className="btn-primary w-full justify-center gap-2 text-xs py-2.5 mt-4">
              <QrCode className="w-4 h-4" /> Scan QR Now
            </Link>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="card p-6">
          <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">📋 Full Attendance Log</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">Date</th>
                  <th className="text-center py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">🌅 Breakfast</th>
                  <th className="text-center py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">☀️ Lunch</th>
                  <th className="text-center py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">🌙 Dinner</th>
                  <th className="text-center py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">🍪 Snack</th>
                  <th className="text-right py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {(filteredAttendance && filteredAttendance.length > 0) ? (
                  filteredAttendance.map((record: any, i: number) => {
                    const total = [record.breakfast, record.lunch, record.dinner, record.snack].filter(Boolean).length
                    return (
                      <tr key={record.date} className="table-row-hover border-b border-slate-100 dark:border-slate-800">
                        <td className="py-3 px-2 font-medium text-slate-700 dark:text-slate-300">{formatDate(record.date)}</td>
                        {['breakfast', 'lunch', 'dinner', 'snack'].map(meal => (
                          <td key={meal} className="py-3 px-2 text-center">
                            {record[meal as keyof typeof record] ? (
                              <span className="text-emerald-500 font-bold">✓</span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-700">—</span>
                            )}
                          </td>
                        ))}
                        <td className="py-3 px-2 text-right">
                          <span className={cn('badge text-[10px]', total >= 3 ? 'badge-green' : total >= 2 ? 'badge-yellow' : 'badge-red')}>
                            {total}/4
                          </span>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No attendance records found for your current subscription.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return null
}
