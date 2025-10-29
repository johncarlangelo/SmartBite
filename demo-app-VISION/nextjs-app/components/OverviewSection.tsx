'use client'

import { motion } from 'motion/react'
import { Eye, Salad, ChefHat, Sparkles, Brain, Camera, Zap, Shield, TrendingUp } from 'lucide-react'

interface OverviewSectionProps {
    darkMode: boolean
}

export default function OverviewSection({ darkMode }: OverviewSectionProps) {
    const features = [
        {
            icon: <Camera size={32} />,
            title: 'AI-Powered Analysis',
            description: 'Upload any food image and get instant dish identification with advanced vision AI technology.',
            color: 'from-blue-500 to-cyan-500',
            badge: 'Vision AI'
        },
        {
            icon: <Salad size={32} />,
            title: 'Nutritional Insights',
            description: 'Discover detailed nutrition facts, ingredients, and macro breakdowns with visual charts.',
            color: 'from-green-500 to-emerald-500',
            badge: 'Detailed'
        },
        {
            icon: <ChefHat size={32} />,
            title: 'Step-by-Step Recipes',
            description: 'Learn how to recreate dishes with detailed cooking instructions and preparation times.',
            color: 'from-orange-500 to-amber-500',
            badge: 'Guided'
        },
        {
            icon: <Sparkles size={32} />,
            title: 'Smart Recommendations',
            description: 'Get personalized dish suggestions based on your preferences and dietary needs.',
            color: 'from-purple-500 to-pink-500',
            badge: 'Personalized'
        }
    ]

    const stats = [
        {
            icon: <Zap size={24} />,
            value: 'Instant',
            label: 'Analysis in Seconds',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: <TrendingUp size={24} />,
            value: 'Accurate',
            label: 'AI-Powered Results',
            color: 'from-purple-500 to-pink-500'
        },
        {
            icon: <Shield size={24} />,
            value: 'Trusted',
            label: 'Reliable Data',
            color: 'from-green-500 to-emerald-500'
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
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6 backdrop-blur-xl"
                        style={{
                            background: darkMode 
                                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))'
                                : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
                            border: `2px solid ${darkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`,
                            boxShadow: darkMode 
                                ? '0 4px 20px rgba(139, 92, 246, 0.2)' 
                                : '0 4px 20px rgba(139, 92, 246, 0.1)'
                        }}
                    >
                        <Brain className={darkMode ? 'text-purple-400' : 'text-purple-600'} size={20} />
                        <span className={`text-sm font-bold ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                            Powered by Advanced AI
                        </span>
                    </div>
                    
                    <h2 className={`text-5xl md:text-6xl font-bold mb-6 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                        Discover, Analyze & Learn
                    </h2>
                    
                    <p className={`text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        Transform how you understand food with cutting-edge AI. 
                        Upload a photo and unlock comprehensive nutritional insights instantly.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -12, scale: 1.02 }}
                            className={`group relative rounded-3xl p-8 transition-all duration-300 backdrop-blur-xl ${
                                darkMode 
                                    ? 'bg-slate-800/40 hover:bg-slate-800/60 border-2 border-slate-700/50 hover:border-slate-600' 
                                    : 'bg-white/80 hover:bg-white border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-2xl'
                            }`}
                            style={{
                                boxShadow: darkMode 
                                    ? '0 10px 40px rgba(0, 0, 0, 0.3)' 
                                    : '0 10px 40px rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            {/* Gradient Glow Effect */}
                            <div 
                                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10 blur-2xl"
                                style={{
                                    background: `linear-gradient(135deg, ${feature.color.split(' ')[0].replace('from-', '')}, ${feature.color.split(' ')[1].replace('to-', '')})`
                                }}
                            />
                            
                            {/* Badge */}
                            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                                darkMode ? 'bg-slate-700/50 text-gray-300' : 'bg-gray-100 text-gray-700'
                            }`}>
                                {feature.badge}
                            </div>
                            
                            {/* Icon */}
                            <div 
                                className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 bg-gradient-to-br ${feature.color} text-white shadow-xl group-hover:scale-110 transition-transform duration-300`}
                            >
                                {feature.icon}
                            </div>
                            
                            {/* Content */}
                            <h3 className={`text-2xl font-bold mb-3 ${
                                darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                                {feature.title}
                            </h3>
                            
                            <p className={`text-base leading-relaxed ${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className={`rounded-3xl p-10 border-2 backdrop-blur-xl ${
                        darkMode 
                            ? 'bg-slate-800/40 border-slate-700/50' 
                            : 'bg-white/80 border-gray-200 shadow-xl'
                    }`}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                                className="text-center"
                            >
                                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                                    {stat.icon}
                                </div>
                                <div className={`text-5xl font-bold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                    {stat.value}
                                </div>
                                <p className={`text-base font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {stat.label}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
