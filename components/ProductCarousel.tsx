'use client'

import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from './ProductCard'

interface ProductCarouselProps {
    products: any[]
    title: string
}

export default function ProductCarousel({ products, title }: ProductCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [displayProducts, setDisplayProducts] = useState(products)
    const [showLeftArrow, setShowLeftArrow] = useState(false)
    const [showRightArrow, setShowRightArrow] = useState(true)

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current
            const scrollAmount = container.clientWidth * 0.8 // Scroll 80% of the visible width
            const newScrollLeft = direction === 'left'
                ? container.scrollLeft - scrollAmount
                : container.scrollLeft + scrollAmount

            container.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            })
        }
    }

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
            setShowLeftArrow(scrollLeft > 0)
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10) // -10 buffer
        }
    }

    useEffect(() => {
        // Shuffle products on mount (refresh)
        if (products && products.length > 0) {
            const shuffled = [...products].sort(() => Math.random() - 0.5)
            setDisplayProducts(shuffled)
        }
    }, [products])

    if (!displayProducts || displayProducts.length === 0) return null

    return (
        <div className="mb-12 relative group/carousel">
            <div className="text-center mb-8">
                <h2 className="text-[hsl(var(--primary))] font-bold text-3xl mb-2 uppercase tracking-widest">
                    {title}
                </h2>
                <div className="w-24 h-1 bg-[hsl(var(--primary))] mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="relative">
                {/* Left Arrow */}
                <button
                    onClick={() => scroll('left')}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-opacity duration-300 ${showLeftArrow ? 'opacity-0 group-hover/carousel:opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                >
                    <ChevronLeft className="w-8 h-8 text-white" />
                </button>

                {/* Right Arrow */}
                <button
                    onClick={() => scroll('right')}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-opacity duration-300 ${showRightArrow ? 'opacity-0 group-hover/carousel:opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                >
                    <ChevronRight className="w-8 h-8 text-white" />
                </button>

                {/* Scroll Container */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto gap-4 pb-8 snap-x snap-mandatory scrollbar-hide px-4 md:px-0 items-stretch"
                >
                    {displayProducts.map((product) => (
                        <div key={product.id} className="min-w-[180px] md:min-w-[280px] w-[180px] md:w-[280px] snap-start flex-shrink-0 h-full">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
