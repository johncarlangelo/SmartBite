'use client'

import { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import { Camera, Upload, Eye, Salad, Gauge, ChefHat, WifiOff, Wifi, Moon, Sun, Save, History, Trash2, X } from 'lucide-react'
import { motion, useInView } from 'motion/react'

type Nutrition = {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

type AnalysisResult = {
  dishName: string
  cuisineType: string
  ingredients: string[]
  nutrition: Nutrition
  recipe: {
    servings: number
    prepMinutes: number
    cookMinutes: number
    steps: string[]
  }
}

type SavedAnalysis = AnalysisResult & {
  id: string
  savedAt: string
  imageUrl: string
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [fileObj, setFileObj] = useState<File | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [offline, setOffline] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [progress, setProgress] = useState(0)
  const [analysisStage, setAnalysisStage] = useState('')
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isFromHistory, setIsFromHistory] = useState(false) // ADDED: Track if result is from history

  // Animated Item Component
  const AnimatedHistoryItem = ({ children, delay = 0, index }: { children: React.ReactNode; delay?: number; index: number }) => {
    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref, { amount: 0.3, once: false })
    return (
      <motion.div
        ref={ref}
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={inView ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.8, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, delay: delay + index * 0.05 }}
      >
        {children}
      </motion.div>
    )
  }

  // Animated Section Component for Results
  const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref, { amount: 0.4, once: false })
    return (
      <motion.div
        ref={ref}
        initial={{ scale: 0.9, opacity: 0, x: -30 }}
        animate={inView ? { scale: 1, opacity: 1, x: 0 } : { scale: 0.9, opacity: 0, x: -30 }}
        transition={{ duration: 0.4, delay }}
      >
        {children}
      </motion.div>
    )
  }

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark')
    }
    
    // Load saved analyses
    const saved = localStorage.getItem('savedAnalyses')
    if (saved) {
      setSavedAnalyses(JSON.parse(saved))
    }
    
    // Load unread count
    const unread = localStorage.getItem('unreadCount')
    if (unread) {
      setUnreadCount(parseInt(unread))
    }
  }, [])

  // Save theme preference
  const toggleTheme = () => {
    const newTheme = !darkMode
    setDarkMode(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  const onFilesSelected = useCallback((file: File | undefined) => {
    if (!file) return
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      setError('Unsupported file type. Please upload PNG or JPG/JPEG.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string)
      setResult(null)
      setError(null)
      setFileObj(file)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    onFilesSelected(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    onFilesSelected(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
  }

  // ADDED: Progress simulation effect
  useEffect(() => {
    if (!isAnalyzing) {
      setProgress(0)
      setAnalysisStage('')
      return
    }

    const stages = [
      { progress: 20, stage: 'Processing image...', duration: 1000 },
      { progress: 40, stage: 'Identifying dish...', duration: 2000 },
      { progress: 60, stage: 'Analyzing ingredients...', duration: 2000 },
      { progress: 80, stage: 'Calculating nutrition...', duration: 1500 },
      { progress: 95, stage: 'Generating recipe...', duration: 1000 },
    ]

    let currentStageIndex = 0
    let timeoutId: NodeJS.Timeout

    const advanceStage = () => {
      if (currentStageIndex < stages.length) {
        const { progress, stage, duration } = stages[currentStageIndex]
        setProgress(progress)
        setAnalysisStage(stage)
        currentStageIndex++
        timeoutId = setTimeout(advanceStage, duration)
      }
    }

    advanceStage()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isAnalyzing])

  const analyzeImage = async () => {
    if (!fileObj) return
    setIsAnalyzing(true)
    setError(null)
    setProgress(0)
    setIsFromHistory(false) // ADDED: Reset history flag
    try {
      const form = new FormData()
      form.append('image', fileObj)
      form.append('offline', String(offline))
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: form,
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Failed to analyze image')
      // ADDED: Complete progress before showing results
      setProgress(100)
      setAnalysisStage('Complete!')
      setTimeout(() => {
        setResult(data as AnalysisResult)
      }, 500)
    } catch (err: any) {
      setError(err?.message || 'Error analyzing image. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const saveAnalysis = () => {
    if (!result || !selectedImage || isFromHistory) return
    
    // Check if already saved (prevent duplicates)
    const alreadySaved = savedAnalyses.some(saved => 
      saved.dishName === result.dishName && 
      saved.imageUrl === selectedImage
    )
    
    if (alreadySaved) {
      setSavedSuccess(true)
      return
    }
    
    const newSave: SavedAnalysis = {
      ...result,
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
      imageUrl: selectedImage
    }
    
    const updated = [newSave, ...savedAnalyses]
    setSavedAnalyses(updated)
    localStorage.setItem('savedAnalyses', JSON.stringify(updated))
    
    // Increment unread count
    const newUnreadCount = unreadCount + 1
    setUnreadCount(newUnreadCount)
    localStorage.setItem('unreadCount', newUnreadCount.toString())
    
    setSavedSuccess(true)
  }

  const loadSavedAnalysis = (saved: SavedAnalysis) => {
    setSelectedImage(saved.imageUrl)
    setResult({
      dishName: saved.dishName,
      cuisineType: saved.cuisineType,
      ingredients: saved.ingredients,
      nutrition: saved.nutrition,
      recipe: saved.recipe
    })
    setIsFromHistory(true)
    setShowHistory(false)
  }

  const deleteSavedAnalysis = (id: string) => {
    const updated = savedAnalyses.filter(s => s.id !== id)
    setSavedAnalyses(updated)
    localStorage.setItem('savedAnalyses', JSON.stringify(updated))
  }

  const handleOpenHistory = () => {
    setShowHistory(true)
    // Clear unread count when opening history
    setUnreadCount(0)
    localStorage.setItem('unreadCount', '0')
  }

  const handleCloseHistory = () => {
    setShowHistory(false)
  }

  const headerTitle = useMemo(() => '🍽️ SmartBite', [])
  const headerSubtitle = useMemo(() => 'Identify dishes, ingredients, nutrition, and recipes from a photo', [])

  // Theme classes
  const bgClass = darkMode 
    ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
    : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
  
  const textClass = darkMode ? 'text-white' : 'text-gray-900'
  const textSecondaryClass = darkMode ? 'text-gray-300' : 'text-gray-600'
  const cardClass = darkMode 
    ? 'bg-slate-800/50 backdrop-blur-xl border-slate-700/50' 
    : 'bg-white/80 backdrop-blur-xl border-gray-200'
  
  const buttonPrimaryClass = darkMode
    ? 'bg-blue-600 hover:bg-blue-700 text-white'
    : 'bg-blue-500 hover:bg-blue-600 text-white'

  return (
    <main className={`min-h-screen ${bgClass} p-6 sm:p-8 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-10 sm:mb-12 ${textClass}`}>
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl sm:text-6xl font-bold drop-shadow-md">{headerTitle}</h1>
            <div className="flex gap-2">
              <button
                onClick={handleOpenHistory}
                className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white hover:bg-gray-100'} border ${darkMode ? 'border-slate-600' : 'border-gray-200'} shadow-lg transition-all relative`}
                aria-label="View history"
              >
                <History size={24} className={darkMode ? 'text-blue-400' : 'text-blue-500'} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={toggleTheme}
                className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white hover:bg-gray-100'} border ${darkMode ? 'border-slate-600' : 'border-gray-200'} shadow-lg transition-all`}
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24} className="text-slate-700" />}
              </button>
            </div>
          </div>
          <p className={`text-base sm:text-xl ${textSecondaryClass}`}>{headerSubtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Upload Panel */}
          <div className={`${cardClass} rounded-2xl p-6 sm:p-8 border shadow-2xl transition-colors duration-300`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-[20px] font-bold ${textClass}`}>Upload Dish Photo</h2>
              <button
                onClick={() => setOffline((v) => !v)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm ${
                  darkMode 
                    ? 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                } border`}
                title={offline ? 'Using local Ollama model' : 'Using online model'}
              >
                {offline ? <WifiOff size={18} /> : <Wifi size={18} />}
                <span className="hidden text-sm sm:inline">{offline ? 'Offline Mode' : 'Online Mode'}</span>
              </button>
            </div>

            <div className="space-y-5">
              <label
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  darkMode 
                    ? 'border-slate-600 hover:border-blue-500 hover:bg-slate-700/30' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt="Selected"
                      className="max-h-56 max-w-full rounded-xl shadow-2xl object-contain"
                    />
                  ) : (
                    <>
                      <div className={`p-4 rounded-full mb-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                        <Upload className={`w-12 h-12 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                      </div>
                      <p className={`mb-2 text-base font-medium ${textClass}`}>
                        <span className="font-semibold">Click to upload</span> or drag & drop
                      </p>
                      <p className={`text-sm ${textSecondaryClass}`}>PNG, JPG or JPEG (Max 10MB)</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg"
                  onChange={handleFileInput}
                />
              </label>

              {selectedImage && !result && !error && (
                <button
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  className={`w-full flex items-center justify-center gap-3 ${buttonPrimaryClass} disabled:bg-gray-400 disabled:cursor-not-allowed px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]`}
                >
                  <Eye size={22} />
                  <span className="text-lg">{isAnalyzing ? 'Analyzing...' : 'Analyze Image'}</span>
                </button>
              )}

              {error && (
                <button
                  onClick={() => {
                    setSelectedImage(null)
                    setFileObj(null)
                    setError(null)
                  }}
                  className={`w-full flex items-center justify-center gap-3 ${buttonPrimaryClass} px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]`}
                >
                  <Upload size={22} />
                  <span className="text-lg">Upload Another Image</span>
                </button>
              )}

              {result && (
                <button
                  onClick={() => {
                    setSelectedImage(null)
                    setFileObj(null)
                    setResult(null)
                    setError(null)
                    setIsFromHistory(false)
                    setSavedSuccess(false) // ADDED: Reset saved status
                  }}
                  className={`w-full flex items-center justify-center gap-3 ${buttonPrimaryClass} px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]`}
                >
                  <Upload size={22} />
                  <span className="text-lg">Upload Another Dish</span>
                </button>
              )}

              {error && (
                <div className={`${darkMode ? 'text-red-200 bg-red-900/30 border-red-500/40' : 'text-red-700 bg-red-50 border-red-300'} border rounded-xl p-4 font-medium`}>
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className={`${cardClass} lg:col-span-2 rounded-2xl p-6 sm:p-8 border shadow-2xl transition-colors duration-300`}>
            <h2 className={`text-[20px] font-bold ${textClass} mb-6`}>Results</h2>

            {!result && !isAnalyzing && !error && (
              <div className={`text-center ${textSecondaryClass} py-16`}>
                <div className={`p-6 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-gray-100'} inline-block mb-4`}>
                  <Camera size={56} className={darkMode ? 'text-slate-400' : 'text-gray-400'} />
                </div>
                <p className="text-lg">Upload an image and click "Analyze" to see AI-powered insights.</p>
              </div>
            )}

            {/* MODIFIED: Enhanced analyzing state with progress bar */}
            {isAnalyzing && (
              <div className={`text-center ${textClass} py-12`}>
                <div className="relative inline-block mb-6">
                  <Eye className="mx-auto animate-pulse" size={64} />
                  <div className={`absolute -bottom-2 -right-2 ${darkMode ? 'bg-blue-500' : 'bg-blue-600'} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                    {progress}%
                  </div>
                </div>
                
                <p className="text-xl font-bold mb-2">{analysisStage || 'Starting analysis...'}</p>
                <p className={`text-sm ${textSecondaryClass} mb-6`}>Estimated time: ~20 seconds</p>
                
                {/* Progress Bar */}
                <div className={`w-full ${darkMode ? 'bg-slate-700' : 'bg-gray-200'} rounded-full h-3 overflow-hidden shadow-inner`}>
                  <div 
                    className={`h-full ${darkMode ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-blue-400 to-blue-500'} rounded-full transition-all duration-500 ease-out relative`}
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                
                {/* Analysis Steps Indicator */}
                <div className="mt-8 flex justify-center gap-2">
                  {[20, 40, 60, 80, 95].map((step, idx) => (
                    <div
                      key={idx}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        progress >= step
                          ? darkMode ? 'bg-blue-500 scale-110' : 'bg-blue-600 scale-110'
                          : darkMode ? 'bg-slate-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {result && (
              <>
                {/* MODIFIED: Save Button section to hide when saved or from history */}
                {result && !isFromHistory && !savedSuccess && (
                  <button
                    onClick={saveAnalysis}
                    className={`w-full flex items-center justify-center gap-3 mb-5 ${buttonPrimaryClass} px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    <Save size={20} />
                    <span>Save to History</span>
                  </button>
                )}

                {savedSuccess && !isFromHistory && (
                  <div className={`w-full flex items-center justify-center gap-3 mb-5 ${darkMode ? 'bg-green-600' : 'bg-green-500'} px-6 py-3 rounded-xl font-semibold text-white`}>
                    <Save size={20} />
                    <span>Saved to History!</span>
                  </div>
                )}

                <div className="space-y-5 max-h-[550px] overflow-y-auto custom-scrollbar pr-2">
                  {/* Dish Overview */}
                  <AnimatedSection delay={0.1}>
                    <section className={`${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'} rounded-xl p-5 border ${darkMode ? 'border-slate-600' : 'border-gray-200'} shadow-sm`}>
                      <div className={`flex items-center gap-2 ${textClass} mb-3`}>
                        <Salad size={20} />
                        <h3 className="text-lg font-bold">Dish Overview</h3>
                      </div>
                      <p className={`${textClass} text-2xl font-bold mb-1`}>{result.dishName}</p>
                      <p className={textSecondaryClass}>Cuisine: <span className="font-medium">{result.cuisineType}</span></p>
                    </section>
                  </AnimatedSection>

                  {/* Ingredients */}
                  <AnimatedSection delay={0.2}>
                    <section className={`${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'} rounded-xl p-5 border ${darkMode ? 'border-slate-600' : 'border-gray-200'} shadow-sm`}>
                      <div className={`flex items-center gap-2 ${textClass} mb-3`}>
                        <Salad size={20} />
                        <h3 className="text-lg font-bold">Ingredients</h3>
                      </div>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {result.ingredients.map((ing, idx) => (
                          <li key={idx} className={`${textSecondaryClass} font-medium`}>• {ing}</li>
                        ))}
                      </ul>
                    </section>
                  </AnimatedSection>

                  {/* Nutrition */}
                  <AnimatedSection delay={0.3}>
                    <section className={`${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'} rounded-xl p-5 border ${darkMode ? 'border-slate-600' : 'border-gray-200'} shadow-sm`}>
                      <div className={`flex items-center gap-2 ${textClass} mb-3`}>
                        <Gauge size={20} />
                        <h3 className="text-lg font-bold">Nutritional Facts</h3>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className={`${darkMode ? 'bg-slate-600/50' : 'bg-white'} rounded-lg p-4 text-center shadow-sm border ${darkMode ? 'border-slate-500' : 'border-gray-200'}`}>
                          <div className={`text-3xl font-bold ${textClass}`}>{Math.round(result.nutrition.calories)}</div>
                          <div className={`${textSecondaryClass} text-sm font-medium mt-1`}>Calories</div>
                        </div>
                        <div className={`${darkMode ? 'bg-slate-600/50' : 'bg-white'} rounded-lg p-4 text-center shadow-sm border ${darkMode ? 'border-slate-500' : 'border-gray-200'}`}>
                          <div className={`text-3xl font-bold ${textClass}`}>{Math.round(result.nutrition.protein_g)}g</div>
                          <div className={`${textSecondaryClass} text-sm font-medium mt-1`}>Protein</div>
                        </div>
                        <div className={`${darkMode ? 'bg-slate-600/50' : 'bg-white'} rounded-lg p-4 text-center shadow-sm border ${darkMode ? 'border-slate-500' : 'border-gray-200'}`}>
                          <div className={`text-3xl font-bold ${textClass}`}>{Math.round(result.nutrition.carbs_g)}g</div>
                          <div className={`${textSecondaryClass} text-sm font-medium mt-1`}>Carbs</div>
                        </div>
                        <div className={`${darkMode ? 'bg-slate-600/50' : 'bg-white'} rounded-lg p-4 text-center shadow-sm border ${darkMode ? 'border-slate-500' : 'border-gray-200'}`}>
                          <div className={`text-3xl font-bold ${textClass}`}>{Math.round(result.nutrition.fat_g)}g</div>
                          <div className={`${textSecondaryClass} text-sm font-medium mt-1`}>Fat</div>
                        </div>
                      </div>
                    </section>
                  </AnimatedSection>

                  {/* Recipe */}
                  <AnimatedSection delay={0.4}>
                    <section className={`${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'} rounded-xl p-5 border ${darkMode ? 'border-slate-600' : 'border-gray-200'} shadow-sm`}>
                      <div className={`flex items-center gap-2 ${textClass} mb-3`}>
                        <ChefHat size={20} />
                        <h3 className="text-lg font-bold">Recipe Guide</h3>
                      </div>
                      <p className={`${textSecondaryClass} mb-3 font-medium`}>
                        Servings: {result.recipe.servings} • Prep: {result.recipe.prepMinutes}m • Cook: {result.recipe.cookMinutes}m
                      </p>
                      <ol className={`list-decimal list-inside space-y-2 ${textSecondaryClass}`}>
                        {result.recipe.steps.map((step, idx) => (
                          <li key={idx} className="leading-relaxed">{step}</li>
                        ))}
                      </ol>
                    </section>
                  </AnimatedSection>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-10 sm:mt-12 text-center">
          <div className={`${cardClass} rounded-2xl p-6 sm:p-8 border shadow-lg transition-colors duration-300`}>
            <h3 className={`text-2xl font-bold ${textClass} mb-2`}>Built for the OpenxAI Global Accelerator 2025</h3>
            <p className={textSecondaryClass}>Runs with local Ollama for offline capability. Toggle modes to fit your environment.</p>
          </div>
        </footer>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCloseHistory}
        >
          <div 
            className={`${cardClass} rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto border shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${textClass} flex items-center gap-2`}>
                <History size={28} />
                Saved Analyses ({savedAnalyses.length})
              </h2>
              <button
                onClick={handleCloseHistory}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <X size={24} className={textClass} />
              </button>
            </div>

            {savedAnalyses.length === 0 ? (
              <div className={`text-center ${textSecondaryClass} py-12`}>
                <History size={48} className="mx-auto mb-4 opacity-50" />
                <p>No saved analyses yet. Analyze a dish and save it!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                {savedAnalyses.map((saved, index) => (
                  <AnimatedHistoryItem key={saved.id} index={index} delay={0.1}>
                    <div
                      className={`${darkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100'} rounded-xl p-4 border ${darkMode ? 'border-slate-600' : 'border-gray-200'} transition-all cursor-pointer group`}
                    >
                      <div className="flex gap-4">
                        <img
                          src={saved.imageUrl}
                          alt={saved.dishName}
                          className="w-32 h-32 object-cover rounded-lg shadow-md"
                        />
                        <div className="flex-1">
                          <h3 className={`${textClass} font-bold mb-1 text-xl`}>{saved.dishName}</h3>
                          <p className={`${textSecondaryClass} text-md mb-2`}>
                            {new Date(saved.savedAt).toLocaleDateString()} at {new Date(saved.savedAt).toLocaleTimeString()}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => loadSavedAnalysis(saved)}
                              className={`text-md px-4 py-2 rounded-lg mt-2 ${buttonPrimaryClass} transition-all font-medium`}
                            >
                              View
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteSavedAnalysis(saved.id)
                              }}
                              className={`text-md px-4 py-2 rounded-lg mt-2 ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white transition-all font-medium flex items-center gap-1`}
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AnimatedHistoryItem>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${darkMode ? '#1e293b' : '#f1f5f9'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#475569' : '#cbd5e1'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#64748b' : '#94a3b8'};
        }
      `}</style>
    </main>
  )
}