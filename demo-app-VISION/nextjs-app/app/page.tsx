'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'
import { Camera, Upload, Eye, Salad, Gauge, ChefHat, WifiOff, Wifi, Moon, Sun } from 'lucide-react'

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

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [fileObj, setFileObj] = useState<File | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [offline, setOffline] = useState(true)
  const [darkMode, setDarkMode] = useState(true)

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark')
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

  const analyzeImage = async () => {
    if (!fileObj) return
    setIsAnalyzing(true)
    setError(null)
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
      setResult(data as AnalysisResult)
    } catch (err: any) {
      setError(err?.message || 'Error analyzing image. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
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
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white hover:bg-gray-100'} border ${darkMode ? 'border-slate-600' : 'border-gray-200'} shadow-lg transition-all`}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24} className="text-slate-700" />}
            </button>
          </div>
          <p className={`text-base sm:text-xl ${textSecondaryClass}`}>{headerSubtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Upload Panel */}
          <div className={`${cardClass} rounded-2xl p-6 sm:p-8 border shadow-2xl transition-colors duration-300`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${textClass}`}>Upload Dish Photo</h2>
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
                <span className="hidden sm:inline">{offline ? 'Offline Mode' : 'Online Mode'}</span>
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

              {selectedImage && (
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
                <div className={`${darkMode ? 'text-red-200 bg-red-900/30 border-red-500/40' : 'text-red-700 bg-red-50 border-red-300'} border rounded-xl p-4 font-medium`}>
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className={`${cardClass} rounded-2xl p-6 sm:p-8 border shadow-2xl transition-colors duration-300`}>
            <h2 className={`text-2xl font-bold ${textClass} mb-6`}>Results</h2>

            {!result && !isAnalyzing && !error && (
              <div className={`text-center ${textSecondaryClass} py-16`}>
                <div className={`p-6 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-gray-100'} inline-block mb-4`}>
                  <Camera size={56} className={darkMode ? 'text-slate-400' : 'text-gray-400'} />
                </div>
                <p className="text-lg">Upload an image and click "Analyze" to see AI-powered insights.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className={`text-center ${textClass} py-16 animate-pulse`}>
                <Eye className="mx-auto mb-4" size={56} />
                <p className="text-xl font-medium">Analyzing your dish...</p>
              </div>
            )}

            {result && (
              <div className="space-y-5 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                {/* Dish Overview */}
                <section className={`${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'} rounded-xl p-5 border ${darkMode ? 'border-slate-600' : 'border-gray-200'} shadow-sm`}>
                  <div className={`flex items-center gap-2 ${textClass} mb-3`}>
                    <Salad size={20} />
                    <h3 className="text-lg font-bold">Dish Overview</h3>
                  </div>
                  <p className={`${textClass} text-2xl font-bold mb-1`}>{result.dishName}</p>
                  <p className={textSecondaryClass}>Cuisine: <span className="font-medium">{result.cuisineType}</span></p>
                </section>

                {/* Ingredients */}
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

                {/* Nutrition */}
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

                {/* Recipe */}
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
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 sm:mt-12 text-center">
          <div className={`${cardClass} rounded-2xl p-6 sm:p-8 border shadow-lg transition-colors duration-300`}>
            <h3 className={`text-2xl font-bold ${textClass} mb-2`}>Built for the OpenxAI Global Accelerator 2025</h3>
            <p className={textSecondaryClass}>Runs with local Ollama for offline capability. Toggle modes to fit your environment.</p>
          </div>
        </div>
      </div>

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