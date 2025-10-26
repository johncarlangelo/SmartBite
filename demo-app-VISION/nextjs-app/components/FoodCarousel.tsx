"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";

interface FoodCardProps {
    name: string;
    price: string;
    image: string;
    rating: number;
    cal: string;
    badge: string;
    badgeColor: string;
}

interface FoodCarouselProps {
    darkMode?: boolean;
    isOnline?: boolean;
}

const FoodCarousel: React.FC<FoodCarouselProps> = ({ darkMode = true, isOnline = true }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    const foods: FoodCardProps[] = [
        { name: "Classic Burger", image: "/images/burger.png", price: "$8.50", rating: 4.8, cal: "650 cal", badge: "Popular", badgeColor: "blue" },
        { name: "Fried Chicken", image: "/images/chicken.png", price: "$10.99", rating: 4.9, cal: "580 cal", badge: "Hot", badgeColor: "red" },
        { name: "Crispy Chips", image: "/images/chips.png", price: "$4.25", rating: 4.5, cal: "320 cal", badge: "Snack", badgeColor: "green" },
        { name: "Golden Fries", image: "/images/fries.png", price: "$3.99", rating: 4.6, cal: "380 cal", badge: "Side", badgeColor: "yellow" },
        { name: "Pizza Margherita", image: "/images/pizza.png", price: "$12.99", rating: 4.9, cal: "520 cal", badge: "Trending", badgeColor: "purple" },
        { name: "Chocolate Cake", image: "/images/cake.png", price: "$6.50", rating: 4.7, cal: "420 cal", badge: "Dessert", badgeColor: "pink" },
        { name: "Fresh Salad", image: "/images/salad.png", price: "$7.99", rating: 4.8, cal: "180 cal", badge: "Healthy", badgeColor: "green" },
        { name: "Deluxe Burger", image: "/images/burger.png", price: "$11.50", rating: 5.0, cal: "720 cal", badge: "Premium", badgeColor: "blue" },
    ];

    // Triple the items for seamless infinite scroll
    const infiniteFoods = [...foods, ...foods, ...foods];

    // Auto-scroll effect
    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        // Mark as animated after initial mount
        const timer = setTimeout(() => {
            setHasAnimated(true);
        }, 1000);

        let animationFrameId: number;
        const scrollSpeed = 0.5; // pixels per frame

        const autoScroll = () => {
            if (scrollContainer) {
                scrollContainer.scrollLeft += scrollSpeed;

                // Calculate the width of one set of items
                const itemWidth = 304; // card width (280) + gap (24)
                const singleSetWidth = itemWidth * foods.length;

                // Reset to middle when scrolled past second set (seamless loop)
                if (scrollContainer.scrollLeft >= singleSetWidth * 2) {
                    scrollContainer.scrollLeft -= singleSetWidth;
                }
            }

            animationFrameId = requestAnimationFrame(autoScroll);
        };

        // Wait a bit for DOM to be fully ready, then start scrolling
        const startTimer = setTimeout(() => {
            // Start at the middle set for seamless looping
            const itemWidth = 304;
            if (scrollContainer) {
                scrollContainer.scrollLeft = itemWidth * foods.length;
                animationFrameId = requestAnimationFrame(autoScroll);
            }
        }, 100);

        return () => {
            clearTimeout(timer);
            clearTimeout(startTimer);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [foods.length]);

    return (
        <section className="py-16 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>

            <div className="relative max-w-7xl mx-auto px-6 sm:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center justify-between mb-10"
                >
                    <div>
                        <h2 className={`text-3xl sm:text-4xl font-bold mb-2 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                            Popular <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Dishes</span>
                        </h2>
                        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Explore our most loved menu items</p>
                    </div>
                </motion.div>

                {/* Offline Message */}
                {!isOnline && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`mb-8 p-6 rounded-2xl border text-center ${
                            darkMode
                                ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                                : 'bg-orange-50 border-orange-200 text-orange-700'
                        }`}
                    >
                        <p className="text-lg font-semibold">
                            📡 Go online to see popular dishes as well as the pictures
                        </p>
                    </motion.div>
                )}

                {/* Carousel */}
                {isOnline && (
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {infiniteFoods.map((food, index) => (
                        <motion.div
                            key={`${food.name}-${index}`}
                            initial={!hasAnimated ? { opacity: 0, y: 50 } : { opacity: 1, y: 0 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={!hasAnimated ? { delay: (index % foods.length) * 0.1, duration: 0.5 } : { duration: 0 }}
                            className={`group min-w-[280px] backdrop-blur-xl border rounded-2xl p-5 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer ${
                                darkMode
                                    ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 hover:shadow-blue-500/20'
                                    : 'bg-white/80 border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-blue-500/10'
                            }`}
                        >
                            {/* Calorie Info */}
                            <div className="flex items-center justify-end mb-3">
                                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{food.cal}</span>
                            </div>

                            {/* Image */}
                            <div className={`relative w-full h-40 mb-4 rounded-xl overflow-hidden ${
                                darkMode ? 'bg-slate-900/50' : 'bg-gray-100'
                            }`}>
                                <img
                                    src={food.image}
                                    alt={food.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>

                            {/* Info */}
                            <div className="space-y-2">
                                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{food.name}</h3>
                            </div>
                        </motion.div>
                    ))}
                </div>
                )}
            </div>
        </section>
    );
};

export default FoodCarousel;