'use client'

import { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import { Camera, Upload, Eye, Salad, Gauge, ChefHat, WifiOff, Wifi, Moon, Sun, Save, History, Trash2, X, Clock, ArrowLeft, Star } from 'lucide-react'
import { motion, useInView } from 'motion/react'
import GridMotion from '@/components/GridMotion'
import Link from 'next/link'
import RecommendedDishes from '@/components/RecommendedDishes'


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

type RecentAnalysis = AnalysisResult & {
    id: string
    analyzedAt: string
    imageUrl: string
    createdAt?: string
}

type SavedAnalysis = AnalysisResult & {
    id: string
    savedAt: string
    imageUrl: string
    createdAt?: string
}


export default function AnalyzePage() {
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
    const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([])
    const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([])
    const [showHistory, setShowHistory] = useState(false)
    const [historyView, setHistoryView] = useState<'recent' | 'saved'>('recent')
    const [unreadCount, setUnreadCount] = useState(0)

    // Background images
    const backgroundImages = useMemo(() => [
        '/images/burger.png',
        '/images/chicken.png',
        '/images/chips.png',
        '/images/fries.png',
        '/images/pizza.png',
        '/images/burger.png',
        '/images/chicken.png',
        '/images/chips.png',
        '/images/fries.png',
        '/images/pizza.png',
        '/images/burger.png',
        '/images/chicken.png',
        '/images/chips.png',
        '/images/fries.png',
        '/images/pizza.png',
        '/images/burger.png',
        '/images/chicken.png',
        '/images/chips.png',
        '/images/fries.png',
        '/images/pizza.png',
        '/images/burger.png',
        '/images/chicken.png',
        '/images/chips.png',
        '/images/fries.png',
        '/images/pizza.png',
        '/images/burger.png',
        '/images/chicken.png',
        '/images/chips.png',
    ], [])

    // Animated Section Component for Results
    const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
        const ref = useRef<HTMLDivElement>(null)
        const inView = useInView(ref, { amount: 0.4, once: true })
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

    // Load data from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme) {
            setDarkMode(savedTheme === 'dark')
        }

        const recent = localStorage.getItem('recentAnalyses')
        if (recent) {
            setRecentAnalyses(JSON.parse(recent))
        }

        const saved = localStorage.getItem('savedAnalyses')
        if (saved) {
            setSavedAnalyses(JSON.parse(saved))
        }

        const unread = localStorage.getItem('unreadCount')
        if (unread) {
            setUnreadCount(parseInt(unread))
        }
    }, [])

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
            // Auto-trigger analysis immediately after upload
            setTimeout(() => {
                if (file) {
                    analyzeImageWithFile(file, e.target?.result as string)
                }
            }, 100)
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

    useEffect(() => {
        if (!isAnalyzing) {
            setProgress(0)
            setAnalysisStage('')
            return
        }

        const stages = [
            { progress: 20, stage: 'Processing image...', duration: 200 },
            { progress: 40, stage: 'Identifying dish...', duration: 300 },
            { progress: 60, stage: 'Analyzing ingredients...', duration: 300 },
            { progress: 80, stage: 'Calculating nutrition...', duration: 200 },
            { progress: 95, stage: 'Generating recipe...', duration: 100 },
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

    const checkCache = async (file: File): Promise<{ cached: boolean; analysis?: any; imageHash?: string }> => {
        try {
            const form = new FormData()
            form.append('image', file)

            const response = await fetch('/api/check-cache', {
                method: 'POST',
                body: form,
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data?.error || 'Failed to check cache')

            return data
        } catch (err) {
            console.error('Cache check failed:', err)
            return { cached: false }
        }
    }

    const analyzeImageWithFile = async (file: File, imageUrl: string) => {
        setIsAnalyzing(true)
        setError(null)
        setProgress(0)

        try {
            const cacheResult = await checkCache(file)

            if (cacheResult.cached && cacheResult.analysis) {
                setProgress(100)
                setAnalysisStage('Loaded from cache!')

                setTimeout(() => {
                    const analysisData = cacheResult.analysis
                    setResult(analysisData)
                    addToRecentAnalyses(analysisData, imageUrl)
                    setIsAnalyzing(false)
                }, 100)
                return
            }

            const form = new FormData()
            form.append('image', file)
            form.append('offline', String(offline))

            if (cacheResult.imageHash) {
                form.append('imageHash', cacheResult.imageHash)
            }

            const response = await fetch('/api/analyze-image', {
                method: 'POST',
                body: form,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data?.error || 'Failed to analyze image')
            }

            setProgress(100)
            setAnalysisStage('Analysis complete!')

            setTimeout(() => {
                const analysisData = data
                setResult(analysisData)
                addToRecentAnalyses(analysisData, imageUrl)
                setIsAnalyzing(false)
            }, 100)

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred')
            setIsAnalyzing(false)
            setProgress(0)
            setAnalysisStage('')
        }
    }

    const addToRecentAnalyses = (analysis: AnalysisResult, imageUrl: string) => {
        const newAnalysis: RecentAnalysis = {
            ...analysis,
            id: Date.now().toString(),
            analyzedAt: new Date().toISOString(),
            imageUrl,
        }

        // Read fresh data from localStorage instead of relying on state
        const storedRecent = localStorage.getItem('recentAnalyses')
        const currentAnalyses = storedRecent ? JSON.parse(storedRecent) : []
        
        // Check if the dish already exists in recent analyses (by dish name)
        const filteredAnalyses = currentAnalyses.filter(
            (item: RecentAnalysis) => item.dishName !== analysis.dishName
        )
        
        // Add new analysis at the beginning and keep only 3
        const updated = [newAnalysis, ...filteredAnalyses].slice(0, 3)
        
        console.log('Adding to recent analyses:', updated.length, 'items', updated) // Debug log
        
        setRecentAnalyses(updated)
        localStorage.setItem('recentAnalyses', JSON.stringify(updated))

        // Increment unread count only if history modal is closed
        if (!showHistory) {
            const newCount = unreadCount + 1
            setUnreadCount(newCount)
            localStorage.setItem('unreadCount', String(newCount))
        }
    }

    const saveAnalysis = () => {
        if (!result || !selectedImage) return

        const existingIndex = savedAnalyses.findIndex(
            (saved) => saved.dishName === result.dishName && saved.imageUrl === selectedImage
        )

        if (existingIndex !== -1) {
            return
        }

        const newSaved: SavedAnalysis = {
            ...result,
            id: Date.now().toString(),
            savedAt: new Date().toISOString(),
            imageUrl: selectedImage,
        }

        const updated = [newSaved, ...savedAnalyses]
        setSavedAnalyses(updated)
        localStorage.setItem('savedAnalyses', JSON.stringify(updated))

        setSavedSuccess(true)
        setTimeout(() => setSavedSuccess(false), 3000)
    }

    const toggleHistory = () => {
        setShowHistory(!showHistory)
        if (!showHistory) {
            // Clear unread count when opening history
            setUnreadCount(0)
            localStorage.setItem('unreadCount', '0')
        }
    }

    const loadHistoryItem = (item: RecentAnalysis | SavedAnalysis) => {
        setSelectedImage(item.imageUrl)
        setResult({
            dishName: item.dishName,
            cuisineType: item.cuisineType,
            ingredients: item.ingredients,
            nutrition: item.nutrition,
            recipe: item.recipe
        })
        setShowHistory(false)
    }

    const deleteRecentItem = (id: string) => {
        const updated = recentAnalyses.filter(item => item.id !== id)
        setRecentAnalyses(updated)
        localStorage.setItem('recentAnalyses', JSON.stringify(updated))
    }

    const deleteSavedItem = (id: string) => {
        const updated = savedAnalyses.filter(item => item.id !== id)
        setSavedAnalyses(updated)
        localStorage.setItem('savedAnalyses', JSON.stringify(updated))
    }

    const clearAllRecent = () => {
        setRecentAnalyses([])
        localStorage.setItem('recentAnalyses', JSON.stringify([]))
    }

    const clearAllSaved = () => {
        setSavedAnalyses([])
        localStorage.setItem('savedAnalyses', JSON.stringify([]))
    }

    // Helper variables for styling
    const cardClass = darkMode ? 'bg-slate-800/95' : 'bg-white'
    const textClass = darkMode ? 'text-white' : 'text-gray-900'
    const textSecondaryClass = darkMode ? 'text-gray-400' : 'text-gray-600'
    const buttonPrimaryClass = darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'

    // Check if current result is already saved
    const isAlreadySaved = !!(result && selectedImage && savedAnalyses.some(
        (saved) => saved.dishName === result.dishName && saved.imageUrl === selectedImage
    ))

    // Close history handler
    const handleCloseHistory = () => {
        setShowHistory(false)
    }

    // Load recent analysis
    const loadRecentAnalysis = (item: RecentAnalysis) => {
        loadHistoryItem(item)
    }

    // Load saved analysis
    const loadSavedAnalysis = (item: SavedAnalysis) => {
        loadHistoryItem(item)
    }

    // Delete recent analysis
    const deleteRecentAnalysis = (id: string) => {
        deleteRecentItem(id)
    }

    // Delete saved analysis  
    const deleteSavedAnalysis = (id: string) => {
        deleteSavedItem(id)
    }

    // AnimatedHistoryItem component
    const AnimatedHistoryItem = ({ children, index, delay }: { children: React.ReactNode; index: number; delay: number }) => {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * delay, duration: 0.3 }}
            >
                {children}
            </motion.div>
        )
    }

    return (
        <div className={`min-h-screen relative transition-colors duration-300 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
            {/* Grid Motion Background */}
            <div className="fixed inset-0 z-0">
                <GridMotion items={backgroundImages} opacity={0.12} blur={6} />
            </div>

            {/* Header */}
            <header className={`sticky top-0 z-50 backdrop-blur-xl ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-gray-200'} border-b transition-colors`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} transition-colors`}
                            >
                                <ArrowLeft size={20} />
                                <span className="font-medium">Back</span>
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${darkMode ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-purple-500'}`}>
                                    <Salad className="text-white" size={24} />
                                </div>
                                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Smart<span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>Bite</span>
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleHistory}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${darkMode
                                        ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200'
                                    }`}
                            >
                                <History size={18} />
                                <span className="text-sm font-medium hidden sm:inline">History</span>
                                {unreadCount > 0 && (
                                    <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-blue-500 text-white animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setOffline(!offline)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${offline
                                        ? darkMode
                                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                            : 'bg-orange-100 text-orange-600 border border-orange-200'
                                        : darkMode
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            : 'bg-green-100 text-green-600 border border-green-200'
                                    }`}
                            >
                                {offline ? <WifiOff size={18} /> : <Wifi size={18} />}
                                <span className="text-sm font-medium hidden sm:inline">
                                    {offline ? 'Offline' : 'Online'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content - Column Layout */}
            <main className="px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                <div className="w-full max-w-[80%] mx-auto space-y-8">
                    {/* Upload Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className={`backdrop-blur-2xl rounded-3xl border transition-all ${darkMode
                                ? 'bg-slate-800/40 border-slate-700/50 shadow-2xl shadow-black/50'
                                : 'bg-white/80 border-gray-200 shadow-2xl'
                            }`}
                    >
                        <div className="p-10 lg:p-16">
                            <div className="mb-8">
                                <h2 className={`text-4xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Upload & Analyze
                                </h2>
                                <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Discover what's in your dish with AI
                                </p>
                            </div>

                            <label
                                htmlFor="file-upload"
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                className={`block relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all hover:scale-[1.02] ${selectedImage
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : darkMode
                                            ? 'border-slate-600 hover:border-blue-500 bg-slate-900/30'
                                            : 'border-gray-300 hover:border-blue-400 bg-gray-50'
                                    }`}
                            >
                                {selectedImage ? (
                                    <div className="space-y-4">
                                        <img
                                            src={selectedImage}
                                            alt="Selected"
                                            className="max-h-96 w-full mx-auto rounded-xl shadow-2xl object-contain"
                                        />
                                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            Click to change or drag another file
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6 py-16">
                                        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                            <Upload className="text-white" size={40} />
                                        </div>
                                        <div>
                                            <p className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                Drop your image here
                                            </p>
                                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                or click to browse (PNG, JPG, JPEG)
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg"
                                    onChange={handleFileInput}
                                    className="hidden"
                                />
                            </label>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {isAnalyzing && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-8 space-y-4"
                                >
                                    <div className="flex items-center justify-between text-sm">
                                        <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {analysisStage}
                                        </span>
                                        <span className={`font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                            {progress}%
                                        </span>
                                    </div>
                                    <div className={`h-3 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Results Section */}
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className={`backdrop-blur-2xl rounded-3xl border transition-all ${darkMode
                                    ? 'bg-slate-800/40 border-slate-700/50 shadow-2xl shadow-black/50'
                                    : 'bg-white/80 border-gray-200 shadow-2xl'
                                }`}
                        >
                            <div className="p-10 lg:p-16 space-y-8">
                                {/* Dish Info */}
                                <AnimatedSection delay={0}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h2 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {result.dishName}
                                            </h2>
                                            <p className={`mt-3 text-xl ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                                {result.cuisineType}
                                            </p>
                                        </div>
                                        <button
                                            onClick={saveAnalysis}
                                            disabled={savedSuccess || isAlreadySaved}
                                            className={`p-3 rounded-xl transition-all ${
                                                savedSuccess
                                                    ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                                                    : isAlreadySaved
                                                        ? darkMode
                                                            ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
                                                            : 'bg-gray-200/50 text-gray-400 cursor-not-allowed'
                                                        : darkMode
                                                            ? 'bg-slate-700/50 hover:bg-slate-600 text-white'
                                                            : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                                            }`}
                                        >
                                            <Save size={20} />
                                        </button>
                                    </div>
                                </AnimatedSection>

                                {savedSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 rounded-lg bg-green-500/20 text-green-400 text-sm border border-green-500/30"
                                    >
                                        ✓ Saved successfully!
                                    </motion.div>
                                )}

                                {/* Nutrition Facts */}
                                <AnimatedSection delay={0.1}>
                                    <div>
                                        <h3 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            <Gauge className={darkMode ? 'text-green-400' : 'text-green-600'} size={28} />
                                            Nutrition Facts
                                        </h3>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                            {[
                                                { label: 'Calories', value: result.nutrition.calories, unit: 'kcal', color: 'text-orange-400' },
                                                { label: 'Protein', value: result.nutrition.protein_g, unit: 'g', color: 'text-blue-400' },
                                                { label: 'Carbs', value: result.nutrition.carbs_g, unit: 'g', color: 'text-purple-400' },
                                                { label: 'Fat', value: result.nutrition.fat_g, unit: 'g', color: 'text-yellow-400' },
                                            ].map((item, index) => (
                                                <motion.div
                                                    key={item.label}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
                                                    className={`p-6 rounded-xl ${darkMode ? 'bg-slate-800/50' : 'bg-white'}`}
                                                >
                                                    <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        {item.label}
                                                    </p>
                                                    <p className={`text-3xl font-bold ${item.color}`}>
                                                        {item.value}
                                                        <span className="text-sm ml-1">{item.unit}</span>
                                                    </p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </AnimatedSection>

                                {/* Ingredients */}
                                <AnimatedSection delay={0.2}>
                                    <div>
                                        <h3 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            <Salad className={darkMode ? 'text-yellow-400' : 'text-yellow-600'} size={28} />
                                            Ingredients
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            {result.ingredients.map((ingredient, index) => (
                                                <motion.span
                                                    key={index}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.3 + index * 0.05, duration: 0.2 }}
                                                    className={`px-5 py-3 rounded-xl text-base font-medium ${darkMode
                                                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                                                        }`}
                                                >
                                                    {ingredient}
                                                </motion.span>
                                            ))}
                                        </div>
                                    </div>
                                </AnimatedSection>

                                {/* Recipe */}
                                <AnimatedSection delay={0.3}>
                                    <div>
                                        <h3 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            <ChefHat className={darkMode ? 'text-pink-400' : 'text-pink-600'} size={28} />
                                            Recipe
                                        </h3>
                                        <div className="space-y-6">
                                            <div className="flex gap-4 text-sm flex-wrap">
                                                <motion.div
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.4, duration: 0.3 }}
                                                    className={`px-5 py-3 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-white'}`}
                                                >
                                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Servings: </span>
                                                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {result.recipe.servings}
                                                    </span>
                                                </motion.div>
                                                <motion.div
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.5, duration: 0.3 }}
                                                    className={`px-5 py-3 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-white'}`}
                                                >
                                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Prep: </span>
                                                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {result.recipe.prepMinutes}m
                                                    </span>
                                                </motion.div>
                                                <motion.div
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.6, duration: 0.3 }}
                                                    className={`px-5 py-3 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-white'}`}
                                                >
                                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Cook: </span>
                                                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {result.recipe.cookMinutes}m
                                                    </span>
                                                </motion.div>
                                            </div>
                                            <ol className="space-y-4">
                                                {result.recipe.steps.map((step, index) => (
                                                    <motion.li
                                                        key={index}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                                                        className={`flex gap-4 p-4 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-white'}`}
                                                    >
                                                        <span
                                                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${darkMode
                                                                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                                                                    : 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                                                                }`}
                                                        >
                                                            {index + 1}
                                                        </span>
                                                        <span className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                            {step}
                                                        </span>
                                                    </motion.li>
                                                ))}
                                            </ol>
                                        </div>
                                    </div>
                                </AnimatedSection>

                                {/* Recommended Dishes */}
                                <AnimatedSection delay={0.4}>
                                    <RecommendedDishes 
                                        ingredients={result.ingredients} 
                                        darkMode={darkMode}
                                    />
                                </AnimatedSection>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>

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
                                Analysis History
                            </h2>
                            <button
                                onClick={handleCloseHistory}
                                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
                            >
                                <X size={24} className={textClass} />
                            </button>
                        </div>

                        {/* Tab Buttons */}
                        <div className="flex gap-3 mb-6">
                            <button
                                onClick={() => setHistoryView('recent')}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                                    historyView === 'recent'
                                        ? darkMode
                                            ? 'bg-purple-600 text-white shadow-lg'
                                            : 'bg-purple-500 text-white shadow-lg'
                                        : darkMode
                                            ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <Clock size={20} />
                                Recent Analysis
                            </button>
                            <button
                                onClick={() => setHistoryView('saved')}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                                    historyView === 'saved'
                                        ? darkMode
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'bg-blue-500 text-white shadow-lg'
                                        : darkMode
                                            ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <Save size={20} />
                                Saved Analysis
                            </button>
                        </div>

                        {historyView === 'recent' ? (
                            /* Recently Analyzed View */
                            <div className="space-y-4">
                                {recentAnalyses.length === 0 ? (
                                    <div className={`text-center ${textSecondaryClass} py-12`}>
                                        <Clock size={48} className="mx-auto mb-4 opacity-50" />
                                        <p>No recent analyses yet. Analyze a dish to see it here!</p>
                                    </div>
                                ) : (
                                    <>
                                        <p className={`${textSecondaryClass} text-sm mb-4`}>
                                            Showing your {Math.min(recentAnalyses.length, 3)} most recently analyzed {recentAnalyses.length === 1 ? 'dish' : 'dishes'}
                                        </p>
                                        <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                                            {recentAnalyses
                                                .sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime())
                                                .slice(0, 3)
                                                .map((recent, index) => (
                                                    <AnimatedHistoryItem key={recent.id} index={index} delay={0.1}>
                                                        <div
                                                            className={`${darkMode ? 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 hover:from-purple-900/40 hover:to-blue-900/40 border-purple-500/40' : 'bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border-purple-300'} rounded-xl p-4 border-2 transition-all cursor-pointer group shadow-lg`}
                                                        >
                                                            <div className="flex gap-4">
                                                                <div className="relative">
                                                                    <img
                                                                        src={recent.imageUrl}
                                                                        alt={recent.dishName}
                                                                        className="w-32 h-32 object-cover rounded-lg shadow-md"
                                                                    />
                                                                    {index === 0 && (
                                                                        <div className={`absolute -top-2 -right-2 ${darkMode ? 'bg-yellow-500' : 'bg-yellow-400'} text-white text-xs font-bold px-2 py-1 rounded-full shadow-md`}>
                                                                            LATEST
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h3 className={`${textClass} font-bold mb-1 text-xl`}>{recent.dishName}</h3>
                                                                    <p className={`${textSecondaryClass} text-sm mb-1`}>
                                                                        <span className="font-semibold">Cuisine:</span> {recent.cuisineType}
                                                                    </p>
                                                                    <p className={`${textSecondaryClass} text-sm mb-2`}>
                                                                        <span className="font-semibold">Analyzed:</span> {new Date(recent.analyzedAt).toLocaleDateString()} at {new Date(recent.analyzedAt).toLocaleTimeString()}
                                                                    </p>
                                                                    {recent.createdAt && (
                                                                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-100 text-blue-800'} mb-2`}>
                                                                            <Clock size={12} />
                                                                            Cached result
                                                                        </div>
                                                                    )}
                                                                    <div className="flex gap-2 mt-3">
                                                                        <button
                                                                            onClick={() => loadRecentAnalysis(recent)}
                                                                            className={`text-md px-4 py-2 rounded-lg ${buttonPrimaryClass} transition-all font-medium shadow-md hover:shadow-lg`}
                                                                        >
                                                                            View
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                deleteRecentAnalysis(recent.id)
                                                                            }}
                                                                            className={`text-md px-4 py-2 rounded-lg ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white transition-all font-medium flex items-center gap-1`}
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
                                    </>
                                )}
                            </div>
                        ) : (
                            /* Saved Analyses View */
                            <div className="space-y-4">
                                {savedAnalyses.length === 0 ? (
                                    <div className={`text-center ${textSecondaryClass} py-12`}>
                                        <Save size={48} className="mx-auto mb-4 opacity-50" />
                                        <p>No saved analyses yet. Save your favorite dishes to see them here!</p>
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
                                                    {saved.createdAt && saved.createdAt !== saved.savedAt && (
                                                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-100 text-blue-800'} mb-2`}>
                                                            <Clock size={12} />
                                                            Cached result
                                                        </div>
                                                    )}
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
                        )}
                    </div>
                </div>
            )}

            {/* Dark Mode Toggle Button */}
            <button
                onClick={toggleTheme}
                className={`fixed bottom-8 right-8 p-4 rounded-full shadow-2xl transition-all hover:scale-110 z-50 ${
                    darkMode
                        ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700 border border-slate-600'
                        : 'bg-white text-slate-900 hover:bg-gray-100 border border-gray-200'
                }`}
                aria-label="Toggle dark mode"
            >
                {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
        </div>
    )
}