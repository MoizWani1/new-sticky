'use client'

import ProductCard from '@/components/ProductCard'

interface ProductGridProps {
    products: any[]
}

export default function ProductGrid({ products }: ProductGridProps) {
    return (
        <div id="products-grid-top" className="w-full">
            {/* Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 transition-opacity duration-300">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {/* Empty State */}
            {products.length === 0 && (
                <div className="text-center py-20 bg-zinc-900 rounded-lg border border-zinc-800 border-dashed">
                    <p className="text-xl text-gray-500">No products found.</p>
                </div>
            )}
        </div>
    )
}
