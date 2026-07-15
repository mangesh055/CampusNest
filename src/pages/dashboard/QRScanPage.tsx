import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, MapPin, CheckCircle, XCircle, AlertTriangle, RefreshCw, Plus, Minus } from 'lucide-react'
import { generateTokenCode } from '../../lib/utils'
import { cn } from '../../lib/utils'
import QRCode from 'qrcode'

type ScanStep = 'checking_location' | 'location_ok' | 'scanning' | 'success' | 'error'

const mockMessLocation = { lat: 18.5074, lng: 73.8077 }

export default function QRScanPage() {
  const [step, setStep] = useState<ScanStep>('checking_location')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [distance, setDistance] = useState<number | null>(null)
  const [mealToken, setMealToken] = useState('')
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch')
  const [isSubscriber, setIsSubscriber] = useState(true)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [qrImageUrl, setQrImageUrl] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const [cartItems, setCartItems] = useState<Record<string, number>>({})
  const [currentMenu, setCurrentMenu] = useState<string[]>([])
  const [activeTokens, setActiveTokens] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('campusnest-active-tokens')
      if (saved) return JSON.parse(saved)
    } catch(e) {}
    return []
  })

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash' | 'none'>('none')
  const [upiQrUrl, setUpiQrUrl] = useState('')

  useEffect(() => {
    const totalAmt = Object.entries(cartItems).reduce((sum, [itemStr, qty]) => {
      const parts = itemStr.split(' - ₹')
      const price = parts.length > 1 ? parseInt(parts[1]) : 0
      return sum + (price * qty)
    }, 0)
    
    if (paymentMethod === 'upi' && totalAmt > 0) {
      QRCode.toDataURL(`upi://pay?pa=demo@upi&pn=CampusNest+Mess&am=${totalAmt}&cu=INR`, { width: 180, margin: 2, color: { dark: '#0f172a', light: '#f8fafc' } })
        .then(setUpiQrUrl)
        .catch(console.error)
    }
  }, [paymentMethod, cartItems])

  const saveToken = (token: string, meal: string, isGuest: boolean, amt?: number) => {
    const todayStr = new Date().toISOString().split('T')[0]
    const newToken = {
      id: token,
      meal,
      isGuest,
      amount: amt,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: todayStr
    }
    setActiveTokens(prev => {
      const updated = [newToken, ...prev.filter(t => t.date === todayStr)]
      localStorage.setItem('campusnest-active-tokens', JSON.stringify(updated))
      return updated
    })
  }

  const fallbackMenu: Record<string, string[]> = {
    breakfast: ['Poha - ₹30', 'Aloo Paratha - ₹40', 'Tea - ₹15'],
    lunch: ['Special Thali - ₹120', 'Mini Thali - ₹80', 'Extra Roti - ₹10'],
    dinner: ['Paneer Meal - ₹100', 'Egg Curry Meal - ₹90', 'Lassi - ₹20'],
    snack: ['Samosa - ₹15', 'Coffee - ₹20']
  }

  useEffect(() => {
    let menuData = fallbackMenu
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('campusnest-mess-menu-')) {
          const val = localStorage.getItem(key)
          if (val) {
             menuData = JSON.parse(val)
             break
          }
        }
      }
    } catch(e) {}
    
    setCurrentMenu(menuData[selectedMeal] || fallbackMenu[selectedMeal] || [])
    setCartItems({})
  }, [selectedMeal])

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371000
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  useEffect(() => {
    // Simulate GPS check
    const timer = setTimeout(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords
            setUserLocation({ lat: latitude, lng: longitude })
            const dist = calculateDistance(latitude, longitude, mockMessLocation.lat, mockMessLocation.lng)
            setDistance(dist)
            setStep(dist <= 50000 ? 'location_ok' : 'error') // 50km for demo
            if (dist > 50000) setErrorMsg('You are too far from the mess. Please be within 50 meters.')
          },
          () => {
            // Fallback for demo: simulate nearby
            setDistance(15)
            setStep('location_ok')
          }
        )
      } else {
        setDistance(15)
        setStep('location_ok')
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Generate mock QR for demo
    const qrData = `CAMPUSNEST:MESS=m1:MEAL=${selectedMeal}:DATE=${new Date().toISOString().split('T')[0]}:TOKEN=${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    QRCode.toDataURL(qrData, { width: 200, margin: 2, color: { dark: '#1e293b', light: '#ffffff' } })
      .then(setQrImageUrl)
      .catch(console.error)
  }, [selectedMeal])

  const handleScan = () => {
    setStep('scanning')
    setTimeout(() => {
      const token = generateTokenCode()
      setMealToken(token)

      // Update local storage so dashboard is dynamic
      const saved = localStorage.getItem('campusnest-student-attendance')
      let attendance = saved ? JSON.parse(saved) : []
      const todayStr = new Date().toISOString().split('T')[0]
      
      const todayIndex = attendance.findIndex((r: any) => r.date.startsWith(todayStr))
      if (todayIndex >= 0) {
        attendance[todayIndex][selectedMeal] = true
      } else {
        attendance.unshift({
          date: todayStr,
          breakfast: selectedMeal === 'breakfast',
          lunch: selectedMeal === 'lunch',
          dinner: selectedMeal === 'dinner',
          snack: selectedMeal === 'snack'
        })
      }
      localStorage.setItem('campusnest-student-attendance', JSON.stringify(attendance))
      saveToken(token, selectedMeal, false)
      setStep('success')
    }, 2000)
  }

  const handleWalkInPayment = () => {
    setIsProcessingPayment(true)
    setTimeout(() => {
      setIsProcessingPayment(false)
      const token = 'GUEST-' + generateTokenCode()
      setMealToken(token)
      
      const totalAmt = Object.entries(cartItems).reduce((sum, [itemStr, qty]) => {
        const parts = itemStr.split(' - ₹')
        const price = parts.length > 1 ? parseInt(parts[1]) : 0
        return sum + (price * qty)
      }, 0)
      
      saveToken(token, selectedMeal, true, totalAmt)
      setStep('success')
    }, 2000)
  }

  const reset = () => {
    setStep('checking_location')
    setMealToken('')
    setDistance(null)
    setIsProcessingPayment(false)
    setPaymentMethod('none')
    setTimeout(() => { setDistance(15); setStep('location_ok') }, 1000)
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">📷 Scan QR Code</h1>
        {step === 'location_ok' && (
          <button 
            onClick={() => setIsSubscriber(!isSubscriber)}
            className="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-brand-500 transition-colors"
          >
            TEST: Switch to {isSubscriber ? 'Walk-in' : 'Subscriber'}
          </button>
        )}
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Mark your meal attendance by scanning the mess QR code</p>

      {/* Meal Selector */}
      {step !== 'success' && (
        <div className="card p-4 mb-6">
          <p className="text-xs font-semibold text-slate-500 mb-2">Select Meal</p>
          <div className="grid grid-cols-4 gap-2">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(meal => (
              <button key={meal} onClick={() => setSelectedMeal(meal)}
                className={cn('p-2.5 rounded-xl text-center border-2 transition-all',
                  selectedMeal === meal ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-200 dark:border-slate-700')}>
                <div className="text-xl">{meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : meal === 'dinner' ? '🌙' : '🍪'}</div>
                <p className={cn('text-[10px] mt-1 font-medium capitalize', selectedMeal === meal ? 'text-brand-600' : 'text-slate-500')}>{meal}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Steps */}
      <AnimatePresence mode="wait">
        {step === 'checking_location' && (
          <motion.div key="checking" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card p-8 text-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="w-16 h-16 rounded-full border-4 border-brand-500 border-t-transparent mx-auto mb-4" />
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Checking Location...</h3>
            <p className="text-slate-500 text-sm">Verifying you are near the mess</p>
          </motion.div>
        )}

        {step === 'location_ok' && (
          <motion.div key="location" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Location Verified ✓</p>
                  <p className="text-xs text-emerald-600">{distance ? `${Math.round(distance)}m from mess` : 'Near mess'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', isSubscriber ? 'bg-brand-100 dark:bg-brand-900/30' : 'bg-amber-100 dark:bg-amber-900/30')}>
                  {isSubscriber ? <CheckCircle className="w-5 h-5 text-brand-600" /> : <AlertTriangle className="w-5 h-5 text-amber-600" />}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{isSubscriber ? 'Subscription Active ✓' : 'No Active Subscription'}</p>
                  <p className={cn("text-xs", isSubscriber ? 'text-brand-600' : 'text-amber-600')}>
                    {isSubscriber ? 'Full Day Plan — 18 days remaining' : 'Walk-in mode active'}
                  </p>
                </div>
              </div>
            </div>

            {isSubscriber ? (
              <div className="card p-6 text-center">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                  Today's Mess QR Code (Demo Preview)
                </p>
                {qrImageUrl && (
                  <div className="qr-container inline-block mb-4">
                    <img src={qrImageUrl} alt="QR Code" className="w-40 h-40" />
                  </div>
                )}
                <div className="badge badge-yellow text-xs mx-auto mb-4">
                  <AlertTriangle className="w-3 h-3" /> QR rotates every 24 hours
                </div>
                <p className="text-xs text-slate-500 mb-4">In the real app, your camera would scan the mess owner's QR code</p>
                <button onClick={handleScan} className="btn-primary w-full">
                  <QrCode className="w-4 h-4" />
                  Simulate QR Scan
                </button>
              </div>
            ) : (
              <div className="card p-6 text-center">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                  Pay for Single Meal (Walk-in)
                </p>
                
                <div className="text-left space-y-2 mb-6 max-h-48 overflow-y-auto pr-1">
                  {currentMenu.length > 0 ? currentMenu.map((itemStr, idx) => {
                    const parts = itemStr.split(' - ₹')
                    const itemName = parts[0]
                    const hasPrice = parts.length > 1
                    const price = hasPrice ? parseInt(parts[1]) : 0
                    const qty = cartItems[itemStr] || 0
                    
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div>
                          <p className="font-semibold text-sm text-slate-900 dark:text-white">{itemName}</p>
                          {hasPrice ? (
                            <p className="text-xs text-brand-600 font-bold">₹{price}</p>
                          ) : (
                            <p className="text-xs text-slate-400 italic">Price not set</p>
                          )}
                        </div>
                        {hasPrice && (
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => setCartItems(prev => ({ ...prev, [itemStr]: Math.max(0, (prev[itemStr] || 0) - 1) }))}
                              className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-bold w-4 text-center">{qty}</span>
                            <button 
                              onClick={() => setCartItems(prev => ({ ...prev, [itemStr]: (prev[itemStr] || 0) + 1 }))}
                              className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 hover:bg-brand-200 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  }) : (
                    <p className="text-xs text-slate-500 text-center italic py-4">No menu items added for {selectedMeal} yet.</p>
                  )}
                </div>

                {/* Calculate Total */}
                {(() => {
                  const totalAmt = Object.entries(cartItems).reduce((sum, [itemStr, qty]) => {
                    const parts = itemStr.split(' - ₹')
                    const price = parts.length > 1 ? parseInt(parts[1]) : 0
                    return sum + (price * qty)
                  }, 0)
                  
                  return (
                    <>
                      <div className="flex justify-between items-end mb-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                        <span className="font-bold text-slate-600 dark:text-slate-400">Total Amount</span>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">₹{totalAmt}</div>
                      </div>
                      
                      {totalAmt > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-slate-500 mb-2">Select Payment Method</p>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setPaymentMethod('upi')} 
                              className={cn("flex-1 py-2 text-xs font-bold rounded-xl border transition-all", paymentMethod === 'upi' ? "bg-brand-50 border-brand-500 text-brand-700" : "bg-slate-50 border-slate-200 text-slate-600")}
                            >
                              UPI QR
                            </button>
                            <button 
                              onClick={() => setPaymentMethod('cash')} 
                              className={cn("flex-1 py-2 text-xs font-bold rounded-xl border transition-all", paymentMethod === 'cash' ? "bg-brand-50 border-brand-500 text-brand-700" : "bg-slate-50 border-slate-200 text-slate-600")}
                            >
                              Cash
                            </button>
                          </div>
                        </div>
                      )}

                      <AnimatePresence>
                        {paymentMethod === 'upi' && totalAmt > 0 && upiQrUrl && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Scan to Pay via UPI</p>
                            <img src={upiQrUrl} alt="UPI QR" className="mx-auto rounded-lg shadow-sm" />
                            <p className="text-[10px] text-slate-500 mt-2">After scanning, click verify below.</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {paymentMethod === 'cash' && totalAmt > 0 && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-left overflow-hidden">
                            <p className="text-xs text-amber-700 dark:text-amber-500 font-medium">Please hand ₹{totalAmt} in cash to the counter before generating the token.</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <button 
                        onClick={handleWalkInPayment} 
                        disabled={isProcessingPayment || totalAmt === 0 || paymentMethod === 'none'} 
                        className="btn-primary w-full bg-emerald-500 hover:bg-emerald-600 border-emerald-500 justify-center disabled:opacity-50 transition-all"
                      >
                        {isProcessingPayment ? (
                          <><RefreshCw className="w-4 h-4 animate-spin" /> Processing...</>
                        ) : paymentMethod === 'cash' ? (
                          `Generate Token (Cash)`
                        ) : paymentMethod === 'upi' ? (
                          `Verify UPI Payment`
                        ) : (
                          `Choose Payment Method`
                        )}
                      </button>
                    </>
                  )
                })()}
              </div>
            )}
          </motion.div>
        )}

        {step === 'scanning' && (
          <motion.div key="scanning" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card p-8 text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-20 h-20 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mx-auto mb-4"
            >
              <QrCode className="w-10 h-10 text-brand-600" />
            </motion.div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Processing...</h3>
            <p className="text-slate-500 text-sm">Verifying attendance and generating token</p>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <div className="card p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </motion.div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {isSubscriber ? 'Attendance Marked! 🎉' : 'Payment Successful! 🎉'}
              </h3>
              <p className="text-slate-500 text-sm mb-6 capitalize">
                {selectedMeal === 'breakfast' ? '🌅' : selectedMeal === 'lunch' ? '☀️' : selectedMeal === 'dinner' ? '🌙' : '🍪'} {selectedMeal} at Maa Ki Rasoi
              </p>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white mb-4">
                <p className="text-brand-200 text-xs mb-1">{isSubscriber ? 'Your Meal Token' : 'Walk-in Guest Token'}</p>
                <p className="text-3xl font-bold font-mono tracking-wider">{mealToken}</p>
                <p className="text-brand-200 text-xs mt-2">Valid for this meal only • Show to mess staff</p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs text-left mb-6">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-slate-400 mb-0.5">Date</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{new Date().toLocaleDateString('en-IN')}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-slate-400 mb-0.5">Meal</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{selectedMeal}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-slate-400 mb-0.5">Status</p>
                  <p className="font-semibold text-emerald-600">Valid</p>
                </div>
              </div>

              <button onClick={reset} className="btn-secondary w-full">
                <RefreshCw className="w-4 h-4" /> Scan Another Meal
              </button>
            </div>
          </motion.div>
        )}

        {step === 'error' && (
          <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Cannot Mark Attendance</h3>
            <p className="text-slate-500 text-sm mb-6">{errorMsg || 'Please ensure you are at the mess location.'}</p>
            <button onClick={reset} className="btn-primary w-full">
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Tokens History */}
      {activeTokens.length > 0 && step !== 'scanning' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Today's Active Tokens</h3>
          <div className="space-y-3">
            {activeTokens.map((t, idx) => (
              <div key={idx} className="card p-4 flex items-center justify-between border-l-4 border-l-brand-500">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold font-mono text-slate-900 dark:text-white">{t.id}</span>
                    {t.isGuest && <span className="badge badge-yellow text-[9px]">Walk-in</span>}
                  </div>
                  <p className="text-xs text-slate-500 capitalize">
                    {t.meal} • {t.time} {t.isGuest && `• Paid: ₹${t.amount}`}
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
