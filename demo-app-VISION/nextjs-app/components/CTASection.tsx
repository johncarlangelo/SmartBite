'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Mail, Github, Heart, Code } from 'lucide-react'
import Link from 'next/link'
import ContactModal from './ContactModal'

interface CTASectionProps {
    darkMode: boolean
}

export default function CTASection({ darkMode }: CTASectionProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <section className={`relative py-16 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <div className="max-w-7xl mx-auto px-6 sm:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className={`rounded-3xl p-12 sm:p-16 border-2 ${
                        darkMode 
                            ? 'bg-slate-800/30 border-slate-700/50' 
                            : 'bg-gray-50 border-gray-200'
                    }`}
                >
                    {/* Main Content */}
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <h2 className={`text-3xl sm:text-4xl font-bold ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                    Built with
                                </h2>
                                <Heart className="text-red-500 fill-red-500 animate-pulse" size={32} />
                                <h2 className={`text-3xl sm:text-4xl font-bold ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                    by SmartBite Team
                                </h2>
                            </div>
                            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Empowering food enthusiasts with AI-powered insights
                            </p>
                        </motion.div>
                    </div>

                    {/* Contact Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10"
                    >
                        <a 
                            onClick={(e) => {
                                e.preventDefault()
                                setIsModalOpen(true)
                            }}
                            className={`group flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition-all hover:scale-105 cursor-pointer ${
                                darkMode
                                    ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700 text-white'
                                    : 'bg-white border-gray-300 hover:border-gray-400 text-gray-900'
                            }`}
                        >
                            <Mail size={20} className="group-hover:rotate-12 transition-transform" />
                            <span className="font-medium">Contact Us</span>
                        </a>

                        <a 
                            href="https://github.com/johncarlangelo/SmartBite"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`group flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition-all hover:scale-105 ${
                                darkMode
                                    ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700 text-white'
                                    : 'bg-white border-gray-300 hover:border-gray-400 text-gray-900'
                            }`}
                        >
                            <Github size={20} className="group-hover:rotate-12 transition-transform" />
                            <span className="font-medium">View on GitHub</span>
                        </a>
                    </motion.div>

                    {/* Tech Stack / Credits */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="text-center"
                    >
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <Code size={20} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
                            <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Powered by
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3">
                            {['Next.js', 'React', 'Ollama', 'Tailwind CSS'].map((tech, index) => (
                                <span
                                    key={index}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                        darkMode
                                            ? 'bg-slate-700/50 text-gray-300'
                                            : 'bg-white border border-gray-200 text-gray-700'
                                    }`}
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Copyright */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className={`text-center mt-10 pt-8 border-t ${
                            darkMode ? 'border-slate-700' : 'border-gray-200'
                        }`}
                    >
                        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            © 2025 SmartBite. All rights reserved.
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </section>

        {/* Contact Modal */}
        <ContactModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            darkMode={darkMode} 
        />
        </>
    )
}
