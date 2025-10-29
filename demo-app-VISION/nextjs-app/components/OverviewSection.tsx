'use client'

import { motion } from 'motion/react'
import { Eye, Salad, ChefHat, Sparkles, Brain, Camera } from 'lucide-react'

interface OverviewSectionProps {
    darkMode: boolean
}

export default function OverviewSection({ darkMode }: OverviewSectionProps) {
    const features = [
        {
            icon: <Camera size={32} />,
            title: 'AI-Powered Analysis',
            description: 'Upload any food image and get instant dish identification with advanced vision AI technology.',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: <Salad size={32} />,
            title: 'Nutritional Insights',
            description: 'Discover detailed nutrition facts, ingredients, and macro breakdowns with visual charts.',
            color: 'from-green-500 to-emerald-500'
        },
        {
            icon: <ChefHat size={32} />,
            title: 'Step-by-Step Recipes',
            description: 'Learn how to recreate dishes with detailed cooking instructions and preparation times.',
            color: 'from-orange-500 to-amber-500'
        },
        {
            icon: <Sparkles size={32} />,
            title: 'Smart Recommendations',
            description: 'Get personalized dish suggestions based on your preferences and dietary needs.',
            color: 'from-purple-500 to-pink-500'
        }
    ]

    return (
        <section className={`relative py-20 px-6 overflow-hidden ${
            darkMode ? 'bg-slate-900' : 'bg-white'
        }`} style={{ zIndex: 10 }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.2 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                        style={{
                            background: darkMode 
                                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))'
                                : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
                            border: `1px solid ${darkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`
                        }}
                    >
                        <Brain className={darkMode ? 'text-purple-400' : 'text-purple-600'} size={20} />
                        <span className={`text-sm font-semibold ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                            Powered by AI
                        </span>
                    </div>
                    
                    <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                        Discover, Analyze & Learn
                    </h2>
                    
                    <p className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        SmartBite uses cutting-edge AI to transform how you understand food. 
                        Upload a photo and unlock comprehensive nutritional insights, detailed recipes, 
                        and personalized recommendations—all in seconds.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className={`group relative rounded-2xl p-6 transition-all duration-100 ${
                                darkMode 
                                    ? 'bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/50' 
                                    : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-xl'
                            }`}
                        >
                            {/* Gradient Border Effect */}
                            <div 
                                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"
                                style={{
                                    background: `linear-gradient(135deg, ${feature.color.split(' ')[0].replace('from-', '')}, ${feature.color.split(' ')[1].replace('to-', '')})`,
                                    filter: 'blur(20px)',
                                    transform: 'scale(0.95)'
                                }}
                            />
                            
                            {/* Icon */}
                            <div 
                                className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 bg-gradient-to-br ${feature.color} text-white shadow-lg`}
                            >
                                {feature.icon}
                            </div>
                            
                            {/* Content */}
                            <h3 className={`text-xl font-bold mb-2 ${
                                darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                                {feature.title}
                            </h3>
                            
                            <p className={`text-sm leading-relaxed ${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Stats/Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className={`rounded-2xl p-8 border ${
                        darkMode 
                            ? 'bg-gradient-to-r from-slate-800/50 to-slate-800/30 border-slate-700/50' 
                            : 'bg-gradient-to-r from-gray-50 to-white border-gray-200'
                    }`}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className={`text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent`}>
                                Instant
                            </div>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Analysis in Seconds
                            </p>
                        </div>
                        <div>
                            <div className={`text-4xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent`}>
                                Detailed
                            </div>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Nutrition Breakdown
                            </p>
                        </div>
                        <div>
                            <div className={`text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent`}>
                                Smart
                            </div>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                AI Recommendations
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
