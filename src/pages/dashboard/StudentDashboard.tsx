import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BarChart2, TrendingUp, CreditCard, Calendar, QrCode, Download, ArrowUpRight, Search, Utensils } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import { cn, formatCurrency, formatDate, getRemainingDays } from '../../lib/utils'


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
  remaining_days?: number
  total_meals?: number
  plan_name?: string
  plan_description?: string
}

type AttendanceRow = {
  id: string
  date: string
  breakfast: boolean
  lunch: boolean
  dinner: boolean
  snack: boolean
  mess_id?: string | null
}

type MessRow = {
  id: string
  name: string
  owner_id: string
  monthly_charge: number
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

type MenuRow = {
  breakfast: string[] | null
  lunch: string[] | null
  dinner: string[] | null
  snack: string[] | null
}

const emptyMenu = { breakfast: [], lunch: [], dinner: [], snack: [] }

export default function StudentDashboard() {
  const { profile } = useAuthStore()
  const location = useLocation()

  const [messes, setMesses] = useState<MessRow[]>([])
  const [plans, setPlans] = useState<PlanRow[]>([])
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null)
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionRow[]>([])
  const [attendance, setAttendance] = useState<AttendanceRow[]>([])
  const [menu, setMenu] = useState<MenuRow | null>(null)
  const [selectedMess, setSelectedMess] = useState<MessRow | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<PlanRow | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi')
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'qr' | 'paying' | 'success'>('details')
  const [checkoutQRUrl, setCheckoutQRUrl] = useState('')

  const view = location.pathname.endsWith('/subscription') ? 'subscription' : location.pathname.endsWith('/attendance') ? 'attendance' : 'overview'

  useEffect(() => {
    const load = async () => {
      if (!profile) return

      const [messesResult, subscriptionsResult, attendanceResult] = await Promise.all([
        supabase.from('messes').select('id, name, owner_id, monthly_charge').order('created_at', { ascending: false }),
        supabase.from('student_subscriptions').select('*').eq('student_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('student_attendance').select('*').eq('student_id', profile.id).order('date', { ascending: false }),
      ])

      const messRows = (messesResult.data || []) as MessRow[]
      const subscriptionRows = (subscriptionsResult.data || []) as SubscriptionRow[]
      const attendanceRows = (attendanceResult.data || []) as AttendanceRow[]

      setMesses(messRows)
      setAttendance(attendanceRows)

      const active = subscriptionRows.find((row) => row.status === 'active' && (row.remaining_days === undefined || row.remaining_days === null || row.remaining_days > 0)) || null
      setSubscription(active)
      setSubscriptionHistory(subscriptionRows.filter((row) => row.id !== active?.id))
      setSelectedMess(active ? messRows.find((mess) => mess.id === active.mess_id) || messRows[0] || null : messRows[0] || null)
    }

    void load()
  }, [profile])

  useEffect(() => {
    const loadPlansAndMenu = async () => {
      if (!selectedMess) return
      const [plansResult, menuResult] = await Promise.all([
        supabase.from('mess_plans').select('*').eq('mess_id', selectedMess.id).eq('active', true).order('price', { ascending: true }),
        supabase.from('mess_menus').select('breakfast, lunch, dinner, snack').eq('owner_id', selectedMess.owner_id).order('date', { ascending: false }).limit(1),
      ])
      const planRows = (plansResult.data || []) as PlanRow[]
      setPlans(planRows)
      
      let initialPlan = planRows[0] || null
      if (subscription && subscription.mess_id === selectedMess.id) {
        const activePlan = planRows.find(p => p.id === subscription.plan_id)
        if (activePlan) initialPlan = activePlan
      }
      
      setSelectedPlan(initialPlan)
      setMenu((menuResult.data || [])[0] || null)
    }

    void loadPlansAndMenu()
  }, [selectedMess, subscription])

  const filteredAttendance = useMemo(() => {
    if (!subscription) return attendance
    return attendance.filter((row) => new Date(row.date) >= new Date(subscription.start_date))
  }, [attendance, subscription])

  const totalMeals = filteredAttendance.reduce((acc, row) => acc + [row.breakfast, row.lunch, row.dinner, row.snack].filter(Boolean).length, 0)
  const remaining = subscription ? getRemainingDays(subscription.end_date) : 0

  const weeklyData = useMemo(() => {
    const buckets = Array.from({ length: 4 }, (_, index) => ({ week: `Week ${index + 1}`, meals: 0 }))
    const now = new Date()
    filteredAttendance.forEach((row) => {
      const recordDate = new Date(row.date)
      const diffDays = Math.floor((now.getTime() - recordDate.getTime()) / (24 * 60 * 60 * 1000))
      const bucketIndex = diffDays < 7 ? 3 : diffDays < 14 ? 2 : diffDays < 21 ? 1 : 0
      buckets[bucketIndex].meals += [row.breakfast, row.lunch, row.dinner, row.snack].filter(Boolean).length
    })
    return buckets
  }, [filteredAttendance])

  const spendingData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map((month, index) => ({ month, amount: subscription && index >= 3 ? subscription.amount_paid : 0 }))
  }, [subscription])

  const handlePurchase = async () => {
    if (!profile || !selectedMess || !selectedPlan) return

    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + selectedPlan.duration_days)

    if (paymentMethod === 'upi') {
      const { data: settings } = await supabase.from('mess_payment_settings').select('*').eq('owner_id', selectedMess.owner_id).maybeSingle()
      if (!settings?.upi_id) {
        alert('This mess has not configured UPI payments yet.')
        return
      }

      const QRCode = (await import('qrcode')).default
      const url = await QRCode.toDataURL(`upi://pay?pa=${settings.upi_id}&pn=${encodeURIComponent(selectedMess.name)}&am=${selectedPlan.price}&cu=INR`)
      setCheckoutQRUrl(url)
      setCheckoutStep('qr')
      return
    }

    setCheckoutStep('paying')
    const { error } = await supabase.from('student_subscriptions').insert({
      id: `sub-${Date.now()}`,
      student_id: profile.id,
      mess_id: selectedMess.id,
      plan_id: selectedPlan.id,
      status: 'active',
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      amount_paid: selectedPlan.price,
      payment_status: 'paid',
    })

    if (error) {
      console.error('Failed to create subscription:', error)
      setCheckoutStep('details')
      return
    }

    setCheckoutStep('success')
  }

  const stats = [
    { label: 'Active Plan', value: subscription ? selectedPlan?.name || 'Active' : 'No Plan', icon: '💳', sub: subscription ? `${remaining} days left` : 'Subscribe now' },
    { label: 'Meals This Month', value: totalMeals, icon: '🍽️', sub: subscription ? `${subscriptionHistory.length + 1} subscription record(s)` : 'No data' },
    { label: 'Amount Paid', value: subscription ? formatCurrency(subscription.amount_paid) : '₹0', icon: '💰', sub: 'This period' },
    { label: 'Days Remaining', value: remaining, icon: '📅', sub: subscription ? 'Current plan' : '-' },
  ]

  if (view === 'overview') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Good morning, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Your campus life at a glance</p>
          </div>
          <Link to="/dashboard/student/scan" className="btn-primary gap-2"><QrCode className="w-4 h-4" /> Scan QR</Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="card p-5">
              <div className="text-2xl mb-3">{stat.icon}</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
              <div className="text-[11px] text-slate-400 mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card p-6">
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-brand-500" /> Active Subscription</h3>
            {subscription ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                  <p className="text-brand-200 text-xs">Current Plan</p>
                  <p className="font-bold text-lg">{selectedPlan?.name || 'Active Plan'}</p>
                  <p className="text-brand-200 text-xs mt-1">{selectedMess?.name || 'Mess'}</p>
                  <div className="mt-3 progress-bar bg-white/20"><div className="progress-fill bg-white" style={{ width: `${Math.max(0, Math.min(100, (remaining / 30) * 100))}%` }} /></div>
                </div>
                <button onClick={() => alert(`Generating receipt for ${formatCurrency(subscription.amount_paid)}...`)} className="btn-secondary w-full justify-center text-xs flex items-center gap-1.5"><Download className="w-4 h-4" /> Receipt</button>
              </div>
            ) : <p className="text-slate-500 text-sm">You don't have an active subscription.</p>}
          </div>

          <div className="card p-6">
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-brand-500" /> Today's Meals</h3>
            <div className="space-y-3">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((meal) => {
                const todayStr = new Date().toISOString().split('T')[0]
                const today = attendance.find((row) => row.date === todayStr)
                const attended = Boolean(today?.[meal])
                return (
                  <div key={meal} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2"><span>{meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : meal === 'dinner' ? '🌙' : '🍪'}</span><span className="text-sm font-medium capitalize">{meal}</span></div>
                    {attended ? <span className="badge badge-green text-[10px]">✓ Done</span> : <Link to="/dashboard/student/scan" className="badge badge-purple text-[10px]">Scan QR</Link>}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-brand-500" /> Meals This Month</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyData}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="week" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="meals" fill="#6366f1" radius={[6, 6, 0, 0]} /></BarChart>
            </ResponsiveContainer>
            <div className="mt-3 flex justify-between text-xs text-slate-500"><span>Total: {totalMeals} meals</span><span>Avg: {(totalMeals / 4 || 0).toFixed(1)}/week</span></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card p-6 lg:col-span-2"><h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-brand-500" /> Monthly Spending</h3><ResponsiveContainer width="100%" height={200}><LineChart data={spendingData}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip formatter={(v) => [`₹${v}`, 'Spent']} /><Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} /></LineChart></ResponsiveContainer></div>
          <div className="card p-6"><h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">⚡ Quick Links</h3><div className="space-y-3"><Link to="/roommates" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"><span className="text-xs font-semibold text-slate-700 dark:text-slate-300">👥 Match Roommates</span><ArrowUpRight className="w-4 h-4 text-slate-400" /></Link><Link to="/community" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"><span className="text-xs font-semibold text-slate-700 dark:text-slate-300">📢 Campus Board</span><ArrowUpRight className="w-4 h-4 text-slate-400" /></Link></div></div>
        </div>

        <div className="card p-6"><h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">📋 Recent Meal Logs</h3><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-200 dark:border-slate-700"><th className="text-left py-3 px-2">Date</th><th className="text-center py-3 px-2">🌅 Breakfast</th><th className="text-center py-3 px-2">☀️ Lunch</th><th className="text-center py-3 px-2">🌙 Dinner</th><th className="text-center py-3 px-2">🍪 Snack</th></tr></thead><tbody>{filteredAttendance.slice(0, 5).map((row) => (<tr key={row.id} className="border-b border-slate-100 dark:border-slate-800"><td className="py-3 px-2 font-medium">{formatDate(row.date)}</td><td className="py-3 px-2 text-center">{row.breakfast ? '✓' : '—'}</td><td className="py-3 px-2 text-center">{row.lunch ? '✓' : '—'}</td><td className="py-3 px-2 text-center">{row.dinner ? '✓' : '—'}</td><td className="py-3 px-2 text-center">{row.snack ? '✓' : '—'}</td></tr>))}</tbody></table></div></div>
      </div>
    )
  }

  if (view === 'subscription') {
    const activeMenu = menu || emptyMenu

    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Mess Subscriptions</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">View your active meal plan and today's menu.</p>
        </div>

        {subscription ? (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card p-6 md:col-span-1 bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-700 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Utensils className="w-24 h-24" /></div>
              <p className="text-brand-100 text-[10px] uppercase font-bold tracking-wider">Active Meal Plan</p>
              <h3 className="text-2xl font-display font-bold mt-1">{subscription.plan_name || selectedPlan?.name || 'Active Plan'}</h3>
              <p className="text-sm font-semibold text-brand-100 mt-2 flex items-center gap-1">📍 {selectedMess?.name}</p>
              
              <div className="mt-6 bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20">
                <p className="text-xs text-brand-100 uppercase tracking-wider mb-1 font-bold">Meals Left</p>
                <div className="text-3xl font-black">{subscription.remaining_days ?? remaining}</div>
              </div>

              <div className="mt-4 text-xs text-brand-100 space-y-1"><p>Start Date: {formatDate(subscription.start_date)}</p><p>End Date: {formatDate(subscription.end_date)}</p></div>
            </div>
            <div className="card p-6 md:col-span-2"><h3 className="font-display font-bold mb-3">Today's Menu</h3>{(Object.keys(activeMenu) as (keyof MenuRow)[]).map((meal) => activeMenu[meal]?.length ? (<div key={meal} className="mb-3"><p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{meal}</p><div className="flex flex-wrap gap-1.5">{activeMenu[meal]?.map((item, i) => <span key={i} className="badge bg-slate-50 text-slate-600 text-[10px]">{item}</span>)}</div></div>) : null)}</div>
          </div>
        ) : (
          <div className="card p-12 text-center border-dashed border-2 border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Active Subscription</h3>
            <p className="text-slate-500 dark:text-slate-400">You don't have an active meal plan right now. Mess owners can allocate a plan to you.</p>
          </div>
        )}

        {subscriptionHistory.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-display font-bold text-lg mb-4">Previous Plans</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subscriptionHistory.map((sub) => (
                <div key={sub.id} className="card p-4 opacity-80 hover:opacity-100 transition-opacity">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm">{sub.plan_name || 'Legacy Plan'}</h4>
                    <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px] uppercase">{sub.status}</span>
                  </div>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>Paid: {formatCurrency(sub.amount_paid)}</p>
                    <p>Ended: {formatDate(sub.end_date)}</p>
                    {sub.total_meals && <p>Total Meals: {sub.total_meals}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (view === 'attendance') {
    const now = new Date()
    const monthName = now.toLocaleString('default', { month: 'long' })
    const currentYear = now.getFullYear()
    const daysInMonthCount = new Date(currentYear, now.getMonth() + 1, 0).getDate()
    const daysInMonth = Array.from({ length: daysInMonthCount }, (_, index) => {
      const day = index + 1
      const dateStr = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const record = attendance.find((row) => row.date === dateStr)
      return { day, status: record ? ([record.breakfast, record.lunch, record.dinner, record.snack].some(Boolean) ? 'attended' : 'missed') : 'none' }
    })

    return (
      <div className="p-6 space-y-6">
        <div><h1 className="text-2xl font-display font-bold">Meal Attendance Log</h1><p className="text-slate-500 text-sm mt-1">Attendance rows are loaded from the database.</p></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><div className="card p-5"><div className="text-2xl font-extrabold">{totalMeals}</div><div className="text-xs text-slate-500 mt-1">Scanned Meals</div></div><div className="card p-5"><div className="text-2xl font-extrabold">{subscription ? Math.min(100, Math.round((totalMeals / Math.max(1, filteredAttendance.length * 3)) * 100)) : 0}%</div><div className="text-xs text-slate-500 mt-1">Attendance rate</div></div><div className="card p-5"><div className="text-2xl font-extrabold text-brand-500">{remaining}</div><div className="text-xs text-slate-500 mt-1">Days remaining</div></div><div className="card p-5"><div className="text-2xl font-extrabold text-emerald-600">{subscriptionHistory.length}</div><div className="text-xs text-slate-500 mt-1">Past subscriptions</div></div></div>
        <div className="card p-6"><h3 className="font-display font-bold mb-4">Attendance Calendar ({monthName} {currentYear})</h3><div className="grid grid-cols-7 gap-2 max-w-md">{daysInMonth.map((day) => (<div key={day.day} className={cn('aspect-square rounded-xl flex items-center justify-center text-xs font-bold', day.status === 'attended' ? 'bg-emerald-500 text-white' : day.status === 'missed' ? 'bg-slate-200 text-slate-500' : 'bg-slate-50 text-slate-400')}>{day.day}</div>))}</div></div>
      </div>
    )
  }

  return null
}
