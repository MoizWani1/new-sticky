'use client'
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Product } from "@/types";
import Image from "next/image";

import { useCartStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useToastStore } from '@/lib/toast'
import { ShoppingCart, CreditCard } from 'lucide-react'

const FreshPeel = ({ products }: { products: Product[] }) => {
    const [startIndex, setStartIndex] = useState(0);
    const [visibleCount, setVisibleCount] = useState(4);
    const addItem = useCartStore((state) => state.addItem)
    const router = useRouter()
    const { addToast } = useToastStore()

    useEffect(() => {
        const handleResize = () => {
            setVisibleCount(window.innerWidth < 768 ? 2 : 4);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const next = () => setStartIndex((i) => Math.min(i + 1, products.length - visibleCount));
    const prev = () => setStartIndex((i) => Math.max(i - 1, 0));

    const handleAddToCart = (e: React.MouseEvent, product: Product, image: string, price: number) => {
        e.preventDefault()
        addItem({
            id: product.id,
            name: product.name,
            price: price,
            quantity: 1,
            image_url: image,
        })
        addToast(`${product.name} added to cart!`)
    }

    const handleBuyNow = (e: React.MouseEvent, product: Product, image: string, price: number) => {
        e.preventDefault()
        addItem({
            id: product.id,
            name: product.name,
            price: price,
            quantity: 1,
            image_url: image,
        })
        router.push('/cart')
    }

    if (!products || products.length === 0) return null;

    return (
        <section id="shop" className="container mx-auto px-4 pt-0 pb-8 mt-0">
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-center mb-6">
                The Fresh Peel
            </h2>

            <div className="relative">
                <button
                    onClick={prev}
                    disabled={startIndex === 0}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 z-10 bg-card rounded-full p-2 shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
                    aria-label="Previous"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 overflow-hidden">
                    {products.slice(startIndex, startIndex + visibleCount).map((product) => {
                        const isPack = product.type === 'Pack'
                        const displayPrice = isPack ? (product.sticker_price || 35) : product.price
                        const displaySalePrice = isPack ? null : product.sale_price;
                        const finalPrice = displaySalePrice && displaySalePrice > 0 && displaySalePrice < displayPrice ? displaySalePrice : displayPrice;
                        const image = product.image_url || (product?.images && product.images.length > 0 ? product.images[0] : null) || 'https://placehold.co/400x400/png?text=No+Image'

                        // Create dynamic peeling sticker shapes
                        const peelStyles = [
                            "rounded-tl-[40px] rounded-br-[40px] rounded-tr-xl rounded-bl-xl",
                            "rounded-tr-[40px] rounded-bl-[40px] rounded-tl-xl rounded-br-xl",
                            "rounded-bl-[40px] rounded-tr-xl rounded-tl-xl rounded-br-xl",
                            "rounded-br-[40px] rounded-tl-xl rounded-tr-xl rounded-bl-xl"
                        ];
                        const shapeIndex = product.id ? product.id.charCodeAt(0) % 4 : 0;
                        const shapeClass = peelStyles[shapeIndex]

                        return (
                            <div key={product.id} className={`h-full bg-card ${shapeClass} p-3 md:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all group flex flex-col border-2 border-primary/10 relative`}>
                                <Link
                                    href={`/product/${product.id}`}
                                    className="block aspect-square flex items-center justify-center p-4 mb-3 relative overflow-hidden bg-background rounded-xl"
                                >
                                    <Image
                                        src={image}
                                        alt={product.name}
                                        fill
                                        className="object-contain group-hover:scale-110 transition-transform"
                                        unoptimized
                                    />
                                </Link>
                                <div className="flex flex-col flex-1 mt-auto">
                                    <Link href={`/product/${product.id}`}>
                                        <p className="font-display font-bold text-base md:text-lg leading-tight mb-1 line-clamp-2 hover:text-primary transition-colors">{product.name}</p>
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

                                        <div className="flex gap-2 mt-1">
                                            <button
                                                onClick={(e) => handleAddToCart(e, product, image, finalPrice)}
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
                                                onClick={(e) => handleBuyNow(e, product, image, finalPrice)}
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
                    })}
                </div>

                <button
                    onClick={next}
                    disabled={startIndex >= products.length - visibleCount}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 z-10 bg-card rounded-full p-2 shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
                    aria-label="Next"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>
        </section>
    );
};

export default FreshPeel;
