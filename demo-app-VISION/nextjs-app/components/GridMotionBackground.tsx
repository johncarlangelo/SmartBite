'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'

interface GridMotionBackgroundProps {
    darkMode: boolean
    images?: string[]
}

export default function GridMotionBackground({ darkMode, images = [] }: GridMotionBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas size
        const updateSize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        updateSize()
        window.addEventListener('resize', updateSize)

        // Grid settings
        const gridSize = 60
        const dots: { x: number; y: number; vx: number; vy: number }[] = []

        // Create grid dots
        for (let x = 0; x < canvas.width; x += gridSize) {
            for (let y = 0; y < canvas.height; y += gridSize) {
                dots.push({
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                })
            }
        }

        // Animation
        let animationId: number
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Draw connections
            dots.forEach((dot, i) => {
                dots.forEach((otherDot, j) => {
                    if (i < j) {
                        const dx = dot.x - otherDot.x
                        const dy = dot.y - otherDot.y
                        const distance = Math.sqrt(dx * dx + dy * dy)

                        if (distance < gridSize * 1.5) {
                            const opacity = 1 - distance / (gridSize * 1.5)
                            ctx.strokeStyle = darkMode
                                ? `rgba(100, 116, 139, ${opacity * 0.3})`
                                : `rgba(148, 163, 184, ${opacity * 0.2})`
                            ctx.lineWidth = 1
                            ctx.beginPath()
                            ctx.moveTo(dot.x, dot.y)
                            ctx.lineTo(otherDot.x, otherDot.y)
                            ctx.stroke()
                        }
                    }
                })

                // Draw dots
                ctx.fillStyle = darkMode
                    ? 'rgba(59, 130, 246, 0.6)'
                    : 'rgba(37, 99, 235, 0.4)'
                ctx.beginPath()
                ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2)
                ctx.fill()

                // Update positions
                dot.x += dot.vx
                dot.y += dot.vy

                // Bounce off edges
                if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1
                if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1

                // Keep dots within bounds
                dot.x = Math.max(0, Math.min(canvas.width, dot.x))
                dot.y = Math.max(0, Math.min(canvas.height, dot.y))
            })

            animationId = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            cancelAnimationFrame(animationId)
            window.removeEventListener('resize', updateSize)
        }
    }, [darkMode])

    return (
        <>
            {/* Background gradient */}
            <div
                className={`fixed inset-0 -z-20 transition-colors duration-300 ${darkMode
                        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
                        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
                    }`}
            />

            {/* Floating food images */}
            {images.length > 0 && (
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                    {images.map((img, idx) => (
                        <motion.div
                            key={idx}
                            className="absolute"
                            initial={{
                                x: Math.random() * window.innerWidth,
                                y: Math.random() * window.innerHeight,
                                opacity: 0.1,
                                scale: 0.3
                            }}
                            animate={{
                                x: [
                                    Math.random() * window.innerWidth,
                                    Math.random() * window.innerWidth,
                                    Math.random() * window.innerWidth,
                                ],
                                y: [
                                    Math.random() * window.innerHeight,
                                    Math.random() * window.innerHeight,
                                    Math.random() * window.innerHeight,
                                ],
                                rotate: [0, 360],
                                opacity: [0.1, 0.15, 0.1],
                            }}
                            transition={{
                                duration: 20 + idx * 5,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        >
                            <img
                                src={img}
                                alt=""
                                className="w-32 h-32 object-cover rounded-full blur-sm"
                                style={{ opacity: darkMode ? 0.08 : 0.12 }}
                            />
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Animated grid canvas */}
            <canvas
                ref={canvasRef}
                className="fixed inset-0 -z-10 pointer-events-none"
                style={{ opacity: darkMode ? 0.4 : 0.3 }}
            />
        </>
    )
}
