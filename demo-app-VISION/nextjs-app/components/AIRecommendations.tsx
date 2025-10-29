'use client'

import { motion, AnimatePresence } from 'motion/react'
import { useState, useEffect, useRef, memo } from 'react'
import { Sparkles, TrendingUp, Calendar, Wine, Loader2, ChevronRight, Star, Flame, Clock, Award } from 'lucide-react'
import RecipeModal from './RecipeModal'
import LoadingWithFacts from './LoadingWithFacts'
import { SkeletonGrid } from './SkeletonCard'

type Nutrition = {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

type DishAnalysis = {
  dishName: string
  cuisineType: string
  ingredients: string[]
  nutrition: Nutrition
}

type Recommendation = {
  dishName: string
  cuisineType: string
  description: string
  reason: string
  estimatedCalories: number
  estimatedPrepTime: number
  isHealthier?: boolean
  matchScore?: number
}

type RecommendationCategory = {
  id: string
  title: string
  icon: JSX.Element
  color: string
  gradient: string
  description: string
}

type AIRecommendationsProps = {
  currentDish?: DishAnalysis
  darkMode: boolean
  offline?: boolean
  preloadedData?: {
    similar: any[]
    healthier: any[]
    seasonal: any[]
    pairing: any[]
  } | null
}

type CategoryRecommendations = {
  [key: string]: {
    recommendations: Recommendation[]
    isLoading: boolean
    error: string | null
    isLoaded: boolean
  }
}

const AIRecommendations = memo(function AIRecommendations({ currentDish, darkMode, offline = false, preloadedData }: AIRecommendationsProps) {
  const [activeCategory, setActiveCategory] = useState<string>('similar')
  const [categoryData, setCategoryData] = useState<CategoryRecommendations>({
    similar: { recommendations: [], isLoading: false, error: null, isLoaded: false },
    healthier: { recommendations: [], isLoading: false, error: null, isLoaded: false },
    seasonal: { recommendations: [], isLoading: false, error: null, isLoaded: false },
    pairing: { recommendations: [], isLoading: false, error: null, isLoaded: false },
  })
  const [isVisible, setIsVisible] = useState(false)
  const [selectedDish, setSelectedDish] = useState<{ name: string; cuisine: string } | null>(null)
  const hasLoadedRef = useRef(false) // Prevent multiple loads

  const categories: RecommendationCategory[] = [
    {
      id: 'similar',
      title: 'Related Dishes',
      icon: <Sparkles size={20} />,
      color: darkMode ? 'text-purple-400' : 'text-purple-600',
      gradient: 'from-purple-500 to-pink-500',
      description: 'You might also like'
    },
    {
      id: 'healthier',
      title: 'Healthier Alternatives',
      icon: <TrendingUp size={20} />,
      color: darkMode ? 'text-green-400' : 'text-green-600',
      gradient: 'from-green-500 to-emerald-500',
      description: 'Better for you'
    },
    {
      id: 'seasonal',
      title: 'Seasonal Picks',
      icon: <Calendar size={20} />,
      color: darkMode ? 'text-orange-400' : 'text-orange-600',
      gradient: 'from-orange-500 to-amber-500',
      description: 'Perfect for this season'
    },
    {
      id: 'pairing',
      title: 'Perfect Pairings',
      icon: <Wine size={20} />,
      color: darkMode ? 'text-blue-400' : 'text-blue-600',
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Complement your dish'
    },
  ]

  // Use preloaded data if available, otherwise load on-demand
  // Using useRef to prevent multiple executions on re-renders
  useEffect(() => {
    setIsVisible(true)
    
    // Prevent loading if already loaded (critical for preventing duplicate requests)
    if (hasLoadedRef.current) {
      console.log('✓ Recommendations already processed, skipping duplicate load')
      return
    }
    
    if (preloadedData && preloadedData.similar && preloadedData.healthier && preloadedData.seasonal && preloadedData.pairing) {
      // Use preloaded data from parent component
      console.log('✓ Using preloaded recommendations data (no API calls needed)')
      setCategoryData({
        similar: {
          recommendations: preloadedData.similar,
          isLoading: false,
          error: null,
          isLoaded: true
        },
        healthier: {
          recommendations: preloadedData.healthier,
          isLoading: false,
          error: null,
          isLoaded: true
        },
        seasonal: {
          recommendations: preloadedData.seasonal,
          isLoading: false,
          error: null,
          isLoaded: true
        },
        pairing: {
          recommendations: preloadedData.pairing,
          isLoading: false,
          error: null,
          isLoaded: true
        }
      })
      hasLoadedRef.current = true
    } else if (currentDish && !hasLoadedRef.current) {
      // Fallback: Load on-demand if no preloaded data (shouldn't happen normally)
      console.log('⚠️ No preloaded data available, loading recommendations on-demand...')
      hasLoadedRef.current = true
      loadAllRecommendations()
    }
  }, [preloadedData])

  const loadAllRecommendations = async () => {
    // Load all categories in parallel
    const categoriesToLoad = ['similar', 'healthier', 'seasonal', 'pairing']
    
    await Promise.all(
      categoriesToLoad.map(category => loadRecommendations(category))
    )
  }

  const loadRecommendations = async (category: string) => {
    // Update loading state for this category
    setCategoryData(prev => ({
      ...prev,
      [category]: { ...prev[category], isLoading: true, error: null }
    }))

    try {
      // Prepare request body based on category
      const requestBody: any = {
        type: category,
        offline: offline,
        month: new Date().getMonth() + 1
      }

      if ((category === 'healthier' || category === 'pairing') && currentDish) {
        requestBody.currentDish = currentDish
      }

      // Don't make request if we don't have required data
      if ((category === 'healthier' || category === 'pairing') && !currentDish) {
        setCategoryData(prev => ({
          ...prev,
          [category]: {
            recommendations: [],
            error: 'Analyze a dish first to see this category!',
            isLoading: false,
            isLoaded: true
          }
        }))
        return
      }

      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get recommendations')
      }

      setCategoryData(prev => ({
        ...prev,
        [category]: {
          recommendations: data.recommendations || [],
          error: null,
          isLoading: false,
          isLoaded: true
        }
      }))
    } catch (err: any) {
      console.error('Recommendations error:', err)
      setCategoryData(prev => ({
        ...prev,
        [category]: {
          recommendations: [],
          error: err.message || 'Failed to load recommendations',
          isLoading: false,
          isLoaded: true
        }
      }))
    }
  }

  const currentData = categoryData[activeCategory]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className={`text-2xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <Sparkles className={darkMode ? 'text-yellow-400' : 'text-yellow-600'} size={28} />
          AI Recommendations
        </h3>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-xl transition-all border-2 ${
              activeCategory === category.id
                ? `bg-gradient-to-r ${category.gradient} text-white border-transparent shadow-lg`
                : darkMode
                  ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600 text-gray-300'
                  : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {category.icon}
              <span className="font-semibold text-sm">{category.title}</span>
            </div>
            <p className={`text-xs ${activeCategory === category.id ? 'text-white/90' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {category.description}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Recommendations Display */}
      <AnimatePresence mode="wait">
        {currentData.isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <LoadingWithFacts
              darkMode={darkMode}
              message="Discovering delicious recommendations..."
            />
            <SkeletonGrid count={3} type="recommendation" darkMode={darkMode} />
          </motion.div>
        ) : currentData.error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`p-6 rounded-xl border-2 ${
              darkMode
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-red-50 border-red-200 text-red-600'
            }`}
          >
            <p className="font-medium">{currentData.error}</p>
          </motion.div>
        ) : currentData.recommendations.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
          >
            <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
            <p>No recommendations available yet.</p>
          </motion.div>
        ) : (
          <motion.div
            key={`recommendations-${activeCategory}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Recommendations Grid */}
            {currentData.recommendations.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentData.recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className={`p-5 rounded-xl transition-all flex flex-col ${
                  darkMode
                    ? 'bg-slate-800/50 border border-slate-700 hover:bg-slate-800'
                    : 'bg-white border border-gray-200 hover:shadow-lg'
                }`}
              >
                {/* Header with match score or healthier badge */}
                <div className="flex items-start justify-between mb-3">
                  <h4 className={`font-bold text-lg flex-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {rec.dishName}
                  </h4>
                  {rec.matchScore !== undefined && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ${
                      darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'
                    }`}>
                      <Star size={12} />
                      {rec.matchScore}%
                    </div>
                  )}
                  {rec.isHealthier && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ${
                      darkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                    }`}>
                      <TrendingUp size={12} />
                      Healthier
                    </div>
                  )}
                </div>

                {/* Cuisine badge */}
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                  darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                }`}>
                  {rec.cuisineType}
                </div>

                {/* Description */}
                <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {rec.description}
                </p>

                {/* Reason */}
                <div className={`p-3 rounded-lg mb-4 ${
                  darkMode ? 'bg-slate-900/50' : 'bg-gray-50'
                }`}>
                  <p className={`text-xs flex items-start gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Award size={14} className="flex-shrink-0 mt-0.5" />
                    <span>{rec.reason}</span>
                  </p>
                </div>

                {/* Stats - Fixed height container */}
                <div className="flex items-center justify-between text-xs mt-auto pt-3">
                  <div className={`flex items-center gap-1 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                    <Flame size={14} />
                    <span className="font-semibold">{rec.estimatedCalories} cal</span>
                  </div>
                  <div className={`flex items-center gap-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    <Clock size={14} />
                    <span className="font-semibold">{rec.estimatedPrepTime} min</span>
                  </div>
                </div>

                {/* View details button - Consistent position */}
                <button
                  onClick={() => setSelectedDish({ name: rec.dishName, cuisine: rec.cuisineType })}
                  className={`mt-3 w-full py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-1 ${
                    darkMode
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                  }`}
                >
                  Learn More
                  <ChevronRight size={16} />
                </button>
              </motion.div>
            ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recipe Modal */}
      {selectedDish && (
        <RecipeModal
          isOpen={selectedDish !== null}
          onClose={() => setSelectedDish(null)}
          dishName={selectedDish.name}
          cuisineType={selectedDish.cuisine}
          darkMode={darkMode}
        />
      )}
    </div>
  )
})

export default AIRecommendations
