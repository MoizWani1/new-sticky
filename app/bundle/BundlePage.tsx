
'use client'

import { useState } from 'react'
import BundleCanvas from '@/components/Bundle/BundleCanvas'
import CategorySelector from '@/components/Bundle/CategorySelector'
import StickerGrid from '@/components/Bundle/StickerGrid'
import BundleSummary from '@/components/Bundle/BundleSummary'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'

interface BundlePageProps {
    products: any[]
}

import IntroModal from '@/components/Bundle/IntroModal'

export default function BundlePage({ products }: BundlePageProps) {
    return (
        <div className="min-h-screen bg-black text-white relative active:cursor-grabbing flex flex-col lg:flex-row overflow-hidden">
            <BundleCanvas />
            <IntroModal />

            <div className="relative z-10 flex-1 pt-4 lg:pb-0 h-screen overflow-y-auto no-scrollbar scroll-smooth">
                <div className="container mx-auto px-4 py-6">
                    {/* Simplified Header - Minimized */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-xl font-bold uppercase tracking-tighter text-[hsl(var(--primary))] opacity-80">
                            StickyBits <span className="text-white text-xs font-normal opacity-50 ml-2">Bundle Builder</span>
                        </h1>
                    </div>

                    <CategorySelector />
                    <StickerGrid products={products} />

                    {/* Legal Footer within the scrollable area */}
                    <Footer />
                </div>
            </div>

            <BundleSummary />
        </div>
    )
}
