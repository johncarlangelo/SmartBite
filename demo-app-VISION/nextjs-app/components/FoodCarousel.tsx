"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Star, TrendingUp, Flame } from "lucide-react";
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
}

const FoodCarousel: React.FC<FoodCarouselProps> = ({ darkMode = true }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

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

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    const getBadgeStyles = (color: string) => {
        const styles: Record<string, string> = {
            blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
            red: "bg-red-500/20 text-red-400 border-red-500/30",
            green: "bg-green-500/20 text-green-400 border-green-500/30",
            yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
            purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
            pink: "bg-pink-500/20 text-pink-400 border-pink-500/30",
        };
        return styles[color] || styles.blue;
    };

    const getBadgeIcon = (badge: string) => {
        if (badge === "Hot" || badge === "Trending") return <Flame size={14} />;
        if (badge === "Popular" || badge === "Premium") return <TrendingUp size={14} />;
        return null;
    };

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

                    {/* Navigation Buttons */}
                    <div className="hidden sm:flex gap-2">
                        <button
                            onClick={() => scroll("left")}
                            className={`p-3 rounded-xl backdrop-blur-xl border transition-all ${
                                darkMode
                                    ? 'bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700 hover:border-slate-600'
                                    : 'bg-white/80 border-gray-200 text-gray-900 hover:bg-white hover:border-gray-300'
                            }`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            className={`p-3 rounded-xl backdrop-blur-xl border transition-all ${
                                darkMode
                                    ? 'bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700 hover:border-slate-600'
                                    : 'bg-white/80 border-gray-200 text-gray-900 hover:bg-white hover:border-gray-300'
                            }`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </motion.div>

                {/* Carousel */}
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {foods.map((food, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className={`group min-w-[280px] backdrop-blur-xl border rounded-2xl p-5 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer ${
                                darkMode
                                    ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 hover:shadow-blue-500/20'
                                    : 'bg-white/80 border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-blue-500/10'
                            }`}
                        >
                            {/* Badge */}
                            <div className="flex items-center justify-between mb-3">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeStyles(food.badgeColor)}`}>
                                    {getBadgeIcon(food.badge)}
                                    {food.badge}
                                </span>
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

                                {/* Rating */}
                                <div className="flex items-center gap-1">
                                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                    <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{food.rating}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FoodCarousel;