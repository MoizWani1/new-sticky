
'use client'

import { useBundleStore } from '@/hooks/useBundleStore'
import { motion } from 'framer-motion'

const CATEGORIES = ['All', 'Anime', 'Marvel', 'K-Pop', 'Girly', 'Others']

export default function CategorySelector() {
    const { currentCategory, setCategory } = useBundleStore()

    return (
        <div className="w-full overflow-x-auto no-scrollbar py-6">
            <div className="flex items-center justify-center gap-4 min-w-max px-4">
                {CATEGORIES.map((cat) => {
                    const isActive = currentCategory === cat

                    return (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`relative px-6 py-2 rounded-full font-bold text-sm tracking-wide transition-all duration-300 ${isActive
                                ? 'text-black'
                                : 'text-white hover:text-[hsl(var(--primary))]'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeCategory"
                                    className="absolute inset-0 bg-[hsl(var(--primary))] rounded-full"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">{cat}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
