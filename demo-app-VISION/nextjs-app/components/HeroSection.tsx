"use client";

import React from "react";
import { Camera, Sparkles, Upload } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

interface HeroSectionProps {
    darkMode?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ darkMode = true }) => {
    return (
        <section className="relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>

            <div className="relative max-w-7xl mx-auto px-6 sm:px-8 py-16 sm:py-24 lg:py-32">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    {/* Left Content */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="w-full lg:w-1/2 text-center lg:text-left space-y-6"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl"
                        >
                            <Sparkles size={16} className="text-blue-400" />
                            <span className="text-sm text-blue-400 font-medium">AI-Powered Food Analysis</span>
                        </motion.div>

                        {/* Hero Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight ${
                                darkMode ? 'text-white' : 'text-gray-900'
                            }`}
                        >
                            Discover Your{" "}
                            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                Food's Story
                            </span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className={`text-lg sm:text-xl max-w-2xl mx-auto lg:mx-0 ${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                        >
                            Upload a photo of any dish and get instant insights on ingredients, nutrition facts, and authentic recipes powered by AI.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4"
                        >
                            <Link href="/analyze" className="group relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all flex items-center justify-center gap-2">
                                <Camera size={20} />
                                <span>Analyze Now</span>
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                            </Link>
                            <button className={`w-full sm:w-auto px-8 py-4 backdrop-blur-xl rounded-xl font-semibold border transition-all flex items-center justify-center gap-2 ${
                                darkMode
                                    ? 'bg-slate-800/50 text-white border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                                    : 'bg-white/80 text-gray-900 border-gray-200 hover:bg-white hover:border-gray-300'
                            }`}>
                                <Upload size={20} />
                                <span>Browse Menu</span>
                            </button>
                        </motion.div>
                    </motion.div>

                    {/* Right Image */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="w-full lg:w-1/2 flex justify-center"
                    >
                        <div className="relative">
                            {/* Main Image Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="relative backdrop-blur-xl bg-slate-800/50 rounded-3xl p-6 border border-slate-700/50 shadow-2xl"
                            >
                                <div className="relative overflow-hidden rounded-2xl">
                                    <img
                                        src="/images/pizza.png"
                                        alt="Featured Dish"
                                        className="w-full h-[350px] sm:h-[400px] object-cover"
                                    />
                                    {/* Overlay gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
                                </div>

                                {/* Floating Info Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ delay: 0.8, duration: 0.5 }}
                                    className="absolute -bottom-4 -right-4 backdrop-blur-xl bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                            <Sparkles size={24} className="text-white" />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">Pizza Margherita</div>
                                            <div className="text-sm text-gray-400">520 cal • Italian</div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Floating Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.9, duration: 0.5 }}
                                className="absolute -top-4 -left-4 backdrop-blur-xl bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2 shadow-lg"
                            >
                                <span className="text-green-400 font-semibold text-sm">✓ Verified Fresh</span>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;