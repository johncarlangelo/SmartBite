'use client'

import { motion } from 'motion/react'
import { Camera, ChefHat, Sparkles, BookOpen } from 'lucide-react'

interface StatsSectionProps {
    darkMode: boolean
}

export default function StatsSection({ darkMode }: StatsSectionProps) {
    const features = [
        {
            icon: <Camera size={24} />,
            title: 'Dish Recognition',
            description: 'Instantly identify any dish with AI vision technology',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: <BookOpen size={24} />,
            title: 'Nutrition Facts',
            description: 'Get detailed nutritional breakdown and ingredients',
            color: 'from-green-500 to-emerald-500'
        },
        {
            icon: <ChefHat size={24} />,
            title: 'Step-by-Step Recipes',
            description: 'Learn authentic cooking methods and techniques',
            color: 'from-orange-500 to-amber-500'
        },
        {
            icon: <Sparkles size={24} />,
            title: 'AI Recommendations',
            description: 'Discover similar dishes and healthier alternatives',
            color: 'from-purple-500 to-pink-500'
        }
    ]

    return (
        <section className={`relative py-16 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <div className="max-w-7xl mx-auto px-6 sm:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="text-center mb-12"
                >
                    <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                        Everything You Need to Know About Your Food
                    </h2>
                    <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        From identification to recipes, all powered by advanced AI
                    </p>
                </motion.div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                            whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            className={`group relative p-6 rounded-2xl backdrop-blur-sm border-2 transition-all ${
                                darkMode 
                                    ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600' 
                                    : 'bg-white border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl'
                            }`}
                        >
                            {/* Icon */}
                            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 bg-gradient-to-br ${feature.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                                {feature.icon}
                            </div>
                            
                            {/* Title */}
                            <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {feature.title}
                            </h3>
                            
                            {/* Description */}
                            <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {feature.description}
                            </p>

                            {/* Hover Glow Effect */}
                            <div 
                                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-200 -z-10 blur-xl"
                                style={{
                                    background: `linear-gradient(135deg, ${feature.color.split(' ')[0].replace('from-', '')}, ${feature.color.split(' ')[1].replace('to-', '')})`
                                }}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
