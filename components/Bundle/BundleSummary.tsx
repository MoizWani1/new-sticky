'use client'

import { useBundleStore } from '@/hooks/useBundleStore'
import { useCartStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, X } from 'lucide-react'
import StickerWall from './StickerWall'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BundleSummary() {
    const router = useRouter()
    const { selectedStickers, clearBundle } = useBundleStore()
    const { addItem } = useCartStore()
    const [adding, setAdding] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)

    const totalCount = selectedStickers.length
    const stickerPrice = 35
    const totalPrice = totalCount * stickerPrice

    if (totalCount === 0) return null

    const handleAddToCart = () => {
        setAdding(true)
        // Create a custom bundle item
        const bundleItem = {
            id: `bundle-${Date.now()}`, // Unique ID for this specific bundle configuration
            name: 'Custom Sticker Bundle',
            price: totalPrice,
            quantity: 1,
            image_url: selectedStickers[0]?.image_url || '', // Use first sticker as thumbnail
            bundleItems: selectedStickers.map(s => ({
                name: s.name,
                image_url: s.image_url
            }))
        }

        addItem(bundleItem)
        clearBundle()
        setAdding(false)
        router.push('/cart')
    }



    return (
        <AnimatePresence>
            <motion.div
                layout
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className={`
                    fixed bottom-0 left-0 right-0 z-50 
                    bg-black/95 backdrop-blur-xl border-t border-[hsl(var(--primary))/0.3] shadow-[0_-5px_30px_rgba(0,0,0,0.8)]
                    lg:static lg:h-screen lg:w-[400px] lg:flex lg:flex-col lg:justify-between lg:py-8 lg:px-6 lg:border-t-0 lg:border-l lg:bg-black/90
                    lg:sticky lg:top-0 transition-all duration-300
                    ${isExpanded ? 'h-[80vh] rounded-t-3xl' : 'h-16 lg:h-screen'}
                `}
            >
                {/* Mobile Toggle Handle */}
                <div
                    className="absolute top-0 left-0 right-0 h-8 flex items-center justify-center lg:hidden cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="w-12 h-1 bg-white/20 rounded-full"></div>
                </div>

                <div className="container mx-auto px-4 h-full flex flex-col lg:px-0">

                    {/* Compact Mobile Header (Visible when collapsed) */}
                    <div
                        className={`flex items-center justify-between h-16 lg:hidden ${isExpanded ? 'hidden' : 'flex'}`}
                        onClick={() => setIsExpanded(true)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-[hsl(var(--primary))] text-black text-xs font-bold px-2 py-1 rounded-full">
                                {totalCount} Items
                            </div>
                            <span className="text-gray-400 text-sm">Tap to view</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-[hsl(var(--primary))]">Rs. {totalPrice}</span>
                            <button className="bg-[hsl(var(--primary))] text-black p-2 rounded-full">
                                <ShoppingBag className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Full Content (Visible when expanded or on Desktop) */}
                    <div className={`${isExpanded ? 'flex' : 'hidden'} lg:flex flex-col h-full lg:justify-between gap-6 pt-10 lg:pt-0`}>

                        {/* Header Desktop */}
                        <div className="hidden lg:block text-center space-y-2">
                            <h2 className="text-2xl font-bold uppercase tracking-widest text-[hsl(var(--primary))]">Your Bundle</h2>
                            <p className="text-sm text-gray-400">Review your collection</p>
                            <p className="text-xs text-[hsl(var(--primary))] opacity-80 font-mono mt-1">
                                * Each sticker will be approx 2-3 inches
                            </p>
                        </div>

                        {/* Mobile Expanded Header */}
                        <div className="lg:hidden flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-[hsl(var(--primary))]">Your Bundle</h2>
                            <button onClick={() => setIsExpanded(false)}>
                                <X className="w-6 h-6 text-white" />
                            </button>
                        </div>

                        {/* Sticker Wall Visualization */}
                        <div className="w-full flex-1 overflow-auto min-h-[200px] lg:min-h-0 bg-white/5 rounded-xl border border-white/10 lg:bg-transparent lg:border-0 lg:overflow-hidden p-2 lg:p-0">
                            <StickerWall />
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-4 mt-auto pb-6 lg:pb-0">
                            <div className="flex justify-between items-end border-t border-white/10 pt-4">
                                <div className="text-sm text-gray-400">{totalCount} Stickers</div>
                                <div className="text-3xl font-bold text-[hsl(var(--primary))] glow-text">
                                    Rs. {totalPrice}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={adding}
                                    className="liquid-btn w-full py-4 flex items-center justify-center gap-2 font-bold uppercase tracking-wider hover:scale-105 transition-transform text-lg rounded-xl"
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    <span>{adding ? 'Adding...' : 'Add To Cart'}</span>
                                </button>
                                <button
                                    onClick={clearBundle}
                                    className="w-full py-3 rounded-xl border border-white/20 hover:bg-red-500/10 hover:border-red-500 text-white transition-all text-sm"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
