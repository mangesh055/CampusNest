import React from 'react'
import { motion } from 'framer-motion'
import { Users, Building2, Utensils, TrendingUp, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../../lib/utils'
import { mockDashboardStats } from '../../data/mockData'

const growthData = [
  { month: 'Jan', users: 820, revenue: 890000 },
  { month: 'Feb', users: 932, revenue: 1020000 },
  { month: 'Mar', users: 1100, revenue: 1150000 },
  { month: 'Apr', users: 1200, revenue: 1180000 },
  { month: 'May', users: 1289, revenue: 1245000 },
]

const pendingItems = [
  { type: 'property', name: 'Green Heights PG – Wakad', submittedBy: 'Suresh Kumar', time: '2 hours ago' },
  { type: 'mess', name: 'Annapurna Mess – Kothrud', submittedBy: 'Lalita Sharma', time: '5 hours ago' },
  { type: 'property', name: 'Elite Hostel for Girls', submittedBy: 'Meena Patel', time: '1 day ago' },
]

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Users', value: mockDashboardStats.totalStudents.toLocaleString(), icon: '👥', color: 'from-brand-400 to-brand-600', change: '+45 this week' },
    { label: 'Properties', value: mockDashboardStats.totalProperties, icon: '🏠', color: 'from-blue-400 to-blue-600', change: '12 pending review' },
    { label: 'Mess Services', value: mockDashboardStats.totalMesses, icon: '🍽️', color: 'from-emerald-400 to-emerald-600', change: '3 pending review' },
    { label: 'Active Subscriptions', value: mockDashboardStats.activeSubscriptions, icon: '💳', color: 'from-purple-400 to-purple-600', change: '87% retention rate' },
    { label: 'Monthly Revenue', value: formatCurrency(mockDashboardStats.monthlyRevenue), icon: '💰', color: 'from-amber-400 to-amber-600', change: '+18% vs last month' },
    { label: 'Pending Verifications', value: mockDashboardStats.pendingVerifications, icon: '⚠️', color: 'from-red-400 to-red-600', change: 'Needs action' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Platform-wide overview and management</p>
      </div>

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
            {pendingItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/10">
                <div className="text-2xl">{item.type === 'property' ? '🏠' : '🍽️'}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
                  <p className="text-xs text-slate-500">by {item.submittedBy} • {item.time}</p>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-colors">
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
            { label: 'View Reports', icon: '📊', path: '/dashboard/admin/reports', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
          ].map(action => (
            <button key={action.label} className={`flex items-center gap-3 p-4 rounded-2xl border font-medium text-sm transition-all hover:shadow-sm ${action.color}`}>
              <span className="text-xl">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
