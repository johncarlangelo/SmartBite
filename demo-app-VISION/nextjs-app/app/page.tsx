'use client'

import { useCallback, useMemo, useState } from 'react'
import { Camera, Upload, Eye, Salad, Gauge, ChefHat, WifiOff, Wifi } from 'lucide-react'

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

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-700 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center text-white mb-10 sm:mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold mb-3 sm:mb-4 drop-shadow-md">{headerTitle}</h1>
          <p className="text-base sm:text-xl opacity-90">{headerSubtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Upload Panel */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Upload Dish Photo</h2>
              <button
                onClick={() => setOffline((v) => !v)}
                className="inline-flex items-center gap-2 text-white/90 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg border border-white/10"
                title={offline ? 'Using local Ollama model' : 'Using online model'}
              >
                {offline ? <WifiOff size={18} /> : <Wifi size={18} />}
                <span className="hidden sm:inline">{offline ? 'Offline (Ollama local)' : 'Online'}</span>
              </button>
            </div>

            <div className="space-y-4">
              <label
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-white/30 border-dashed rounded-2xl cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt="Selected"
                      className="max-h-48 max-w-full rounded-xl shadow-lg"
                    />
                  ) : (
                    <>
                      <Upload className="w-10 h-10 mb-3 text-white/80" />
                      <p className="mb-2 text-sm text-white/80">
                        <span className="font-semibold">Click to upload</span> or drag & drop
                      </p>
                      <p className="text-xs text-white/60">PNG, JPG or JPEG</p>
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
                  className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold shadow transition-colors"
                >
                  <Eye size={20} />
                  <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Image'}</span>
                </button>
              )}

              {error && (
                <div className="text-red-200 bg-red-900/30 border border-red-500/40 rounded-xl p-3">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/10 shadow-xl">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Results</h2>

            {!result && !isAnalyzing && !error && (
              <div className="text-center text-white/70 py-10">
                <Camera size={48} className="mx-auto mb-4" />
                <p>Upload an image and click "Analyze" to see AI-powered insights.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="text-center text-white/90 py-10 animate-pulse">
                <Eye className="mx-auto mb-3" />
                <p>Analyzing your dish...</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Dish Overview */}
                <section className="bg-white/10 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-white mb-2">
                    <Salad size={18} />
                    <h3 className="text-lg font-semibold">Dish Overview</h3>
                  </div>
                  <p className="text-white text-lg font-medium">{result.dishName}</p>
                  <p className="text-white/80">Cuisine: {result.cuisineType}</p>
                </section>

                {/* Ingredients */}
                <section className="bg-white/10 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-white mb-2">
                    <Salad size={18} />
                    <h3 className="text-lg font-semibold">Ingredients</h3>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.ingredients.map((ing, idx) => (
                      <li key={idx} className="text-white/90">• {ing}</li>
                    ))}
                  </ul>
                </section>

                {/* Nutrition */}
                <section className="bg-white/10 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-white mb-2">
                    <Gauge size={18} />
                    <h3 className="text-lg font-semibold">Nutritional Facts (per serving)</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-white">
                    <div className="bg-black/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold">{Math.round(result.nutrition.calories)}</div>
                      <div className="text-white/70 text-sm">Calories</div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold">{Math.round(result.nutrition.protein_g)}g</div>
                      <div className="text-white/70 text-sm">Protein</div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold">{Math.round(result.nutrition.carbs_g)}g</div>
                      <div className="text-white/70 text-sm">Carbs</div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold">{Math.round(result.nutrition.fat_g)}g</div>
                      <div className="text-white/70 text-sm">Fat</div>
                    </div>
                  </div>
                </section>

                {/* Recipe */}
                <section className="bg-white/10 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-white mb-2">
                    <ChefHat size={18} />
                    <h3 className="text-lg font-semibold">Recipe Guide</h3>
                  </div>
                  <p className="text-white/80 mb-2">Servings: {result.recipe.servings} • Prep: {result.recipe.prepMinutes}m • Cook: {result.recipe.cookMinutes}m</p>
                  <ol className="list-decimal list-inside space-y-1 text-white/90">
                    {result.recipe.steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </section>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 sm:mt-12 text-center">
          <div className="bg-black/20 rounded-2xl p-6 sm:p-8 backdrop-blur-sm border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-2">Built for the OpenxAI Global Accelerator 2025</h3>
            <p className="text-white/80">Runs with local Ollama for offline capability. Toggle modes to fit your environment.</p>
          </div>
        </div>
      </div>
    </main>
  )
}