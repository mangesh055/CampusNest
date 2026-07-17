import React, { useState, useEffect } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'

export default function QRScanPage() {
  const { profile } = useAuthStore()
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [status, setStatus] = useState<'scanning' | 'processing' | 'success' | 'error'>('scanning')
  const [message, setMessage] = useState('')
  const [mealType, setMealType] = useState('')
  const [manualCode, setManualCode] = useState('')
  const [myMesses, setMyMesses] = useState<{mess_id: string, messes: {name: string}}[]>([])

  useEffect(() => {
    if (profile) {
      supabase.from('student_subscriptions')
        .select('mess_id, messes(name)')
        .eq('student_id', profile.id)
        .eq('status', 'active')
        .then(({ data }) => {
          if (data) setMyMesses(data as any)
        })
    }
  }, [profile])

  useEffect(() => {
    if (status === 'scanning') {
      const scanner = new Html5QrcodeScanner('reader', {
        qrbox: { width: 250, height: 250 },
        fps: 5,
      }, false)

      scanner.render(
        (decodedText) => {
          scanner.clear()
          setScanResult(decodedText)
          setStatus('processing')
        },
        (error) => {
          // ignore scan errors
        }
      )

      return () => {
        scanner.clear().catch(() => {})
      }
    }
  }, [status])

  useEffect(() => {
    if (status === 'processing' && scanResult) {
      processScan(scanResult)
    }
  }, [status, scanResult])

  const processScan = async (qrTokenOrMessId: string) => {
    try {
      if (!profile) throw new Error('User not found')

      let actualMessId = qrTokenOrMessId;
      const { data: messMatch } = await supabase
        .from('messes')
        .select('id')
        .eq('qr_token', qrTokenOrMessId)
        .maybeSingle();

      if (messMatch && messMatch.id) {
        actualMessId = messMatch.id;
      }

      // Check if the user has an active subscription to this mess
      const { data: sub, error: subError } = await supabase
        .from('student_subscriptions')
        .select('*')
        .eq('student_id', profile.id)
        .eq('mess_id', actualMessId)
        .eq('status', 'active')
        .maybeSingle()

      if (subError || !sub) {
        throw new Error('No active meal plan found for this mess.')
      }

      if (sub.remaining_days !== undefined && sub.remaining_days <= 0) {
        throw new Error('Insufficient meals. Your meal balance is 0. Please renew your plan.')
      }

      // Determine current meal
      const hour = new Date().getHours()
      let currentMeal = ''
      if (hour >= 6 && hour < 11) currentMeal = 'breakfast'
      else if (hour >= 11 && hour < 16) currentMeal = 'lunch'
      else if (hour >= 16 && hour < 19) currentMeal = 'snack'
      else currentMeal = 'dinner'

      setMealType(currentMeal)

      const todayStr = new Date().toISOString().split('T')[0]
      
      // Check attendance
      const { data: attendance, error: attError } = await supabase
        .from('student_attendance')
        .select('*')
        .eq('student_id', profile.id)
        .eq('mess_id', actualMessId)
        .eq('date', todayStr)
        .maybeSingle()

      if (attendance && (attendance as any)[currentMeal]) {
        throw new Error(`You have already checked in for ${currentMeal} today!`)
      }

      // Mark attendance
      if (attendance) {
        const { error: updateError } = await supabase
          .from('student_attendance')
          .update({ [currentMeal]: true })
          .eq('id', attendance.id)
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('student_attendance')
          .insert({
            id: `att-${Date.now()}`,
            student_id: profile.id,
            mess_id: actualMessId,
            date: todayStr,
            [currentMeal]: true
          })
        if (insertError) throw insertError;
      }

      // Try to decrement remaining days/meals if column exists
      try {
        if (sub.remaining_days !== undefined && sub.remaining_days > 0) {
           const newRemaining = sub.remaining_days - 1;
           const updatePayload: any = { remaining_days: newRemaining };
           if (newRemaining <= 0) {
             updatePayload.status = 'expired';
           }
           const { error: subUpdateError } = await supabase
             .from('student_subscriptions')
             .update(updatePayload)
             .eq('id', sub.id)
           if (subUpdateError) console.error('Error updating remaining days:', subUpdateError);
        }
      } catch (e) {
        console.error('Exception updating remaining days:', e);
      }

      setStatus('success')
    } catch (error: any) {
      setMessage(error.message || 'Invalid QR Code or Scan Error')
      setStatus('error')
    }
  }

  const resetScanner = () => {
    setScanResult(null)
    setStatus('scanning')
    setMessage('')
  }

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Mess QR Scanner</h1>
        <p className="text-slate-500 text-sm mt-1">Scan the mess QR code to mark your attendance</p>
      </div>

      <AnimatePresence mode="wait">
        {status === 'scanning' && (
          <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="card p-4 overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-800">
              <div id="reader" className="w-full rounded-2xl overflow-hidden [&>div]:border-none [&_video]:rounded-2xl bg-black" />
            </div>
            <p className="text-center text-xs text-slate-500 mt-4">Point your camera at the mess QR code</p>
          </motion.div>
        )}

        {status === 'processing' && (
          <motion.div key="processing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card p-8 text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-20 h-20 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mx-auto mb-4"
            >
              <QrCode className="w-10 h-10 text-brand-600" />
            </motion.div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Verifying...</h3>
            <p className="text-slate-500 text-sm">Checking your active meal plan</p>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="card p-8 text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-2"
            >
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </motion.div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Check-in Successful!</h3>
            <p className="text-slate-500 text-sm capitalize">
              Your attendance for <strong>{mealType}</strong> has been marked.
            </p>
            <button onClick={resetScanner} className="btn-secondary w-full justify-center">
              <RefreshCw className="w-4 h-4 mr-2" /> Scan Again
            </button>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card p-8 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-2">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Access Denied</h3>
            <p className="text-red-500 text-sm font-medium">{message}</p>
            <button onClick={resetScanner} className="btn-primary w-full justify-center">
              <RefreshCw className="w-4 h-4 mr-2" /> Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
