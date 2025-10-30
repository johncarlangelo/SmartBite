'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Database, X, Info } from 'lucide-react'

interface CacheEmptyModalProps {
    isOpen: boolean
    onClose: () => void
    darkMode: boolean
}

export default function CacheEmptyModal({ 
    isOpen, 
    onClose, 
    darkMode
}: CacheEmptyModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        onClick={(e) => e.stopPropagation()}
                        className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl ${
                            darkMode 
                                ? 'bg-slate-800 border border-slate-700' 
                                : 'bg-white border border-gray-200'
                        }`}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
                                darkMode 
                                    ? 'hover:bg-slate-700 text-gray-400 hover:text-white' 
                                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <X size={20} />
                        </button>

                        {/* Info Icon */}
                        <div className="flex justify-center mb-4">
                            <div className={`p-4 rounded-full ${
                                darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                            }`}>
                                <Info className="text-blue-500" size={32} />
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className={`text-2xl font-bold text-center mb-2 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                            Cache Already Empty
                        </h3>

                        {/* Message */}
                        <p className={`text-center mb-6 ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                            Your cache is currently empty.
                            <br />
                            <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                There's nothing to clear right now.
                            </span>
                        </p>

                        {/* Cache Stats Display */}
                        <div className={`mb-6 p-4 rounded-xl ${
                            darkMode ? 'bg-slate-700/50' : 'bg-gray-50'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Database size={18} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
                                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Cache Status
                                    </span>
                                </div>
                                <span className={`font-bold text-green-500`}>
                                    Empty
                                </span>
                            </div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white transition-all transform hover:scale-105"
                        >
                            Got it
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
