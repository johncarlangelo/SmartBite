'use client'

import { motion } from 'framer-motion'

interface SkeletonCardProps {
  darkMode?: boolean
  type?: 'dish-info' | 'nutrition' | 'ingredients' | 'recipe' | 'recommendation'
  className?: string
}

export default function SkeletonCard({ 
  darkMode = true, 
  type = 'dish-info',
  className = ''
}: SkeletonCardProps) {
  const baseClass = `animate-pulse rounded-xl ${
    darkMode ? 'bg-slate-700/50' : 'bg-gray-200'
  }`

  const shimmerClass = darkMode 
    ? 'bg-gradient-to-r from-slate-700/50 via-slate-600/50 to-slate-700/50' 
    : 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200'

  // Animated shimmer effect
  const ShimmerLine = ({ width = 'w-full', height = 'h-4', className = '' }) => (
    <div className={`${width} ${height} ${baseClass} overflow-hidden ${className}`}>
      <motion.div
        className={`h-full ${shimmerClass}`}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )

  if (type === 'dish-info') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-10 lg:p-16 space-y-8 ${className}`}
      >
        {/* Title and Cuisine */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <ShimmerLine width="w-2/3" height="h-10" />
            <ShimmerLine width="w-1/3" height="h-6" />
          </div>
          <div className={`w-12 h-12 rounded-xl ${baseClass}`} />
        </div>
      </motion.div>
    )
  }

  if (type === 'nutrition') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`space-y-6 ${className}`}
      >
        <ShimmerLine width="w-1/3" height="h-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`p-6 rounded-xl ${baseClass} space-y-3`}>
              <div className={`w-8 h-8 rounded-full ${baseClass}`} />
              <ShimmerLine width="w-3/4" height="h-4" />
              <ShimmerLine width="w-1/2" height="h-6" />
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  if (type === 'ingredients') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`space-y-6 ${className}`}
      >
        <ShimmerLine width="w-1/3" height="h-8" />
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div 
              key={i} 
              className={`px-5 py-3 rounded-xl ${baseClass}`}
              style={{ width: `${80 + Math.random() * 60}px` }}
            />
          ))}
        </div>
      </motion.div>
    )
  }

  if (type === 'recipe') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`space-y-6 ${className}`}
      >
        <ShimmerLine width="w-1/3" height="h-8" />
        
        {/* Recipe info badges */}
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`px-5 py-3 rounded-lg ${baseClass} w-32`} />
          ))}
        </div>

        {/* Recipe steps */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4">
              <div className={`w-8 h-8 rounded-full flex-shrink-0 ${baseClass}`} />
              <ShimmerLine 
                width={`w-${Math.random() > 0.5 ? 'full' : '3/4'}`} 
                height="h-8" 
              />
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  if (type === 'recommendation') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-6 rounded-2xl ${
          darkMode
            ? 'bg-slate-800/50 border border-slate-700/50'
            : 'bg-white border border-gray-200'
        } ${className}`}
      >
        {/* Image skeleton */}
        <div className={`w-full h-48 rounded-xl mb-4 ${baseClass}`} />
        
        {/* Title */}
        <ShimmerLine width="w-3/4" height="h-6" className="mb-3" />
        
        {/* Cuisine badge */}
        <ShimmerLine width="w-1/2" height="h-4" className="mb-4" />
        
        {/* Description lines */}
        <div className="space-y-2 mb-4">
          <ShimmerLine width="w-full" height="h-4" />
          <ShimmerLine width="w-5/6" height="h-4" />
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${baseClass}`} />
              <ShimmerLine width="w-12" height="h-4" />
            </div>
          ))}
        </div>

        {/* Button */}
        <div className={`w-full h-10 rounded-lg ${baseClass}`} />
      </motion.div>
    )
  }

  // Default skeleton
  return (
    <div className={`${baseClass} ${className}`}>
      <ShimmerLine />
    </div>
  )
}

// Skeleton Grid for multiple cards
export function SkeletonGrid({ 
  count = 3, 
  type = 'recommendation',
  darkMode = true 
}: { 
  count?: number
  type?: SkeletonCardProps['type']
  darkMode?: boolean 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} type={type} darkMode={darkMode} />
      ))}
    </div>
  )
}

// Skeleton for Results Page
export function ResultsSkeleton({ darkMode = true }: { darkMode?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className={`backdrop-blur-2xl rounded-3xl border ${
        darkMode
          ? 'bg-slate-800/40 border-slate-700/50'
          : 'bg-white/80 border-gray-200'
      }`}
    >
      <SkeletonCard type="dish-info" darkMode={darkMode} />
      <div className="px-10 lg:px-16 pb-10 lg:pb-16 space-y-8">
        <SkeletonCard type="nutrition" darkMode={darkMode} />
        <SkeletonCard type="ingredients" darkMode={darkMode} />
        <SkeletonCard type="recipe" darkMode={darkMode} />
      </div>
    </motion.div>
  )
}
