'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { History, Clock, Save, X, Trash2, Calendar } from 'lucide-react'

type Nutrition = {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

type RecentAnalysis = {
  id: string
  dishName: string
  cuisineType: string
  ingredients: string[]
  nutrition: Nutrition
  recipe: any
  isHalal: boolean
  halalNotes?: string
  allergens?: string[]
  analyzedAt: string
  imageUrl: string
}

type SavedAnalysis = RecentAnalysis & {
  savedAt: string
}

type HistoryModalProps = {
  darkMode: boolean
  recentAnalyses: RecentAnalysis[]
  savedAnalyses: SavedAnalysis[]
  onLoadRecent: (item: RecentAnalysis) => void
  onLoadSaved: (item: SavedAnalysis) => void
  onDeleteRecent: (id: string) => void
  onDeleteSaved: (id: string) => void
  onClearAllRecent: () => void
  onClearAllSaved: () => void
}

export default function HistoryModal({
  darkMode,
  recentAnalyses,
  savedAnalyses,
  onLoadRecent,
  onLoadSaved,
  onDeleteRecent,
  onDeleteSaved,
  onClearAllRecent,
  onClearAllSaved
}: HistoryModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [historyView, setHistoryView] = useState<'recent' | 'saved'>('recent')

  const cardClass = darkMode ? 'bg-slate-800/95' : 'bg-white'
  const textClass = darkMode ? 'text-white' : 'text-gray-900'
  const textSecondaryClass = darkMode ? 'text-gray-400' : 'text-gray-600'

  const handleClose = () => {
    setIsOpen(false)
  }
  const handleOpen = () => {
    setIsOpen(true)
  }

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
    <>
      {/* History Button */}
      <button
        onClick={handleOpen}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
          darkMode
            ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200'
        }`}
      >
        <History size={18} />
        <span className="text-sm font-medium hidden sm:inline">History</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8"
          onClick={handleClose}
        >
          <div
            className={`${cardClass} rounded-2xl p-6 max-w-4xl w-full max-h-[85vh] overflow-y-auto scrollbar-hide border shadow-2xl my-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${textClass} flex items-center gap-2`}>
                <History size={28} />
                Analysis History
              </h2>
              <button
                onClick={handleClose}
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
                    <div className="flex justify-between items-center mb-4">
                      <p className={`text-sm ${textSecondaryClass}`}>
                        Last {recentAnalyses.length} analysis
                      </p>
                      {recentAnalyses.length > 0 && (
                        <button
                          onClick={onClearAllRecent}
                          className={`text-sm px-3 py-1 rounded-lg ${
                            darkMode
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                          } transition-colors`}
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    {recentAnalyses.map((item, index) => (
                      <AnimatedHistoryItem key={item.id} index={index} delay={0.05}>
                        <div
                          className={`p-4 rounded-xl border ${
                            darkMode
                              ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          } transition-all cursor-pointer group`}
                          onClick={() => {
                            onLoadRecent(item)
                            handleClose()
                          }}
                        >
                          <div className="flex gap-4">
                            <img
                              src={item.imageUrl}
                              alt={item.dishName}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h3 className={`font-bold text-lg ${textClass} group-hover:text-purple-400 transition-colors`}>
                                {item.dishName}
                              </h3>
                              <p className={`text-sm ${textSecondaryClass} mb-2`}>
                                {item.cuisineType} • {item.nutrition.calories} cal
                              </p>
                              <div className="flex items-center gap-2 text-xs">
                                <Calendar size={14} className={textSecondaryClass} />
                                <span className={textSecondaryClass}>
                                  {new Date(item.analyzedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteRecent(item.id)
                              }}
                              className={`p-2 rounded-lg ${
                                darkMode
                                  ? 'hover:bg-red-500/20 text-red-400'
                                  : 'hover:bg-red-50 text-red-600'
                              } transition-colors`}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </AnimatedHistoryItem>
                    ))}
                  </>
                )}
              </div>
            ) : (
              /* Saved Analysis View */
              <div className="space-y-4">
                {savedAnalyses.length === 0 ? (
                  <div className={`text-center ${textSecondaryClass} py-12`}>
                    <Save size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No saved analyses yet. Save an analysis to see it here!</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <p className={`text-sm ${textSecondaryClass}`}>
                        {savedAnalyses.length} saved analysis
                      </p>
                      {savedAnalyses.length > 0 && (
                        <button
                          onClick={onClearAllSaved}
                          className={`text-sm px-3 py-1 rounded-lg ${
                            darkMode
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                          } transition-colors`}
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    {savedAnalyses.map((item, index) => (
                      <AnimatedHistoryItem key={item.id} index={index} delay={0.05}>
                        <div
                          className={`p-4 rounded-xl border ${
                            darkMode
                              ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          } transition-all cursor-pointer group`}
                          onClick={() => {
                            onLoadSaved(item)
                            handleClose()
                          }}
                        >
                          <div className="flex gap-4">
                            <img
                              src={item.imageUrl}
                              alt={item.dishName}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h3 className={`font-bold text-lg ${textClass} group-hover:text-blue-400 transition-colors`}>
                                {item.dishName}
                              </h3>
                              <p className={`text-sm ${textSecondaryClass} mb-2`}>
                                {item.cuisineType} • {item.nutrition.calories} cal
                              </p>
                              <div className="flex items-center gap-2 text-xs">
                                <Calendar size={14} className={textSecondaryClass} />
                                <span className={textSecondaryClass}>
                                  Saved on{' '}
                                  {new Date(item.savedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteSaved(item.id)
                              }}
                              className={`p-2 rounded-lg ${
                                darkMode
                                  ? 'hover:bg-red-500/20 text-red-400'
                                  : 'hover:bg-red-50 text-red-600'
                              } transition-colors`}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </AnimatedHistoryItem>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
