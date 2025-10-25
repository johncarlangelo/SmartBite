'use client'

import { motion } from 'motion/react'
import { useState } from 'react'

type RecommendedDish = {
    name: string
    description: string
    calories: number
    cuisine: string
    allergens: string[]
    isHalal: boolean
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
                { name: 'Hash Browns', description: 'Crispy shredded potato patties, perfect for breakfast.', calories: 180, cuisine: 'American', allergens: [], isHalal: true },
                { name: 'Potato Wedges', description: 'Thick-cut potato wedges with crispy edges.', calories: 220, cuisine: 'American', allergens: [], isHalal: true },
                { name: 'Mashed Potatoes', description: 'Creamy and buttery mashed potatoes.', calories: 160, cuisine: 'American', allergens: ['Dairy'], isHalal: true },
                { name: 'Potato Gratin', description: 'Layered potatoes baked in cream and cheese.', calories: 280, cuisine: 'French', allergens: ['Dairy'], isHalal: true },
            ],
            'chicken': [
                { name: 'Chicken Wings', description: 'Crispy fried wings with your favorite sauce.', calories: 320, cuisine: 'American', allergens: ['Gluten'], isHalal: true },
                { name: 'Chicken Tikka', description: 'Grilled marinated chicken with Indian spices.', calories: 250, cuisine: 'Indian', allergens: ['Dairy'], isHalal: true },
                { name: 'Chicken Teriyaki', description: 'Glazed chicken with sweet soy-based sauce.', calories: 290, cuisine: 'Japanese', allergens: ['Soy', 'Gluten'], isHalal: true },
                { name: 'BBQ Chicken', description: 'Smoky grilled chicken with BBQ sauce.', calories: 310, cuisine: 'American', allergens: [], isHalal: true },
            ],
            'chocolate': [
                { name: 'Chocolate Brownies', description: 'Rich, fudgy chocolate brownies.', calories: 350, cuisine: 'American', allergens: ['Eggs', 'Gluten', 'Dairy'], isHalal: true },
                { name: 'Chocolate Mousse', description: 'Light and airy chocolate dessert.', calories: 280, cuisine: 'French', allergens: ['Eggs', 'Dairy'], isHalal: true },
                { name: 'Chocolate Chip Cookies', description: 'Classic cookies with melted chocolate chips.', calories: 150, cuisine: 'American', allergens: ['Eggs', 'Gluten', 'Dairy'], isHalal: true },
                { name: 'Hot Chocolate', description: 'Warm, creamy chocolate beverage.', calories: 190, cuisine: 'International', allergens: ['Dairy'], isHalal: true },
            ],
            'cheese': [
                { name: 'Mac and Cheese', description: 'Creamy macaroni pasta with melted cheese.', calories: 340, cuisine: 'American', allergens: ['Dairy', 'Gluten'], isHalal: true },
                { name: 'Cheese Quesadilla', description: 'Grilled tortilla filled with melted cheese.', calories: 290, cuisine: 'Mexican', allergens: ['Dairy', 'Gluten'], isHalal: true },
                { name: 'Cheese Pizza', description: 'Classic pizza with mozzarella cheese.', calories: 280, cuisine: 'Italian', allergens: ['Dairy', 'Gluten'], isHalal: true },
                { name: 'Grilled Cheese', description: 'Toasted sandwich with melted cheese.', calories: 320, cuisine: 'American', allergens: ['Dairy', 'Gluten'], isHalal: true },
            ],
            'rice': [
                { name: 'Fried Rice', description: 'Stir-fried rice with vegetables and seasonings.', calories: 240, cuisine: 'Asian', allergens: ['Soy', 'Eggs'], isHalal: true },
                { name: 'Risotto', description: 'Creamy Italian rice dish.', calories: 280, cuisine: 'Italian', allergens: ['Dairy'], isHalal: true },
                { name: 'Rice Pudding', description: 'Sweet dessert made with rice and milk.', calories: 210, cuisine: 'International', allergens: ['Dairy'], isHalal: true },
                { name: 'Biryani', description: 'Fragrant spiced rice with meat or vegetables.', calories: 320, cuisine: 'Indian', allergens: ['Dairy'], isHalal: true },
            ],
            'beef': [
                { name: 'Beef Tacos', description: 'Seasoned ground beef in crispy shells.', calories: 290, cuisine: 'Mexican', allergens: ['Gluten'], isHalal: false },
                { name: 'Beef Stir Fry', description: 'Quick-cooked beef with vegetables.', calories: 310, cuisine: 'Asian', allergens: ['Soy'], isHalal: false },
                { name: 'Beef Burger', description: 'Juicy beef patty in a toasted bun.', calories: 450, cuisine: 'American', allergens: ['Gluten', 'Dairy'], isHalal: false },
                { name: 'Beef Stew', description: 'Tender beef slow-cooked with vegetables.', calories: 340, cuisine: 'American', allergens: [], isHalal: false },
            ],
            'tomato': [
                { name: 'Tomato Soup', description: 'Smooth and creamy tomato soup.', calories: 120, cuisine: 'American', allergens: ['Dairy'], isHalal: true },
                { name: 'Bruschetta', description: 'Toasted bread topped with fresh tomatoes.', calories: 180, cuisine: 'Italian', allergens: ['Gluten'], isHalal: true },
                { name: 'Tomato Pasta', description: 'Pasta tossed in rich tomato sauce.', calories: 280, cuisine: 'Italian', allergens: ['Gluten'], isHalal: true },
                { name: 'Caprese Salad', description: 'Fresh tomatoes, mozzarella, and basil.', calories: 220, cuisine: 'Italian', allergens: ['Dairy'], isHalal: true },
            ],
            'egg': [
                { name: 'Scrambled Eggs', description: 'Fluffy scrambled eggs.', calories: 140, cuisine: 'American', allergens: ['Eggs'], isHalal: true },
                { name: 'Omelet', description: 'Folded egg dish with various fillings.', calories: 180, cuisine: 'French', allergens: ['Eggs', 'Dairy'], isHalal: true },
                { name: 'Egg Fried Rice', description: 'Fried rice with scrambled eggs.', calories: 260, cuisine: 'Asian', allergens: ['Eggs', 'Soy'], isHalal: true },
                { name: 'Deviled Eggs', description: 'Hard-boiled eggs with creamy filling.', calories: 130, cuisine: 'American', allergens: ['Eggs'], isHalal: true },
            ],
            'flour': [
                { name: 'Waffles', description: 'Crispy golden waffles with syrup.', calories: 290, cuisine: 'American', allergens: ['Gluten', 'Eggs', 'Dairy'], isHalal: true },
                { name: 'Crepes', description: 'Thin French pancakes with sweet or savory fillings.', calories: 180, cuisine: 'French', allergens: ['Gluten', 'Eggs', 'Dairy'], isHalal: true },
                { name: 'Biscuits', description: 'Fluffy buttermilk biscuits.', calories: 220, cuisine: 'American', allergens: ['Gluten', 'Dairy'], isHalal: true },
                { name: 'Pizza Dough', description: 'Fresh homemade pizza base.', calories: 250, cuisine: 'Italian', allergens: ['Gluten'], isHalal: true },
            ],
            'milk': [
                { name: 'Milkshake', description: 'Creamy blended ice cream drink.', calories: 350, cuisine: 'American', allergens: ['Dairy'], isHalal: true },
                { name: 'Custard', description: 'Smooth vanilla custard dessert.', calories: 200, cuisine: 'French', allergens: ['Dairy', 'Eggs'], isHalal: true },
                { name: 'Ice Cream', description: 'Frozen creamy dessert in various flavors.', calories: 270, cuisine: 'International', allergens: ['Dairy'], isHalal: true },
                { name: 'Pudding', description: 'Sweet milk-based dessert.', calories: 190, cuisine: 'American', allergens: ['Dairy'], isHalal: true },
            ],
            'sugar': [
                { name: 'Donuts', description: 'Sweet fried dough rings with glaze.', calories: 320, cuisine: 'American', allergens: ['Gluten', 'Eggs', 'Dairy'], isHalal: true },
                { name: 'Cookies', description: 'Sweet baked treats in various flavors.', calories: 150, cuisine: 'American', allergens: ['Gluten', 'Eggs', 'Dairy'], isHalal: true },
                { name: 'Cupcakes', description: 'Small frosted cakes.', calories: 280, cuisine: 'American', allergens: ['Gluten', 'Eggs', 'Dairy'], isHalal: true },
                { name: 'Macarons', description: 'Delicate French meringue cookies.', calories: 90, cuisine: 'French', allergens: ['Eggs'], isHalal: true },
            ],
            'butter': [
                { name: 'Croissants', description: 'Flaky buttery French pastry.', calories: 230, cuisine: 'French', allergens: ['Gluten', 'Dairy'], isHalal: true },
                { name: 'Shortbread', description: 'Buttery Scottish cookies.', calories: 160, cuisine: 'Scottish', allergens: ['Gluten', 'Dairy'], isHalal: true },
                { name: 'Butter Cookies', description: 'Classic rich butter cookies.', calories: 140, cuisine: 'Danish', allergens: ['Gluten', 'Dairy', 'Eggs'], isHalal: true },
                { name: 'Brioche', description: 'Rich, buttery French bread.', calories: 210, cuisine: 'French', allergens: ['Gluten', 'Dairy', 'Eggs'], isHalal: true },
            ],
            'vanilla': [
                { name: 'Vanilla Cake', description: 'Classic vanilla layer cake.', calories: 320, cuisine: 'American', allergens: ['Gluten', 'Eggs', 'Dairy'], isHalal: true },
                { name: 'Vanilla Ice Cream', description: 'Creamy vanilla frozen dessert.', calories: 250, cuisine: 'American', allergens: ['Dairy'], isHalal: true },
                { name: 'Vanilla Pudding', description: 'Smooth vanilla custard.', calories: 180, cuisine: 'American', allergens: ['Dairy'], isHalal: true },
                { name: 'Vanilla Cookies', description: 'Sweet vanilla-flavored cookies.', calories: 140, cuisine: 'American', allergens: ['Gluten', 'Eggs', 'Dairy'], isHalal: true },
            ],
            'bread': [
                { name: 'French Toast', description: 'Egg-dipped bread cooked until golden.', calories: 220, cuisine: 'French', allergens: ['Gluten', 'Eggs', 'Dairy'], isHalal: true },
                { name: 'Bread Pudding', description: 'Sweet baked dessert with bread and custard.', calories: 280, cuisine: 'British', allergens: ['Gluten', 'Eggs', 'Dairy'], isHalal: true },
                { name: 'Garlic Bread', description: 'Toasted bread with garlic butter.', calories: 150, cuisine: 'Italian', allergens: ['Gluten', 'Dairy'], isHalal: true },
                { name: 'Bruschetta', description: 'Grilled bread with toppings.', calories: 180, cuisine: 'Italian', allergens: ['Gluten'], isHalal: true },
            ],
            'pasta': [
                { name: 'Spaghetti Carbonara', description: 'Pasta with creamy egg and bacon sauce.', calories: 380, cuisine: 'Italian', allergens: ['Gluten', 'Eggs', 'Dairy'], isHalal: false },
                { name: 'Fettuccine Alfredo', description: 'Pasta in rich cream sauce.', calories: 420, cuisine: 'Italian', allergens: ['Gluten', 'Dairy'], isHalal: true },
                { name: 'Lasagna', description: 'Layered pasta with meat and cheese.', calories: 450, cuisine: 'Italian', allergens: ['Gluten', 'Dairy'], isHalal: false },
                { name: 'Penne Arrabbiata', description: 'Pasta in spicy tomato sauce.', calories: 290, cuisine: 'Italian', allergens: ['Gluten'], isHalal: true },
            ],
            'pork': [
                { name: 'Pork Chops', description: 'Grilled or pan-fried pork chops.', calories: 340, cuisine: 'American', allergens: [], isHalal: false },
                { name: 'BBQ Ribs', description: 'Slow-cooked ribs with BBQ sauce.', calories: 480, cuisine: 'American', allergens: [], isHalal: false },
                { name: 'Pork Dumplings', description: 'Steamed dumplings with pork filling.', calories: 260, cuisine: 'Asian', allergens: ['Gluten', 'Soy'], isHalal: false },
                { name: 'Tonkatsu', description: 'Breaded fried pork cutlet.', calories: 390, cuisine: 'Japanese', allergens: ['Gluten', 'Eggs'], isHalal: false },
            ],
            'fish': [
                { name: 'Fish and Chips', description: 'Battered fried fish with fries.', calories: 450, cuisine: 'British', allergens: ['Fish', 'Gluten'], isHalal: true },
                { name: 'Grilled Salmon', description: 'Perfectly grilled salmon fillet.', calories: 280, cuisine: 'International', allergens: ['Fish'], isHalal: true },
                { name: 'Fish Tacos', description: 'Fried fish in soft tortillas.', calories: 320, cuisine: 'Mexican', allergens: ['Fish', 'Gluten'], isHalal: true },
                { name: 'Sushi', description: 'Japanese rice with raw fish.', calories: 220, cuisine: 'Japanese', allergens: ['Fish', 'Soy'], isHalal: true },
            ],
        }

        // Find matching dishes based on ingredients
        let recommendations: RecommendedDish[] = []
        
        // Search for dishes matching the prominent ingredient
        // Try to match the prominent ingredient with database keys
        for (const key in dishDatabase) {
            if (prominentIngredient.includes(key) || key.includes(prominentIngredient)) {
                recommendations.push(...dishDatabase[key])
                break // Only use the first match for the prominent ingredient
            }
        }

        // If still no matches, try checking all ingredients for a match
        if (recommendations.length === 0 && ingredients.length > 1) {
            for (const ingredient of ingredients.slice(0, 3)) {
                const lowerIngredient = ingredient.toLowerCase()
                for (const key in dishDatabase) {
                    if (lowerIngredient.includes(key) || key.includes(lowerIngredient)) {
                        recommendations.push(...dishDatabase[key])
                        break
                    }
                }
                if (recommendations.length > 0) break
            }
        }

        // If no matches found, return general recommendations
        if (recommendations.length === 0) {
            recommendations = [
                { name: 'Caesar Salad', description: 'Fresh romaine lettuce with Caesar dressing.', calories: 180, cuisine: 'Italian', allergens: ['Dairy', 'Eggs'], isHalal: true },
                { name: 'Spring Rolls', description: 'Crispy fried rolls with vegetable filling.', calories: 160, cuisine: 'Asian', allergens: ['Gluten', 'Soy'], isHalal: true },
                { name: 'Garlic Bread', description: 'Toasted bread with garlic butter.', calories: 150, cuisine: 'Italian', allergens: ['Gluten', 'Dairy'], isHalal: true },
                { name: 'French Fries', description: 'Crispy golden fried potatoes.', calories: 220, cuisine: 'American', allergens: [], isHalal: true },
                { name: 'Onion Rings', description: 'Battered and fried onion rings.', calories: 240, cuisine: 'American', allergens: ['Gluten'], isHalal: true },
                { name: 'Nachos', description: 'Tortilla chips topped with cheese and toppings.', calories: 300, cuisine: 'Mexican', allergens: ['Dairy'], isHalal: true },
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
                            minHeight: hoveredIndex === index ? '240px' : '140px',
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
                                    <div className="flex items-start gap-2">
                                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} flex-shrink-0`}>
                                            Allergens:
                                        </span>
                                        <span className={`text-sm font-semibold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                                            {dish.allergens.length > 0 ? dish.allergens.join(', ') : 'None'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Halal:
                                        </span>
                                        <span className={`text-sm font-semibold ${dish.isHalal ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-red-400' : 'text-red-600')}`}>
                                            {dish.isHalal ? 'Yes' : 'No'}
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
