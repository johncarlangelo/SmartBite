'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Database, AlertTriangle, X, CheckCircle2, Trash2 } from 'lucide-react'

interface CacheClearModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    entries: number
    size: string
    darkMode: boolean
    showSuccess?: boolean
}

export default function CacheClearModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    entries, 
    size, 
    darkMode,
    showSuccess = false
}: CacheClearModalProps) {
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

                        {!showSuccess ? (
                            <>
                                {/* Warning Icon */}
                                <div className="flex justify-center mb-4">
                                    <div className={`p-4 rounded-full ${
                                        darkMode ? 'bg-orange-500/20' : 'bg-orange-100'
                                    }`}>
                                        <AlertTriangle className="text-orange-500" size={32} />
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className={`text-2xl font-bold text-center mb-2 ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                    Clear Image Cache?
                                </h3>

                                {/* Cache Stats */}
                                <div className={`my-6 p-4 rounded-xl ${
                                    darkMode ? 'bg-slate-700/50' : 'bg-gray-50'
                                }`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Database size={18} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
                                            <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Entries
                                            </span>
                                        </div>
                                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {entries}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Trash2 size={18} className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
                                            <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Size
                                            </span>
                                        </div>
                                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {size} KB
                                        </span>
                                    </div>
                                </div>

                                {/* Warning Message */}
                                <p className={`text-center mb-6 ${
                                    darkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    This will remove all cached analysis results.
                                    <br />
                                    <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                        You can still view recent and saved analyses.
                                    </span>
                                </p>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={onClose}
                                        className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                                            darkMode
                                                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                                                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                                        }`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={onConfirm}
                                        className="flex-1 px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white transition-all transform hover:scale-105"
                                    >
                                        Clear Cache
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Success Icon */}
                                <motion.div 
                                    className="flex justify-center mb-4"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", duration: 0.6 }}
                                >
                                    <div className={`p-4 rounded-full ${
                                        darkMode ? 'bg-green-500/20' : 'bg-green-100'
                                    }`}>
                                        <CheckCircle2 className="text-green-500" size={32} />
                                    </div>
                                </motion.div>

                                {/* Success Title */}
                                <h3 className={`text-2xl font-bold text-center mb-2 ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                    Cache Cleared!
                                </h3>

                                {/* Success Message */}
                                <p className={`text-center mb-4 ${
                                    darkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    Successfully cleared <span className="font-bold text-green-500">{entries}</span> cache entries
                                    <br />
                                    <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                        Freed up {size} KB of storage
                                    </span>
                                </p>

                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="w-full px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-all transform hover:scale-105"
                                >
                                    Done
                                </button>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
