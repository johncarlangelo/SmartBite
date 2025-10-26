'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Sparkles, Lightbulb, BookOpen, Flame } from 'lucide-react'
import { getRandomFact, type FoodFact } from '@/data/foodFacts'

interface LoadingWithFactsProps {
  darkMode?: boolean
  message?: string
  showProgress?: boolean
  progress?: number
}

const categoryIcons = {
  nutrition: Sparkles,
  history: BookOpen,
  science: Lightbulb,
  tip: Flame,
}

export default function LoadingWithFacts({
  darkMode = true,
  message = 'Analyzing your food...',
  showProgress = false,
  progress = 0,
}: LoadingWithFactsProps) {
  const [currentFact, setCurrentFact] = useState<FoodFact>(getRandomFact())
  const [factIndex, setFactIndex] = useState(0)

  // Rotate facts every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFact(getRandomFact())
      setFactIndex(prev => prev + 1)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const CategoryIcon = categoryIcons[currentFact.category]

  return (
    <div className="space-y-6">
      {/* Animated Food Illustration */}
      <div className="flex justify-center">
        <motion.div
          key="food-animation"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [0.8, 1.1, 1],
            opacity: 1,
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1
          }}
          className={`relative w-32 h-32 rounded-full flex items-center justify-center ${
            darkMode 
              ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20' 
              : 'bg-gradient-to-br from-blue-100 to-purple-100'
          }`}
        >
          {/* Orbiting food emojis */}
          {['🍕', '🍔', '🍜', '🥗'].map((emoji, index) => (
            <motion.div
              key={`emoji-${index}`}
              className="absolute text-2xl"
              style={{
                top: '50%',
                left: '50%',
              }}
              animate={{
                x: [0, Math.cos(index * 90 * Math.PI / 180) * 60],
                y: [0, Math.sin(index * 90 * Math.PI / 180) * 60],
                rotate: [0, 360],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: index * 0.5,
                ease: "easeInOut"
              }}
            >
              {emoji}
            </motion.div>
          ))}
          
          {/* Center icon */}
          <Sparkles 
            size={40} 
            className={darkMode ? 'text-blue-400' : 'text-blue-600'}
          />
        </motion.div>
      </div>

      {/* Loading Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {message}
        </h3>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          This will only take a moment
        </p>
      </motion.div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Processing...
            </span>
            <span className={`font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {progress}%
            </span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${
            darkMode ? 'bg-slate-700' : 'bg-gray-200'
          }`}>
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Fun Facts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`p-6 rounded-2xl border ${
          darkMode
            ? 'bg-slate-800/50 border-slate-700/50 backdrop-blur-xl'
            : 'bg-white/90 border-gray-200 backdrop-blur-xl'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl flex-shrink-0 ${
            darkMode
              ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20'
              : 'bg-gradient-to-br from-blue-100 to-purple-100'
          }`}>
            <CategoryIcon 
              size={24} 
              className={darkMode ? 'text-blue-400' : 'text-blue-600'} 
            />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold uppercase tracking-wide ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                Did you know?
              </span>
              <span className="text-2xl">{currentFact.emoji}</span>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.p
                key={factIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className={`text-sm leading-relaxed ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {currentFact.text}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Category Badge */}
        <div className="mt-4 flex justify-end">
          <span className={`text-xs px-3 py-1 rounded-full ${
            darkMode
              ? 'bg-slate-700/50 text-slate-400'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {currentFact.category.charAt(0).toUpperCase() + currentFact.category.slice(1)}
          </span>
        </div>
      </motion.div>

      {/* Pulsing dots for additional visual feedback */}
      <div className="flex justify-center gap-2">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full ${
              darkMode ? 'bg-blue-400' : 'bg-blue-600'
            }`}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  )
}
