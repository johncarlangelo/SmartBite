'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Clock, Users, ChefHat, Flame, Search, Youtube, Sparkles, ExternalLink } from 'lucide-react'
import LoadingWithFacts from './LoadingWithFacts'

type RecipeData = {
  dishName: string
  cuisineType: string
  servings: number
  prepTime: number
  cookTime: number
  difficulty: string
  ingredients: { item: string; amount: string }[]
  instructions: string[]
  tips: string[]
  nutrition: {
    calories: number
    protein: string
    carbs: string
    fat: string
  }
}

type Props = {
  isOpen: boolean
  onClose: () => void
  dishName: string
  cuisineType: string
  darkMode: boolean
}

export default function RecipeModal({ isOpen, onClose, dishName, cuisineType, darkMode }: Props) {
  const [recipe, setRecipe] = useState<RecipeData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'recipe' | 'links'>('recipe')

  // Cache recipes in memory
  const cacheKey = `${dishName}-${cuisineType}`
  
  // Track ongoing generation request (persists across modal open/close)
  const generationPromiseRef = useState<{ current: Promise<void> | null }>(() => ({ current: null }))[0]
  
  useEffect(() => {
    if (isOpen) {
      if (!recipe) {
        // Check if recipe exists in localStorage cache
        const cached = localStorage.getItem(`recipe-${cacheKey}`)
        if (cached) {
          try {
            const cachedRecipe = JSON.parse(cached)
            console.log('📦 Loaded from cache:', cachedRecipe.dishName)
            console.log('📊 Cached nutrition data:', cachedRecipe.nutrition)
            
            // Normalize cached data to ensure consistency
            const normalizedCached = {
              ...cachedRecipe,
              nutrition: {
                calories: cachedRecipe.nutrition?.calories || 0,
                protein: cachedRecipe.nutrition?.protein || 'N/A',
                carbs: cachedRecipe.nutrition?.carbs || 'N/A',
                fat: cachedRecipe.nutrition?.fat || 'N/A'
              }
            }
            
            setRecipe(normalizedCached)
            setActiveTab('recipe')
          } catch (e) {
            console.error('❌ Cache parse error:', e)
            // If cache is invalid, generate new recipe
            generateRecipe()
          }
        } else {
          // Check if generation is already in progress
          if (generationPromiseRef.current) {
            console.log('🔄 Recipe generation already in progress...')
            setIsLoading(true)
          } else {
            generateRecipe()
          }
        }
      }
    }
  }, [isOpen, cacheKey])

  const generateRecipe = async () => {
    // Prevent duplicate requests
    if (generationPromiseRef.current) {
      console.log('⚠️ Recipe generation already in progress, skipping duplicate request')
      return
    }

    setIsLoading(true)
    setError(null)

    // Create the generation promise that continues in background
    const generationPromise = (async () => {
      try {
        console.log('🍳 Starting recipe generation in background...')
        const response = await fetch('/api/generate-recipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dishName, cuisineType })
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to generate recipe')
        }

        const data = await response.json()
        console.log('✅ Recipe generation complete!')
        console.log('📊 Recipe data received:', JSON.stringify(data.recipe, null, 2))
        
        // Validate and normalize nutrition data
        const normalizedRecipe = {
          ...data.recipe,
          nutrition: {
            calories: data.recipe.nutrition?.calories || 0,
            protein: data.recipe.nutrition?.protein || 'N/A',
            carbs: data.recipe.nutrition?.carbs || 'N/A',
            fat: data.recipe.nutrition?.fat || 'N/A'
          }
        }
        
        console.log('📊 Normalized nutrition:', normalizedRecipe.nutrition)
        
        // Update state (only if component is still mounted)
        setRecipe(normalizedRecipe)
        setActiveTab('recipe')
        setIsLoading(false)
        
        // Cache the recipe in localStorage (persists even if modal closed)
        localStorage.setItem(`recipe-${cacheKey}`, JSON.stringify(normalizedRecipe))
        console.log('💾 Recipe cached for future use')
        
        // Show notification if modal is closed
        if (!isOpen) {
          console.log('📬 Recipe ready! Open modal again to view.')
        }
      } catch (err: any) {
        console.error('❌ Recipe generation error:', err)
        setError(err.message || 'Unable to generate recipe. Please try external links.')
        setActiveTab('links')
        setIsLoading(false)
      } finally {
        generationPromiseRef.current = null // Clear the reference when done
        console.log('🏁 Recipe generation process finished')
      }
    })()

    // Store the promise so we can track ongoing generation
    generationPromiseRef.current = generationPromise
  }

  const handleExternalSearch = (type: 'google' | 'youtube' | 'allrecipes') => {
    const query = encodeURIComponent(`${dishName} recipe`)
    const urls = {
      google: `https://www.google.com/search?q=${query}`,
      youtube: `https://www.youtube.com/results?search_query=${query}`,
      allrecipes: `https://www.allrecipes.com/search?q=${query}`
    }
    window.open(urls[type], '_blank')
  }

  const handleClose = () => {
    if (isLoading && generationPromiseRef.current) {
      console.log('🔄 Modal closed - Recipe generation continues in background')
      console.log('💡 Recipe will be cached when complete and available on next open')
    }
    onClose()
    // Don't clear recipe or abort generation - keep it running in background
    // The generation will complete and cache the result for next time
  }

  if (!isOpen) return null

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden my-auto ${
          darkMode
            ? 'bg-gradient-to-br from-slate-900 to-slate-800'
            : 'bg-gradient-to-br from-white to-gray-50'
        }`}
      >
        {/* Header */}
        <div className={`sticky top-0 backdrop-blur-md p-6 z-10 ${
          darkMode ? 'bg-slate-900/95' : 'bg-white/95'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {dishName}
              </h2>
              <p className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {cuisineType} Cuisine
              </p>
            </div>
            <button
              onClick={handleClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('recipe')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === 'recipe'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : darkMode
                    ? 'bg-slate-800 text-slate-400 hover:text-white'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              AI Recipe
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === 'links'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : darkMode
                    ? 'bg-slate-800 text-slate-400 hover:text-white'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <Search className="w-4 h-4" />
              Find Online
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-6 pb-8 scrollbar-hide">
          {activeTab === 'recipe' && (
            <>
              {isLoading && (
                <LoadingWithFacts
                  darkMode={darkMode}
                  message="Creating your personalized recipe..."
                />
              )}

              {error && (
                <div className={`rounded-lg p-4 border ${
                  darkMode
                    ? 'bg-red-900/20 border-red-800 text-red-400'
                    : 'bg-red-50 border-red-200 text-red-600'
                }`}>
                  <p className="font-medium">{error}</p>
                  <button
                    onClick={generateRecipe}
                    className="mt-2 text-sm underline hover:no-underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {recipe && !isLoading && (
                <div className="space-y-6">
                  {/* Quick Info */}
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { icon: Clock, label: 'Prep Time', value: `${recipe.prepTime} min`, color: 'blue' },
                      { icon: Flame, label: 'Cook Time', value: `${recipe.cookTime} min`, color: 'orange' },
                      { icon: Users, label: 'Servings', value: recipe.servings, color: 'green' },
                      { icon: ChefHat, label: 'Difficulty', value: recipe.difficulty, color: 'purple' },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className={`rounded-lg p-4 text-center ${
                          darkMode ? 'bg-slate-800/50' : 'bg-gray-100'
                        }`}
                      >
                        <stat.icon className={`w-5 h-5 text-${stat.color}-400 mx-auto mb-2`} />
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                          {stat.label}
                        </p>
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Nutrition */}
                  <div className={`rounded-lg p-4 border ${
                    darkMode
                      ? 'bg-gradient-to-r from-orange-900/20 to-red-900/20 border-orange-800/30'
                      : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200'
                  }`}>
                    <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Nutrition (per serving)
                    </h3>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                          {recipe.nutrition?.calories || 0}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Calories</p>
                      </div>
                      <div>
                        <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {recipe.nutrition?.protein || 'N/A'}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Protein</p>
                      </div>
                      <div>
                        <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {recipe.nutrition?.carbs || 'N/A'}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Carbs</p>
                      </div>
                      <div>
                        <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {recipe.nutrition?.fat || 'N/A'}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Fat</p>
                      </div>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <h3 className={`font-semibold mb-3 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Ingredients
                    </h3>
                    <div className={`rounded-lg p-4 space-y-2 ${darkMode ? 'bg-slate-800/30' : 'bg-gray-100'}`}>
                      {recipe.ingredients && recipe.ingredients.length > 0 ? (
                        recipe.ingredients.map((ing, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${darkMode ? 'bg-blue-400' : 'bg-blue-600'}`} />
                            <p className={darkMode ? 'text-slate-300' : 'text-gray-700'}>
                              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {ing.amount}
                              </span>{' '}
                              {ing.item}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                          No ingredients available
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h3 className={`font-semibold mb-3 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Instructions
                    </h3>
                    <div className="space-y-4">
                      {recipe.instructions && recipe.instructions.length > 0 ? (
                        recipe.instructions.map((step, idx) => (
                          <div key={idx} className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                              {idx + 1}
                            </div>
                            <p className={`flex-1 pt-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                              {step}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                          No instructions available
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tips */}
                  {recipe.tips && recipe.tips.length > 0 && (
                    <div className={`rounded-lg p-4 border ${
                      darkMode
                        ? 'bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-800/30'
                        : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
                    }`}>
                      <h3 className={`font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <Sparkles className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                        Pro Tips
                      </h3>
                      <ul className="space-y-2">
                        {recipe.tips.map((tip, idx) => (
                          <li key={idx} className={`flex items-start gap-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                            <span className={darkMode ? 'text-purple-400' : 'text-purple-600'}>•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'links' && (
            <div className="space-y-4">
              <p className={`mb-6 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Find verified recipes and cooking videos from trusted sources:
              </p>

              <button
                onClick={() => handleExternalSearch('google')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 rounded-xl flex items-center gap-4 transition-all transform hover:scale-[1.02]"
              >
                <Search className="w-6 h-6 flex-shrink-0" />
                <div className="text-left flex-1">
                  <p className="font-semibold">Search on Google</p>
                  <p className="text-sm text-blue-200">Find recipes from across the web</p>
                </div>
                <ExternalLink className="w-5 h-5 flex-shrink-0" />
              </button>

              <button
                onClick={() => handleExternalSearch('youtube')}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-4 rounded-xl flex items-center gap-4 transition-all transform hover:scale-[1.02]"
              >
                <Youtube className="w-6 h-6 flex-shrink-0" />
                <div className="text-left flex-1">
                  <p className="font-semibold">Watch on YouTube</p>
                  <p className="text-sm text-red-200">Step-by-step video tutorials</p>
                </div>
                <ExternalLink className="w-5 h-5 flex-shrink-0" />
              </button>

              <button
                onClick={() => handleExternalSearch('allrecipes')}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white p-4 rounded-xl flex items-center gap-4 transition-all transform hover:scale-[1.02]"
              >
                <ChefHat className="w-6 h-6 flex-shrink-0" />
                <div className="text-left flex-1">
                  <p className="font-semibold">Browse AllRecipes</p>
                  <p className="text-sm text-orange-200">Community-rated recipes with reviews</p>
                </div>
                <ExternalLink className="w-5 h-5 flex-shrink-0" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Render modal using portal to escape parent DOM hierarchy
  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null
}
