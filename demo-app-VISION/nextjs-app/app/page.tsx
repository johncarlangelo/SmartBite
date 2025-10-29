'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import OverviewSection from '@/components/OverviewSection'
import FoodCarousel from '@/components/FoodCarousel'
import AnimatedBackground from '@/components/AnimatedBackground'
import { Moon, Sun } from 'lucide-react'

export default function Home() {
  const [darkMode, setDarkMode] = useState(true)
  const [isOnline, setIsOnline] = useState(true)

  // Load dark mode preference from localStorage
  useEffect(() => {
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
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className={`absolute top-10 left-10 w-[500px] h-[500px] rounded-full blur-3xl opacity-40 animate-blob ${
          darkMode ? 'bg-blue-600' : 'bg-blue-400'
        }`}></div>
        <div className={`absolute top-10 right-10 w-[450px] h-[450px] rounded-full blur-3xl opacity-40 animate-blob animation-delay-2000 ${
          darkMode ? 'bg-violet-600' : 'bg-violet-400'
        }`}></div>
        <div className={`absolute bottom-10 left-1/4 w-[520px] h-[520px] rounded-full blur-3xl opacity-40 animate-blob animation-delay-4000 ${
          darkMode ? 'bg-indigo-600' : 'bg-indigo-400'
        }`}></div>
        <div className={`absolute bottom-10 right-1/4 w-[480px] h-[480px] rounded-full blur-3xl opacity-40 animate-blob animation-delay-6000 ${
          darkMode ? 'bg-cyan-600' : 'bg-cyan-400'
        }`}></div>
      </div>

      <Navbar darkMode={darkMode} isOnline={isOnline} />
      <HeroSection darkMode={darkMode} />
      <OverviewSection darkMode={darkMode} />
      <FoodCarousel darkMode={darkMode} isOnline={isOnline} />
      
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
