'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import OverviewSection from '@/components/OverviewSection'
import CTASection from '@/components/CTASection'
import AnimatedBackground from '@/components/AnimatedBackground'
import { Moon, Sun } from 'lucide-react'

export default function Home() {
  const [darkMode, setDarkMode] = useState(true)
  const [isOnline, setIsOnline] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Load dark mode preference from localStorage
  useEffect(() => {
    setIsMounted(true)
    const savedMode = localStorage.getItem('darkMode')
    if (savedMode !== null) {
      setDarkMode(savedMode === 'true')
    }
  }, [])

  // Detect online/offline status
  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Save dark mode preference
  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('darkMode', String(newMode))
  }

  return (
    <main className={`min-h-screen transition-colors duration-300 relative overflow-hidden ${
      darkMode ? 'bg-slate-900' : 'bg-white'
    }`}>
      <Navbar darkMode={darkMode} isOnline={isOnline} />
      {isMounted && (
        <>
          <HeroSection darkMode={darkMode} />
          <OverviewSection darkMode={darkMode} />
          <CTASection darkMode={darkMode} />
        </>
      )}
      
      {/* Dark Mode Toggle Button */}
      <button
        onClick={toggleDarkMode}
        className={`fixed bottom-8 right-8 p-4 rounded-full shadow-2xl transition-all hover:scale-110 z-50 ${
          darkMode
            ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700 border border-slate-600'
            : 'bg-white text-slate-900 hover:bg-gray-100 border border-gray-200'
        }`}
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>
    </main>
  )
}
