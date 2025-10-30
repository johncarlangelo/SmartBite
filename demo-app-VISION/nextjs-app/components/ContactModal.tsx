'use client'

import { useState } from 'react'
import { X, Mail, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface ContactModalProps {
    isOpen: boolean
    onClose: () => void
    darkMode: boolean
}

export default function ContactModal({ isOpen, onClose, darkMode }: ContactModalProps) {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Send email via API route
            const response = await fetch('/api/send-contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    message,
                }),
            })

            if (response.ok) {
                // Show success message
                setSubmitted(true)
                setTimeout(() => {
                    setSubmitted(false)
                    setEmail('')
                    setMessage('')
                    onClose()
                }, 2000)
            } else {
                alert('Failed to send message. Please try again.')
            }
        } catch (error) {
            console.error('Error sending message:', error)
            alert('Failed to send message. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className={`relative w-full max-w-md rounded-2xl shadow-2xl ${
                            darkMode
                                ? 'bg-slate-800 border-2 border-slate-700'
                                : 'bg-white border-2 border-gray-200'
                        }`}
                    >
                        {/* Header */}
                        <div className={`flex items-center justify-between p-6 border-b ${
                            darkMode ? 'border-slate-700' : 'border-gray-200'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <Mail className="text-white" size={20} />
                                </div>
                                <h2 className={`text-2xl font-bold ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                    Contact Us
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-lg transition-colors ${
                                    darkMode
                                        ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            {submitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-8"
                                >
                                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                        <Send className="text-green-500" size={32} />
                                    </div>
                                    <h3 className={`text-xl font-bold mb-2 ${
                                        darkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        Message Sent!
                                    </h3>
                                    <p className={`text-sm ${
                                        darkMode ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                        We'll get back to you soon!
                                    </p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        We'd love to hear from you! Fill out the form below to get in touch.
                                    </p>

                                    {/* Email Input */}
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${
                                            darkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            Your Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            required
                                            className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:ring-2 ${
                                                darkMode
                                                    ? 'bg-slate-900 border-slate-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                                            }`}
                                        />
                                    </div>

                                    {/* Message Input */}
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${
                                            darkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            Message <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Tell us what you're thinking..."
                                            required
                                            rows={5}
                                            className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:ring-2 resize-none ${
                                                darkMode
                                                    ? 'bg-slate-900 border-slate-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                                            }`}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={!email || !message || !isValidEmail(email) || isSubmitting}
                                        className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                                            !email || !message || !isValidEmail(email)
                                                ? darkMode
                                                    ? 'bg-slate-700 text-gray-500 cursor-not-allowed'
                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-lg hover:shadow-xl'
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Sending...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send size={20} />
                                                <span>Send Message</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
