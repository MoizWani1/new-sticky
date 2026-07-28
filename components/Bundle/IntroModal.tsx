'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function IntroModal() {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', duration: 0.8 }}
                        className="max-w-md w-full text-center space-y-8 relative"
                    >
                        {/* Glowing Background Effect */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[hsl(var(--primary))] opacity-10 blur-[100px] rounded-full pointer-events-none" />

                        <div className="space-y-2 relative z-10">
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-[hsl(var(--primary))] font-mono text-sm tracking-[0.2em] uppercase"
                            >
                                StickyBits Labs Presents
                            </motion.p>
                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                            >
                                Choose Your<br />Own Pack
                            </motion.h1>
                        </div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4"
                        >
                            <div className="flex items-start gap-4 text-left">
                                <span className="text-2xl">👆</span>
                                <div>
                                    <p className="font-bold text-white">Tap to Add</p>
                                    <p className="text-sm text-gray-400">Click stickers you like to build your bundle.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 text-left">
                                <span className="text-2xl">🛍️</span>
                                <div>
                                    <p className="font-bold text-white">Checkout</p>
                                    <p className="text-sm text-gray-400">Hit "Add to Cart" when you're done.</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            onClick={() => setIsOpen(false)}
                            className="liquid-btn px-10 py-4 text-xl font-bold uppercase tracking-widest hover:scale-110 active:scale-95 transition-all w-full md:w-auto mx-auto block"
                        >
                            Start Creating
                        </motion.button>

                        <p className="text-xs text-gray-600 mt-4">© 2026 StickyBits Labs. All rights reserved.</p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
