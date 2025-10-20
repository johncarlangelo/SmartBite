'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import FoodCarousel from '@/components/FoodCarousel'
import { Moon, Sun } from 'lucide-react'

export default function Home() {
  const [darkMode, setDarkMode] = useState(true)

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode')
    if (savedMode !== null) {
      setDarkMode(savedMode === 'true')
    }
  }, [])

  // Save dark mode preference
  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('darkMode', String(newMode))
  }

  return (
    <main className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-slate-900' 
        : 'bg-gradient-to-b from-blue-50 to-white'
    }`}>
      <Navbar darkMode={darkMode} />
      <HeroSection darkMode={darkMode} />
      <FoodCarousel darkMode={darkMode} />
      
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
