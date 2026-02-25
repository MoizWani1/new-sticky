'use client'

import { useBundleStore } from '@/hooks/useBundleStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check } from 'lucide-react'
import Image from 'next/image'

interface StickerGridProps {
    products: any[]
}

export default function StickerGrid({ products }: StickerGridProps) {
    const { currentCategory, addToBundle, removeFromBundle, selectedStickers } = useBundleStore()

    const filteredProducts = products.filter(p => {
        const isSticker = p.type === 'Sticker' || !p.type
        const matchesCategory = currentCategory === 'All' || p.category === currentCategory
        return isSticker && matchesCategory
    })

    const isStickerSelected = (id: string) => selectedStickers.some(item => item.id === id)

    const toggleSticker = (product: any) => {
        if (isStickerSelected(product.id)) {
            removeFromBundle(product.id)
        } else {
            addToBundle({
                id: product.id,
                name: product.name,
                image_url: product.image_url,
                category: product.category || 'Uncategorized'
            })
        }
    }


    return (
        <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4 pb-32"
        >
            <AnimatePresence mode="popLayout">
                {filteredProducts.map((sticker) => {
                    const isSelected = isStickerSelected(sticker.id)
                    return (
                        <motion.div
                            layout
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                            key={sticker.id}
                            className={`relative group cursor-pointer transition-all duration-200 ${isSelected
                                ? 'skeuo-inset ring-2 ring-[#F1D97C] scale-95'
                                : 'skeuo-card hover:-translate-y-1'
                                }`}
                            onClick={() => toggleSticker(sticker)}
                        >
                            <div className="aspect-square relative p-2 md:p-4 bg-[#151515] overflow-hidden rounded-t-xl">
                                <Image
                                    src={sticker.image_url}
                                    alt={sticker.name}
                                    fill
                                    className="object-contain drop-shadow-lg"
                                    sizes="(max-width: 768px) 33vw, 20vw"
                                />
                                {/* Selection Indicator */}
                                <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shadow-md ${isSelected
                                    ? 'bg-[#F1D97C] border-[#F1D97C] text-black'
                                    : 'bg-black/50 border-white/20 select-none'
                                    }`}>
                                    {isSelected && <Check className="w-4 h-4" />}
                                </div>
                            </div>
                            <div className="p-2 bg-gradient-to-b from-[#1a1a1a] to-[#111]">
                                <p className="text-[10px] md:text-xs font-bold text-gray-300 truncate text-shadow-sm">{sticker.name}</p>
                            </div>
                        </motion.div>
                    )
                })}
            </AnimatePresence>

            {filteredProducts.length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-500">
                    No stickers found in this category.
                </div>
            )}
        </motion.div>
    )
}
