"use client";

import React from "react";
import { Camera, Menu, X } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
    darkMode?: boolean;
    isOnline?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode = true, isOnline = true }) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <nav className={`relative z-20 backdrop-blur-xl border-b transition-colors ${
            darkMode
                ? 'bg-slate-900/80 border-slate-700/50'
                : 'bg-white/80 border-gray-200'
        }`}>
            <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <div className={`text-2xl sm:text-3xl font-bold flex items-center gap-2 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                        🍽️ <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">SmartBite</span>
                    </div>

                    {/* Desktop Navigation */}
                    <ul className={`hidden md:flex gap-8 font-medium items-center ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        <li><Link href="/" className="cursor-pointer hover:text-blue-400 transition-colors">Home</Link></li>
                        <li><Link href="/analyze" className="cursor-pointer hover:text-blue-400 transition-colors">Analyze</Link></li>
                        
                        {/* Connection Status Badge */}
                        <li>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                                isOnline
                                    ? darkMode
                                        ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                        : 'bg-green-50 border-green-300 text-green-700'
                                    : darkMode
                                        ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                                        : 'bg-orange-50 border-orange-300 text-orange-700'
                            }`}>
                                <span className={`w-2 h-2 rounded-full ${
                                    isOnline ? 'bg-green-500 animate-pulse' : 'bg-orange-500'
                                }`}></span>
                                <span className="text-sm font-semibold">{isOnline ? 'Online' : 'Offline'}</span>
                            </div>
                        </li>
                    </ul>


                    {/* Mobile Menu Button */}
                    <button 
                        className={`md:hidden transition-colors ${
                            darkMode
                                ? 'text-gray-300 hover:text-white'
                                : 'text-gray-700 hover:text-gray-900'
                        }`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 space-y-3">
                        {/* Connection Status Badge - Mobile */}
                        <div className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                            isOnline
                                ? darkMode
                                    ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                    : 'bg-green-50 border-green-300 text-green-700'
                                : darkMode
                                    ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                                    : 'bg-orange-50 border-orange-300 text-orange-700'
                        }`}>
                            <span className={`w-2 h-2 rounded-full ${
                                isOnline ? 'bg-green-500 animate-pulse' : 'bg-orange-500'
                            }`}></span>
                            <span className="text-sm font-semibold">{isOnline ? 'Online' : 'Offline'}</span>
                        </div>
                        
                        <div className={`flex flex-col gap-3 font-medium ${
                            darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                            <Link href="/" className="hover:text-blue-400 transition-colors py-2">Home</Link>
                            <Link href="/analyze" className="hover:text-blue-400 transition-colors py-2">Analyze</Link>
                        </div>
                        <div className={`flex flex-col gap-2 pt-3 border-t ${
                            darkMode ? 'border-slate-700' : 'border-gray-200'
                        }`}>
                            <button className={`border px-5 py-2.5 rounded-xl transition-all font-medium w-full ${
                                darkMode
                                    ? 'border-slate-600 text-gray-300 hover:bg-slate-800'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}>
                                Sign in
                            </button>
                            <Link href="/analyze" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium w-full text-center">
                                Get Started
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;