'use client'
import Image from 'next/image'
import Link from 'next/link'

import { useCartStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useToastStore } from '@/lib/toast'
import { ShoppingCart, CreditCard } from 'lucide-react'

interface Product {
    id: string
    name: string
    description: string | null
    price: number
    sale_price?: number | null
    image_url: string | null
    images?: string[]
    stock_status?: string
    type?: string
    sticker_price?: number
}

export default function ProductCard({ product }: { product: Product }) {
    const addItem = useCartStore((state) => state.addItem)
    const router = useRouter()
    const { addToast } = useToastStore()

    const image = product.image_url || (product?.images && product.images.length > 0 ? product.images[0] : null) || 'https://placehold.co/400x400/png?text=No+Image'

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        addItem({
            id: product.id,
            name: product.name,
            price: (product.sale_price && product.sale_price > 0 && product.sale_price < product.price) ? product.sale_price : product.price,
            quantity: 1,
            image_url: image,
        })
        addToast(`${product.name} added to cart!`)
    }

    const handleBuyNow = (e: React.MouseEvent) => {
        e.preventDefault()
        addItem({
            id: product.id,
            name: product.name,
            price: (product.sale_price && product.sale_price > 0 && product.sale_price < product.price) ? product.sale_price : product.price,
            quantity: 1,
            image_url: image,
        })
        router.push('/cart')
    }

    const isPack = product.type === 'Pack'
    const displayPrice = isPack ? (product.sticker_price || 35) : product.price
    const displaySalePrice = isPack ? null : product.sale_price

    // Create a dynamic peeling sticker effect based on the product ID characters
    const peelStyles = [
        "rounded-tl-[40px] rounded-br-[40px] rounded-tr-xl rounded-bl-xl",
        "rounded-tr-[40px] rounded-bl-[40px] rounded-tl-xl rounded-br-xl",
        "rounded-bl-[40px] rounded-tr-xl rounded-tl-xl rounded-br-xl",
        "rounded-br-[40px] rounded-tl-xl rounded-tr-xl rounded-bl-xl"
    ];
    // Hash id to get consistent index
    const shapeIndex = product.id ? product.id.charCodeAt(0) % 4 : 0;
    const shapeClass = peelStyles[shapeIndex]

    return (
        <div className={`h-full bg-card ${shapeClass} p-3 md:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all group flex flex-col border-2 border-primary/10 relative`}>
            <Link href={`/product/${product.id}`} className="block aspect-square flex items-center justify-center p-2 mb-3 relative overflow-hidden bg-background rounded-xl">
                <Image
                    src={image}
                    alt={product.name}
                    fill
                    className="object-contain group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    unoptimized
                />
            </Link>

            <div className="flex flex-col flex-1 mt-auto">
                <Link href={`/product/${product.id}`}>
                    <h3 className="font-display font-bold text-base md:text-lg leading-tight mb-1 line-clamp-2 hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                </Link>

                <div className="mt-auto pt-2 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        {displaySalePrice && displaySalePrice > 0 && displaySalePrice < displayPrice ? (
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground line-through">Rs. {displayPrice}{isPack ? ' / Sticker' : ''}</span>
                                <span className="text-sm md:text-base font-bold text-sticker-green">Rs. {displaySalePrice}{isPack ? ' / Sticker' : ''}</span>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                <span className="text-sm md:text-base font-bold text-sticker-green">Rs. {displayPrice}{isPack ? ' / Sticker' : ''}</span>
                            </div>
                        )}

                        {product.stock_status === 'out_of_stock' && (
                            <span className="text-destructive font-bold text-[10px] md:text-xs bg-destructive/10 px-2 py-0.5 rounded">Out of Stock</span>
                        )}
                        {product.stock_status === 'low_stock' && (
                            <span className="text-sticker-orange font-bold text-[10px] md:text-xs bg-sticker-orange/10 px-2 py-0.5 rounded">Low Stock</span>
                        )}
                    </div>

                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock_status === 'out_of_stock'}
                            className={`flex flex-1 items-center justify-center py-2 rounded-xl font-display font-bold text-sm tracking-wide transition-all ${product.stock_status === 'out_of_stock'
                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                : 'bg-primary/10 text-primary hover:bg-primary/20 active:scale-95'
                                }`}
                        >
                            <ShoppingCart className="w-4 h-4 md:mr-1" />
                            <span className="hidden md:inline">Add</span>
                        </button>
                        <button
                            onClick={handleBuyNow}
                            disabled={product.stock_status === 'out_of_stock'}
                            className={`flex flex-1 items-center justify-center py-2 rounded-xl font-display font-bold text-sm tracking-wide transition-all ${product.stock_status === 'out_of_stock'
                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                : 'bg-primary text-primary-foreground hover:scale-105 active:scale-95 shadow-md'
                                }`}
                        >
                            <CreditCard className="w-4 h-4 md:mr-1" />
                            <span className="hidden md:inline">Buy</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
