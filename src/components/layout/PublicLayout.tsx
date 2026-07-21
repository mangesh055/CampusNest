import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

interface PublicLayoutProps {
  darkMode: boolean
  toggleDarkMode: () => void
}

export default function PublicLayout({ darkMode, toggleDarkMode }: PublicLayoutProps) {
  const location = useLocation()
  const isAuthPage = location.pathname === '/auth'

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      {!isAuthPage && <Footer />}
    </div>
  )
}
