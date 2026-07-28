'use client'

import { useBundleStore } from '@/hooks/useBundleStore'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'

export default function StickerWall() {
    const { selectedStickers, removeFromBundle } = useBundleStore()
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef
            const scrollAmount = 200
            current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    return (
        <div className="flex-1 relative flex items-center lg:flex-col lg:items-stretch lg:h-full group/wall">
            {/* Left/Up Scroll Button - Horizontal only for mobile, hidden on desktop if grid */}
            <button
                onClick={() => scroll('left')}
                className="lg:hidden absolute left-0 z-20 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm border border-white/10 opacity-0 group-hover/wall:opacity-100 transition-opacity disabled:opacity-0"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            <div
                ref={scrollContainerRef}
                className="
                    flex-1 overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden no-scrollbar 
                    flex lg:grid lg:grid-cols-2 lg:content-start
                    items-center lg:items-start gap-4 py-4 px-8 lg:px-2 mask-linear lg:mask-none scroll-smooth h-full
                "
            >
                <AnimatePresence mode="popLayout">
                    {selectedStickers.map((sticker, idx) => (
                        <motion.div
                            key={`${sticker.id}-${idx}`}
                            layout
                            initial={{ scale: 0, rotate: -20, y: 50, filter: 'brightness(2)' }}
                            animate={{
                                scale: 1,
                                rotate: 0,
                                y: 0,
                                filter: 'brightness(1)',
                                boxShadow: '0 0 20px hsl(var(--primary))'
                            }}
                            exit={{ scale: 0, opacity: 0, filter: 'brightness(0)' }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                                filter: { duration: 0.5 }
                            }}
                            className="relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 lg:w-full lg:h-32 bg-black/40 backdrop-blur-md rounded-xl border border-[hsl(var(--primary))] overflow-visible group cursor-pointer"
                        >
                            {/* Glow Effect Container */}
                            <div className="absolute inset-0 rounded-xl shadow-[0_0_15px_hsl(var(--primary))_inset] opacity-50 animate-pulse"></div>

                            <img
                                src={sticker.image_url}
                                alt={sticker.name}
                                className="w-full h-full object-contain p-2 relative z-10 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"
                            />

                            <button
                                onClick={() => removeFromBundle(sticker.id)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-20 shadow-md transform scale-75 hover:scale-100"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {selectedStickers.length === 0 && (
                    <div className="text-gray-500 text-sm italic pl-2 col-span-2 text-center lg:mt-10">
                        Your bundle is empty. <br /> Click stickers to add them!
                    </div>
                )}
            </div>

            {/* Right Scroll Button - Mobile Only */}
            <button
                onClick={() => scroll('right')}
                className="lg:hidden absolute right-0 z-20 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm border border-white/10 opacity-0 group-hover/wall:opacity-100 transition-opacity"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    )
}
