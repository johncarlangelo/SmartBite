'use client'

import { motion } from 'motion/react'
import { useState } from 'react'

type RecommendedDish = {
    name: string
    description: string
    calories: number
    cuisine: string
}

type RecommendedDishesProps = {
    ingredients: string[]
    darkMode: boolean
}

export default function RecommendedDishes({ ingredients, darkMode }: RecommendedDishesProps) {
    // Generate recommended dishes based on ingredients
    const generateRecommendations = (ingredients: string[]): RecommendedDish[] => {
        // Extract the first (most prominent) ingredient
        const prominentIngredient = ingredients.length > 0 ? ingredients[0].toLowerCase() : ''
        
        // Sample recommendation database (in production, this would come from your AI/API)
        const dishDatabase: Record<string, RecommendedDish[]> = {
            'potato': [
                { name: 'Hash Browns', description: 'Crispy shredded potato patties, perfect for breakfast.', calories: 180, cuisine: 'American' },
                { name: 'Potato Wedges', description: 'Thick-cut potato wedges with crispy edges.', calories: 220, cuisine: 'American' },
                { name: 'Mashed Potatoes', description: 'Creamy and buttery mashed potatoes.', calories: 160, cuisine: 'American' },
                { name: 'Potato Gratin', description: 'Layered potatoes baked in cream and cheese.', calories: 280, cuisine: 'French' },
            ],
            'chicken': [
                { name: 'Chicken Wings', description: 'Crispy fried wings with your favorite sauce.', calories: 320, cuisine: 'American' },
                { name: 'Chicken Tikka', description: 'Grilled marinated chicken with Indian spices.', calories: 250, cuisine: 'Indian' },
                { name: 'Chicken Teriyaki', description: 'Glazed chicken with sweet soy-based sauce.', calories: 290, cuisine: 'Japanese' },
                { name: 'BBQ Chicken', description: 'Smoky grilled chicken with BBQ sauce.', calories: 310, cuisine: 'American' },
            ],
            'chocolate': [
                { name: 'Chocolate Brownies', description: 'Rich, fudgy chocolate brownies.', calories: 350, cuisine: 'American' },
                { name: 'Chocolate Mousse', description: 'Light and airy chocolate dessert.', calories: 280, cuisine: 'French' },
                { name: 'Chocolate Chip Cookies', description: 'Classic cookies with melted chocolate chips.', calories: 150, cuisine: 'American' },
                { name: 'Hot Chocolate', description: 'Warm, creamy chocolate beverage.', calories: 190, cuisine: 'International' },
            ],
            'cheese': [
                { name: 'Mac and Cheese', description: 'Creamy macaroni pasta with melted cheese.', calories: 340, cuisine: 'American' },
                { name: 'Cheese Quesadilla', description: 'Grilled tortilla filled with melted cheese.', calories: 290, cuisine: 'Mexican' },
                { name: 'Cheese Pizza', description: 'Classic pizza with mozzarella cheese.', calories: 280, cuisine: 'Italian' },
                { name: 'Grilled Cheese', description: 'Toasted sandwich with melted cheese.', calories: 320, cuisine: 'American' },
            ],
            'rice': [
                { name: 'Fried Rice', description: 'Stir-fried rice with vegetables and seasonings.', calories: 240, cuisine: 'Asian' },
                { name: 'Risotto', description: 'Creamy Italian rice dish.', calories: 280, cuisine: 'Italian' },
                { name: 'Rice Pudding', description: 'Sweet dessert made with rice and milk.', calories: 210, cuisine: 'International' },
                { name: 'Biryani', description: 'Fragrant spiced rice with meat or vegetables.', calories: 320, cuisine: 'Indian' },
            ],
            'beef': [
                { name: 'Beef Tacos', description: 'Seasoned ground beef in crispy shells.', calories: 290, cuisine: 'Mexican' },
                { name: 'Beef Stir Fry', description: 'Quick-cooked beef with vegetables.', calories: 310, cuisine: 'Asian' },
                { name: 'Beef Burger', description: 'Juicy beef patty in a toasted bun.', calories: 450, cuisine: 'American' },
                { name: 'Beef Stew', description: 'Tender beef slow-cooked with vegetables.', calories: 340, cuisine: 'American' },
            ],
            'tomato': [
                { name: 'Tomato Soup', description: 'Smooth and creamy tomato soup.', calories: 120, cuisine: 'American' },
                { name: 'Bruschetta', description: 'Toasted bread topped with fresh tomatoes.', calories: 180, cuisine: 'Italian' },
                { name: 'Tomato Pasta', description: 'Pasta tossed in rich tomato sauce.', calories: 280, cuisine: 'Italian' },
                { name: 'Caprese Salad', description: 'Fresh tomatoes, mozzarella, and basil.', calories: 220, cuisine: 'Italian' },
            ],
            'egg': [
                { name: 'Scrambled Eggs', description: 'Fluffy scrambled eggs.', calories: 140, cuisine: 'American' },
                { name: 'Omelet', description: 'Folded egg dish with various fillings.', calories: 180, cuisine: 'French' },
                { name: 'Egg Fried Rice', description: 'Fried rice with scrambled eggs.', calories: 260, cuisine: 'Asian' },
                { name: 'Deviled Eggs', description: 'Hard-boiled eggs with creamy filling.', calories: 130, cuisine: 'American' },
            ],
        }

        // Find matching dishes based on ingredients
        let recommendations: RecommendedDish[] = []
        
        // Search for dishes matching the prominent ingredient
        for (const key in dishDatabase) {
            if (prominentIngredient.includes(key) || key.includes(prominentIngredient)) {
                recommendations.push(...dishDatabase[key])
                break // Only use the first match for the prominent ingredient
            }
        }

        // If no matches found, return general recommendations
        if (recommendations.length === 0) {
            recommendations = [
                { name: 'Caesar Salad', description: 'Fresh romaine lettuce with Caesar dressing.', calories: 180, cuisine: 'Italian' },
                { name: 'Spring Rolls', description: 'Crispy fried rolls with vegetable filling.', calories: 160, cuisine: 'Asian' },
                { name: 'Garlic Bread', description: 'Toasted bread with garlic butter.', calories: 150, cuisine: 'Italian' },
                { name: 'French Fries', description: 'Crispy golden fried potatoes.', calories: 220, cuisine: 'American' },
                { name: 'Onion Rings', description: 'Battered and fried onion rings.', calories: 240, cuisine: 'American' },
                { name: 'Nachos', description: 'Tortilla chips topped with cheese and toppings.', calories: 300, cuisine: 'Mexican' },
            ]
        }

        // Remove duplicates and limit to 8 recommendations
        const uniqueRecommendations = Array.from(
            new Map(recommendations.map(item => [item.name, item])).values()
        ).slice(0, 8)

        return uniqueRecommendations
    }

    const recommendations = generateRecommendations(ingredients)
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    return (
        <div className="mt-8">
            <h3 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="28" 
                    height="28" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className={darkMode ? 'text-yellow-400' : 'text-yellow-600'}
                >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Recommended Dishes
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((dish, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        onHoverStart={() => setHoveredIndex(index)}
                        onHoverEnd={() => setHoveredIndex(null)}
                        className={`
                            relative rounded-xl shadow-md cursor-pointer
                            transition-all duration-500 ease-in-out
                            ${darkMode 
                                ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50' 
                                : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
                            }
                            hover:shadow-xl
                        `}
                        style={{
                            // Fixed height to prevent layout shifts
                            minHeight: hoveredIndex === index ? '180px' : '140px',
                        }}
                    >
                        <div className="p-5">
                            {/* Always visible content */}
                            <h4 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {dish.name}
                            </h4>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {dish.description}
                            </p>

                            {/* Expanded content with animation */}
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{
                                    opacity: hoveredIndex === index ? 1 : 0,
                                    height: hoveredIndex === index ? 'auto' : 0,
                                }}
                                transition={{ duration: 0.4, ease: 'easeInOut' }}
                                className="overflow-hidden"
                            >
                                <motion.div
                                    initial={{ y: -10 }}
                                    animate={{ 
                                        y: hoveredIndex === index ? 0 : -10,
                                    }}
                                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                                    className="mt-4 pt-4 border-t border-opacity-20 space-y-2"
                                    style={{
                                        borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Approximate Calories:
                                        </span>
                                        <span className={`text-sm font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                                            {dish.calories} kcal
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Cuisine Type:
                                        </span>
                                        <span className={`text-sm font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                            {dish.cuisine}
                                        </span>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
