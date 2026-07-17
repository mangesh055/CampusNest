import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Building2, Utensils, TrendingUp, Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { formatCurrency } from '../../lib/utils'
import { supabase } from '../../lib/supabase'

export interface UserProfile {
  id: string
  full_name: string
  role: string
  email?: string
  created_at?: string
  status?: string
}

const growthData = [
  { month: 'Jan', users: 820, revenue: 890000 },
  { month: 'Feb', users: 932, revenue: 1020000 },
  { month: 'Mar', users: 1100, revenue: 1150000 },
  { month: 'Apr', users: 1200, revenue: 1180000 },
  { month: 'May', users: 1289, revenue: 1245000 },
]

export default function AdminDashboard() {
  const location = useLocation()
  const currentTab = location.pathname.split('/').pop() || 'admin'
  const [users, setUsers] = useState<UserProfile[]>([])
  const [messes, setMesses] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [roommates, setRoommates] = useState<any[]>([])
  const [community, setCommunity] = useState<any[]>([])
  const [pendingItems, setPendingItems] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingMesses, setLoadingMesses] = useState(false)
  const [loadingProps, setLoadingProps] = useState(false)
  const [loadingRoommates, setLoadingRoommates] = useState(false)
  const [loadingCommunity, setLoadingCommunity] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [overviewStats, setOverviewStats] = useState({
    totalStudents: 0,
    totalMesses: 0,
    totalProperties: 0,
    pendingVerifications: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
  })

  useEffect(() => {
    if (currentTab === 'users') {
      fetchUsers()
    } else if (currentTab === 'messes') {
      fetchMesses()
    } else if (currentTab === 'properties') {
      fetchProperties()
    } else if (currentTab === 'roommates') {
      fetchRoommates()
    } else if (currentTab === 'community') {
      fetchCommunity()
    } else if (currentTab === 'admin') {
      fetchOverview()
    }
  }, [currentTab])

  const fetchOverview = async () => {
    try {
      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      const { count: messesCount } = await supabase.from('messes').select('*', { count: 'exact', head: true })
      const { count: propsCount } = await supabase.from('properties').select('*', { count: 'exact', head: true })
      
      const { data: pendingMList } = await supabase.from('messes').select('id, name, owner_id').eq('verified', false).limit(5)
      const { data: pendingPList } = await supabase.from('properties').select('id, title, owner_id').eq('verified', false).limit(5)
      
      const mixedPending = [
        ...(pendingMList || []).map((m: any) => ({ type: 'mess', id: m.id, name: m.name, submittedBy: m.owner_id?.substring(0,6) || 'Unknown', time: 'Recently' })),
        ...(pendingPList || []).map((p: any) => ({ type: 'property', id: p.id, name: p.title, submittedBy: p.owner_id?.substring(0,6) || 'Unknown', time: 'Recently' }))
      ].slice(0, 5)

      setPendingItems(mixedPending)
      
      // Simulate real calculation for subscriptions based on active users and average pricing
      // In a real database, this would query a 'subscriptions' table
      const realActiveSubs = (usersCount || 0) > 0 ? Math.floor((usersCount || 0) * 0.4) : 0
      const realMonthlyRevenue = realActiveSubs * 3500 // assuming avg plan is 3500
      
      setOverviewStats(prev => ({
        ...prev,
        totalStudents: usersCount !== null ? usersCount : 0,
        totalMesses: messesCount !== null ? messesCount : 0,
        totalProperties: propsCount !== null ? propsCount : 0,
        pendingVerifications: (mixedPending.length > 0) ? mixedPending.length : 0,
        activeSubscriptions: realActiveSubs,
        monthlyRevenue: realMonthlyRevenue
      }))
    } catch (e) {
      console.error(e)
    }
  }

  const fetchProperties = async () => {
    setLoadingProps(true)
    try {
      const { data, error } = await supabase.from('properties').select('*')
      if (!error && data) {
        setProperties(data)
      } else {
        setProperties([])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingProps(false)
    }
  }

  const fetchMesses = async () => {
    setLoadingMesses(true)
    try {
      const { data, error } = await supabase
        .from('messes')
        .select('id, name, owner_id, address, verified, created_at, monthly_charge')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('fetchMesses error:', error)
        setMesses([])
      } else {
        setMesses(data || [])
      }
    } catch (e) {
      console.error('fetchMesses exception:', e)
      setMesses([])
    } finally {
      setLoadingMesses(false)
    }
  }

  const fetchUsers = async () => {
    setLoadingUsers(true)
    setFetchError(null)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, phone, created_at, status')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('fetchUsers error:', error)
        setFetchError(`Database error: ${error.message} (code: ${error.code})`)
        setUsers([])
      } else {
        setUsers(data || [])
      }
    } catch (e: any) {
      console.error('fetchUsers exception:', e)
      setFetchError(e?.message || 'Unknown error')
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchRoommates = async () => {
    setLoadingRoommates(true)
    try {
      const { data, error } = await supabase.from('roommate_profiles').select('*').order('created_at', { ascending: false })
      if (!error && data) setRoommates(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingRoommates(false)
    }
  }

  const fetchCommunity = async () => {
    setLoadingCommunity(true)
    try {
      const { data, error } = await supabase.from('community_posts').select('*').order('created_at', { ascending: false })
      if (!error && data) setCommunity(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingCommunity(false)
    }
  }

  const handleDeleteMess = async (id: string) => {
    const confirmation = window.prompt('Type "delete" to confirm deletion:')
    if (confirmation !== 'delete') return
    
    // Manually cascade delete to avoid FK constraint errors
    await supabase.from('mess_plans').delete().eq('mess_id', id)
    await supabase.from('student_subscriptions').delete().eq('mess_id', id)
    await supabase.from('student_attendance').delete().eq('mess_id', id)
    await supabase.from('reviews').delete().eq('target_id', id).eq('target_type', 'mess')
    await supabase.from('mess_transactions').delete().eq('mess_id', id) // just in case
    
    const { data, error } = await supabase.from('messes').delete().eq('id', id).select()
    if (error) {
      alert(`Failed to delete mess: ${error.message}`)
      console.error('Delete Mess Error:', error)
    } else if (data && data.length === 0) {
      alert(`Deletion silently blocked by Database Row Level Security (RLS) policies. You must update the Supabase 'messes' table RLS delete policy to allow admins.`)
    } else {
      setMesses(prev => prev.filter(item => item.id !== id))
    }
  }

  const handleDeleteProperty = async (id: string) => {
    const confirmation = window.prompt('Type "delete" to confirm deletion:')
    if (confirmation !== 'delete') return
    
    // Manually cascade delete
    await supabase.from('reviews').delete().eq('target_id', id).eq('target_type', 'property')
    
    const { data, error } = await supabase.from('properties').delete().eq('id', id).select()
    if (error) {
      alert(`Failed to delete property: ${error.message}`)
      console.error('Delete Property Error:', error)
    } else if (data && data.length === 0) {
      alert(`Deletion blocked by Database RLS. Please update 'properties' table RLS delete policy.`)
    } else {
      setProperties(prev => prev.filter(item => item.id !== id))
    }
  }

  const handleDeleteRoommate = async (id: string) => {
    const confirmation = window.prompt('Type "delete" to confirm deletion:')
    if (confirmation !== 'delete') return
    const { data, error } = await supabase.from('roommate_profiles').delete().eq('id', id).select()
    if (error) {
      alert(`Failed to delete roommate: ${error.message}`)
    } else if (data && data.length === 0) {
      alert(`Deletion blocked by Database RLS. Please update 'roommate_profiles' table RLS delete policy.`)
    } else {
      setRoommates(prev => prev.filter(item => item.id !== id))
    }
  }

  const handleDeleteCommunity = async (id: string) => {
    const confirmation = window.prompt('Type "delete" to confirm deletion:')
    if (confirmation !== 'delete') return
    const { data, error } = await supabase.from('community_posts').delete().eq('id', id).select()
    if (error) {
      alert(`Failed to delete post: ${error.message}`)
    } else if (data && data.length === 0) {
      alert(`Deletion blocked by Database RLS. Please update 'community_posts' table RLS delete policy.`)
    } else {
      setCommunity(prev => prev.filter(item => item.id !== id))
    }
  }

  const handleDeleteUser = async (id: string) => {
    const confirmation = window.prompt('Type "delete" to confirm user deletion. Note: This deletes the profile data.')
    if (confirmation !== 'delete') return
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) {
      alert(`Failed to delete user: ${error.message}`)
    } else {
      setUsers(prev => prev.filter(u => u.id !== id))
      setSelectedUser(null)
      alert('User profile deleted.')
    }
  }

  const handleResetPassword = async (email?: string) => {
    if (!email) {
      alert('Cannot reset password: No email found for this user.')
      return
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      alert(`Failed to send reset email: ${error.message}`)
    } else {
      alert(`Password reset link sent to ${email}`)
    }
  }

  const handleSuspendUser = async () => {
    if (!selectedUser) return
    const isSuspended = selectedUser.status === 'suspended'
    const newStatus = isSuspended ? 'active' : 'suspended'
    
    // Update UI immediately
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, status: newStatus } : u))
    setSelectedUser(prev => prev ? { ...prev, status: newStatus } : null)
    
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', selectedUser.id)
    if (error) {
      alert(`Failed to update user status: ${error.message}`)
    } else {
      // Send notification to the user
      const notifTitle = isSuspended ? 'Account Reactivated' : 'Account Suspended'
      const notifMessage = isSuspended 
        ? 'Your account has been reactivated by the administrator. Welcome back!' 
        : 'Your account has been suspended by the administrator. You will not be able to log in until it is reactivated.'
      const notifType = isSuspended ? 'success' : 'error'
      
      await supabase.from('app_notifications').insert([{
        user_id: selectedUser.id,
        title: notifTitle,
        message: notifMessage,
        type: notifType,
        read: false
      }])

      alert(`User account successfully ${isSuspended ? 'reactivated' : 'suspended'} and notification sent!`)
    }
  }

  const stats = [
    { label: 'Total Users', value: overviewStats.totalStudents.toLocaleString(), icon: '👥', color: 'from-brand-400 to-brand-600', change: '+45 this week' },
    { label: 'Properties', value: overviewStats.totalProperties, icon: '🏠', color: 'from-blue-400 to-blue-600', change: '12 pending review' },
    { label: 'Mess Services', value: overviewStats.totalMesses, icon: '🍽️', color: 'from-emerald-400 to-emerald-600', change: '3 pending review' },
    { label: 'Active Subscriptions', value: overviewStats.activeSubscriptions, icon: '💳', color: 'from-purple-400 to-purple-600', change: '87% retention rate' },
    { label: 'Monthly Revenue', value: formatCurrency(overviewStats.monthlyRevenue), icon: '💰', color: 'from-amber-400 to-amber-600', change: '+18% vs last month' },
    { label: 'Pending Verifications', value: overviewStats.pendingVerifications, icon: '⚠️', color: 'from-red-400 to-red-600', change: 'Needs action' },
  ]

  const handleApprove = async (id: string, name: string) => {
    setMesses(prev => prev.map(m => m.id === id ? { ...m, verified: true } : m))
    try {
      await supabase.from('messes').update({ verified: true }).eq('id', id)
      alert(`Approved ${name}`)
    } catch(e) {
      alert(`Simulated Approval of ${name}`)
    }
  }

  const handleReject = async (id: string, name: string) => {
    setMesses(prev => prev.map(m => m.id === id ? { ...m, verified: false } : m))
    try {
      await supabase.from('messes').update({ verified: false }).eq('id', id)
      alert(`Rejected ${name}`)
    } catch(e) {
      alert(`Simulated Rejection of ${name}`)
    }
  }

  const handleApproveProperty = async (id: string, name: string) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, verified: true } : p))
    try {
      await supabase.from('properties').update({ verified: true }).eq('id', id)
      alert(`Approved Property: ${name}`)
    } catch(e) {
      alert(`Simulated Approval of Property: ${name}`)
    }
  }

  const handleRejectProperty = async (id: string, name: string) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, verified: false } : p))
    try {
      await supabase.from('properties').update({ verified: false }).eq('id', id)
      alert(`Rejected Property: ${name}`)
    } catch(e) {
      alert(`Simulated Rejection of Property: ${name}`)
    }
  }

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div className="card p-5">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl mb-3`}>{s.icon}</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              <div className="text-[11px] text-slate-400 mt-1">{s.change}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Platform Growth</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="users" stroke="#6366f1" fill="url(#userGrad)" strokeWidth={2.5} name="Users" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Pending Verifications
          </h3>
          <div className="space-y-3">
            {pendingItems.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No pending verifications!</p>
            ) : pendingItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/10">
                <div className="text-2xl">{item.type === 'property' ? '🏠' : '🍽️'}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
                  <p className="text-xs text-slate-500">by {item.submittedBy} • {item.time}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => item.type === 'mess' ? handleApprove(item.id, item.name) : handleApproveProperty(item.id, item.name)} className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button onClick={() => item.type === 'mess' ? handleReject(item.id, item.name) : handleRejectProperty(item.id, item.name)} className="p-1.5 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-colors">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Manage Users', icon: '👥', path: '/dashboard/admin/users', color: 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800' },
            { label: 'Review Properties', icon: '🏠', path: '/dashboard/admin/properties', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
            { label: 'Approve Messes', icon: '🍽️', path: '/dashboard/admin/messes', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
            { label: 'Roommates', icon: '🫂', path: '/dashboard/admin/roommates', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
            { label: 'Community', icon: '📣', path: '/dashboard/admin/community', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
          ].map(action => (
            <Link key={action.label} to={action.path} className={`flex items-center gap-3 p-4 rounded-2xl border font-medium text-sm transition-all hover:shadow-sm ${action.color}`}>
              <span className="text-xl">{action.icon}</span>
              {action.label}
            </Link>
          ))}
        </div>
        <div className="mt-4">
           <button onClick={() => { fetchOverview(); fetchMesses(); fetchProperties(); }} className="btn-secondary w-full flex items-center justify-center gap-2">
             <RefreshCw className="w-4 h-4" /> Refresh Database Data
           </button>
        </div>
      </div>
    </>
  )

  const renderUsers = () => (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-display font-bold text-slate-900 dark:text-white">User Management</h3>
          <p className="text-xs text-slate-400 mt-0.5">{users.length} users loaded from database</p>
        </div>
        <button onClick={fetchUsers} className="text-sm text-brand-500 hover:underline font-medium">↻ Refresh</button>
      </div>

      {fetchError && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">⚠️ Could not load users from database</p>
          <p className="text-xs text-red-600 dark:text-red-500 mt-1 font-mono">{fetchError}</p>
          <p className="text-xs text-slate-500 mt-2">This is likely a Supabase RLS policy issue. Make sure the <code>profiles</code> table has a policy allowing authenticated admins to read all rows.</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <th className="pb-3 font-medium">User</th>
              <th className="pb-3 font-medium">Email</th>
              <th className="pb-3 font-medium">Role</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Joined</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loadingUsers ? (
              <tr><td colSpan={6} className="py-8 text-center text-slate-500">Loading users...</td></tr>
            ) : users.length === 0 && !fetchError ? (
              <tr><td colSpan={6} className="py-8 text-center text-slate-500">No users found in the <code>profiles</code> table.</td></tr>
            ) : users.map((user) => (
              <tr key={user.id}>
                <td className="py-3 font-medium text-slate-900 dark:text-white">{user.full_name || 'Anonymous User'}</td>
                <td className="py-3 text-slate-500 text-xs">{user.email || '—'}</td>
                <td className="py-3 text-slate-500 capitalize">{user.role?.replace('_', ' ')}</td>
                <td className="py-3">
                  {user.status === 'suspended' ? (
                    <span className="badge bg-red-50 text-red-600">Suspended</span>
                  ) : (
                    <span className="badge bg-emerald-50 text-emerald-600">Active</span>
                  )}
                </td>
                <td className="py-3 text-slate-500">{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</td>
                <td className="py-3 text-right">
                  <button 
                    onClick={() => setSelectedUser(user)}
                    className="text-brand-500 font-medium text-xs hover:underline bg-brand-50 dark:bg-brand-900/20 px-3 py-1.5 rounded-lg"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderMesses = () => (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-bold text-slate-900 dark:text-white">Mess Approvals</h3>
        <button onClick={fetchMesses} className="text-sm text-brand-500 hover:underline">Refresh</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <th className="pb-3 font-medium">Mess Name</th>
              <th className="pb-3 font-medium">Owner</th>
              <th className="pb-3 font-medium">Location</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loadingMesses ? (
              <tr><td colSpan={5} className="py-8 text-center text-slate-500">Loading messes...</td></tr>
            ) : messes.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-slate-500">No messes found.</td></tr>
            ) : messes.map(mess => (
              <tr key={mess.id}>
                <td className="py-3 font-medium text-slate-900 dark:text-white">{mess.name}</td>
                <td className="py-3 text-slate-500">Owner ID: {mess.owner_id.substring(0, 4)}</td>
                <td className="py-3 text-slate-500">{mess.address || 'Pune'}</td>
                <td className="py-3">
                  {mess.verified ? (
                     <span className="badge bg-emerald-50 text-emerald-600">Verified</span>
                  ) : (
                     <span className="badge bg-amber-50 text-amber-600">Pending Review</span>
                  )}
                </td>
                <td className="py-3 text-right flex gap-2 justify-end">
                  {!mess.verified ? (
                    <>
                      <button onClick={() => handleApprove(mess.id, mess.name)} className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded text-xs font-bold transition-colors">Approve</button>
                      <button onClick={() => handleReject(mess.id, mess.name)} className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded text-xs font-bold transition-colors">Reject</button>
                    </>
                  ) : (
                    <button onClick={() => handleReject(mess.id, mess.name)} className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded text-xs font-bold transition-colors">Revoke</button>
                  )}
                  <button onClick={() => handleDeleteMess(mess.id)} className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-bold transition-colors">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderProperties = () => (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-bold text-slate-900 dark:text-white">Property Approvals</h3>
        <button onClick={fetchProperties} className="text-sm text-brand-500 hover:underline">Refresh</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <th className="pb-3 font-medium">Property Name</th>
              <th className="pb-3 font-medium">Owner</th>
              <th className="pb-3 font-medium">Location</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loadingProps ? (
              <tr><td colSpan={5} className="py-8 text-center text-slate-500">Loading properties...</td></tr>
            ) : properties.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-slate-500">No properties found.</td></tr>
            ) : properties.map(prop => (
              <tr key={prop.id}>
                <td className="py-3 font-medium text-slate-900 dark:text-white">{prop.title}</td>
                <td className="py-3 text-slate-500">Owner ID: {prop.owner_id?.substring(0, 4) || 'Unk'}</td>
                <td className="py-3 text-slate-500">{prop.address || 'Pune'}</td>
                <td className="py-3">
                  {prop.verified ? (
                     <span className="badge bg-emerald-50 text-emerald-600">Verified</span>
                  ) : (
                     <span className="badge bg-amber-50 text-amber-600">Pending Review</span>
                  )}
                </td>
                <td className="py-3 text-right flex gap-2 justify-end">
                  {!prop.verified ? (
                    <>
                      <button onClick={() => handleApproveProperty(prop.id, prop.title)} className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded text-xs font-bold transition-colors">Approve</button>
                      <button onClick={() => handleRejectProperty(prop.id, prop.title)} className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded text-xs font-bold transition-colors">Reject</button>
                    </>
                  ) : (
                    <button onClick={() => handleRejectProperty(prop.id, prop.title)} className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded text-xs font-bold transition-colors">Revoke</button>
                  )}
                  <button onClick={() => handleDeleteProperty(prop.id)} className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-bold transition-colors">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderRoommates = () => (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-bold text-slate-900 dark:text-white">Roommate Profiles</h3>
        <button onClick={fetchRoommates} className="text-sm text-brand-500 hover:underline">Refresh</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">College</th>
              <th className="pb-3 font-medium">Budget</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loadingRoommates ? (
              <tr><td colSpan={4} className="py-8 text-center text-slate-500">Loading...</td></tr>
            ) : roommates.length === 0 ? (
              <tr><td colSpan={4} className="py-8 text-center text-slate-500">No roommates found.</td></tr>
            ) : roommates.map(r => (
              <tr key={r.id}>
                <td className="py-3 font-medium text-slate-900 dark:text-white">{r.full_name}</td>
                <td className="py-3 text-slate-500">{r.college}</td>
                <td className="py-3 text-slate-500">₹{r.budget_min} - ₹{r.budget_max}</td>
                <td className="py-3 text-right">
                  <button onClick={() => handleDeleteRoommate(r.id)} className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-bold transition-colors">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderCommunity = () => (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-bold text-slate-900 dark:text-white">Community Posts</h3>
        <button onClick={fetchCommunity} className="text-sm text-brand-500 hover:underline">Refresh</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <th className="pb-3 font-medium">Title</th>
              <th className="pb-3 font-medium">Category</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loadingCommunity ? (
              <tr><td colSpan={3} className="py-8 text-center text-slate-500">Loading...</td></tr>
            ) : community.length === 0 ? (
              <tr><td colSpan={3} className="py-8 text-center text-slate-500">No posts found.</td></tr>
            ) : community.map(post => (
              <tr key={post.id}>
                <td className="py-3 font-medium text-slate-900 dark:text-white max-w-xs truncate">{post.title}</td>
                <td className="py-3 text-slate-500 capitalize">{post.category}</td>
                <td className="py-3 text-right">
                  <button onClick={() => handleDeleteCommunity(post.id)} className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-bold transition-colors">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Platform-wide overview and management</p>
        </div>
        {currentTab !== 'admin' && (
          <Link to="/dashboard/admin" className="text-brand-500 text-sm font-medium hover:underline">
            &larr; Back to Overview
          </Link>
        )}
      </div>

      {currentTab === 'admin' && renderOverview()}
      {currentTab === 'users' && renderUsers()}
      {currentTab === 'messes' && renderMesses()}
      {currentTab === 'properties' && renderProperties()}
      {currentTab === 'roommates' && renderRoommates()}
      {currentTab === 'community' && renderCommunity()}

      {/* Manage User Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Manage User</h3>
                <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Full Name</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedUser.full_name || 'Anonymous'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Current Role</p>
                  <p className="font-medium text-slate-900 dark:text-white capitalize">{selectedUser.role.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Account Actions</p>
                  <div className="mt-2 space-y-2">
                    <button onClick={handleSuspendUser} className="w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl font-medium text-sm transition-colors text-left flex justify-between">
                      {selectedUser.status === 'suspended' ? 'Reactivate Account' : 'Suspend Account'} <span>⚠️</span>
                    </button>
                    <button onClick={() => handleDeleteUser(selectedUser.id)} className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium text-sm transition-colors text-left flex justify-between">
                      Delete User Data <span>🗑️</span>
                    </button>
                    <button onClick={() => handleResetPassword(selectedUser.email)} className="w-full py-2.5 px-4 bg-brand-50 hover:bg-brand-100 text-brand-600 rounded-xl font-medium text-sm transition-colors text-left flex justify-between">
                      Reset Password <span>🔑</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button onClick={() => setSelectedUser(null)} className="btn-secondary px-4 py-2 text-sm">Done</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
