'use client'
import { useCartStore } from '@/lib/store'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, CreditCard } from 'lucide-react'

interface VariantOption {
    value: string
    price?: number
}

interface Variant {
    name: string
    options: VariantOption[]
}

export default function AddToCartButton({ product }: { product: any }) {
    const addItem = useCartStore((state) => state.addItem)
    const [added, setAdded] = useState(false)
    const router = useRouter()
    const containerRef = useRef<HTMLDivElement>(null)
    const [isFloating, setIsFloating] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsFloating(entry.boundingClientRect.top < 0 && !entry.isIntersecting)
            },
            { threshold: 0 }
        )

        if (containerRef.current) observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [])

    const isPack = product.type === 'Pack'
    const packStickers = product.pack_stickers || []
    const [packMode, setPackMode] = useState<'Full Pack' | 'Choose Stickers'>('Full Pack')
    const [selectedStickerQuantities, setSelectedStickerQuantities] = useState<Record<string, number>>({})

    const variants = (product.variants || []) as Variant[]
    const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>(() => {
        const defaults: any = {}
        variants.forEach(v => {
            if (v.options.length > 0) defaults[v.name] = v.options[0].value
        })
        return defaults
    })

    const getBasePrice = () => {
        return (product.sale_price && product.sale_price > 0 && product.sale_price < product.price)
            ? product.sale_price
            : product.price
    }

    const [currentPrice, setCurrentPrice] = useState(getBasePrice())

    useEffect(() => {
        let price = getBasePrice()

        if (isPack && packMode === 'Choose Stickers') {
            const totalSelected = Object.values(selectedStickerQuantities).reduce((a, b) => a + b, 0)
            price = totalSelected * (product.sticker_price || 35)
        } else {
            variants.forEach(v => {
                const selectedValue = selectedVariants[v.name]
                const option = v.options.find(o => o.value === selectedValue)
                if (option && option.price) {
                    price = option.price
                }
            })
        }
        setCurrentPrice(price)
    }, [selectedVariants, product, packMode, selectedStickerQuantities, isPack])


    const handleAddToCart = () => {
        const totalSelected = Object.values(selectedStickerQuantities).reduce((a, b) => a + b, 0)
        if (isPack && packMode === 'Choose Stickers' && totalSelected === 0) {
            alert('Please select at least one sticker.')
            return
        }

        let selectedPackStickers: any[] | undefined = undefined
        if (isPack && packMode === 'Choose Stickers') {
            selectedPackStickers = []
            packStickers.forEach((s: any) => {
                const qty = selectedStickerQuantities[s.id] || 0
                for (let i = 0; i < qty; i++) selectedPackStickers!.push(s)
            })
        }

        addItem({
            id: product.id,
            name: product.name,
            price: currentPrice,
            quantity: 1,
            image_url: product.image_url || 'https://placehold.co/400x400/png?text=No+Image',
            selectedVariants: Object.keys(selectedVariants).length > 0 && !(isPack && packMode === 'Choose Stickers') ? selectedVariants : undefined,
            packStickers: selectedPackStickers
        })
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
    }

    const handleBuyNow = () => {
        const totalSelected = Object.values(selectedStickerQuantities).reduce((a, b) => a + b, 0)
        if (isPack && packMode === 'Choose Stickers' && totalSelected === 0) {
            alert('Please select at least one sticker.')
            return
        }

        let selectedPackStickers: any[] | undefined = undefined
        if (isPack && packMode === 'Choose Stickers') {
            selectedPackStickers = []
            packStickers.forEach((s: any) => {
                const qty = selectedStickerQuantities[s.id] || 0
                for (let i = 0; i < qty; i++) selectedPackStickers!.push(s)
            })
        }

        addItem({
            id: product.id,
            name: product.name,
            price: currentPrice,
            quantity: 1,
            image_url: product.image_url || 'https://placehold.co/400x400/png?text=No+Image',
            selectedVariants: Object.keys(selectedVariants).length > 0 && !(isPack && packMode === 'Choose Stickers') ? selectedVariants : undefined,
            packStickers: selectedPackStickers
        })
        router.push('/cart')
    }

    const basePrice = getBasePrice()
    const discount = product.price > 0 ? Math.round(((product.price - basePrice) / product.price) * 100) : 0

    return (
        <div ref={containerRef} className="flex flex-col gap-6 w-full relative">
            <div className="mb-2">
                {product.sale_price && product.sale_price > 0 && product.sale_price < product.price ? (
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold bg-sticker-green text-black px-1.5 py-0.5 rounded w-fit mb-1">SALE</span>
                            <p className="text-3xl md:text-4xl font-display font-extrabold text-sticker-green">Rs. {currentPrice}</p>
                        </div>
                        {currentPrice < product.price && (
                            <p className="text-xl md:text-2xl font-display font-bold text-muted-foreground line-through">Rs. {product.price}</p>
                        )}
                        {currentPrice !== basePrice && <span className="text-sm text-muted-foreground opacity-50 ml-2">(Variant Price)</span>}
                    </div>
                ) : (
                    <p className="text-3xl md:text-4xl font-display font-extrabold text-foreground">Rs. {currentPrice}</p>
                )}
            </div>

            {isPack && packStickers.length > 0 && (
                <div className="space-y-4 bg-muted/50 p-5 rounded-2xl border border-border">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Purchase Options</p>
                    <div className="flex gap-4 mb-4">
                        <button
                            onClick={() => setPackMode('Full Pack')}
                            className={`flex-1 py-3 rounded-xl font-display text-lg font-bold transition-all ${packMode === 'Full Pack' ? 'bg-primary text-primary-foreground shadow-md scale-105' : 'bg-background border border-border text-muted-foreground hover:text-foreground hover:border-foreground/50'}`}
                        >
                            Full Pack
                        </button>
                        <button
                            onClick={() => setPackMode('Choose Stickers')}
                            className={`flex-1 py-3 rounded-xl font-display text-lg font-bold transition-all ${packMode === 'Choose Stickers' ? 'bg-primary text-primary-foreground shadow-md scale-105' : 'bg-background border border-border text-muted-foreground hover:text-foreground hover:border-foreground/50'}`}
                        >
                            Choose Stickers
                        </button>
                    </div>

                    {packMode === 'Choose Stickers' && (
                        <div className="mt-6">
                            <p className="text-sm font-body text-muted-foreground mb-4">Select the stickers you want (Rs. {product.sticker_price || 35} / each):</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                                {packStickers.map((sticker: any) => {
                                    const qty = selectedStickerQuantities[sticker.id] || 0;
                                    const isSelected = qty > 0;
                                    return (
                                        <div
                                            key={sticker.id}
                                            className={`rounded-xl border p-3 hover:scale-105 transition-all flex flex-col items-center justify-between bg-card hover:shadow-lg cursor-pointer ${isSelected ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border'}`}
                                            onClick={() => {
                                                setSelectedStickerQuantities(prev => ({
                                                    ...prev,
                                                    [sticker.id]: (prev[sticker.id] || 0) + 1
                                                }))
                                            }}
                                        >
                                            <div className="aspect-square relative flex w-full mb-3 items-center justify-center">
                                                <img src={sticker.image_url} alt={sticker.name} className="w-full h-full object-contain drop-shadow-md" />
                                                {qty > 0 && (
                                                    <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-sm font-extrabold w-8 h-8 flex items-center justify-center rounded-full shadow-lg border-2 border-background">
                                                        {qty}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm font-display font-bold text-center w-full truncate px-1 mb-2">{sticker.name}</p>

                                            {qty > 0 && (
                                                <div className="flex items-center gap-2 bg-muted rounded-full px-2 py-1 w-full justify-between" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedStickerQuantities(prev => {
                                                                const next = { ...prev }
                                                                if (next[sticker.id] > 1) next[sticker.id]--
                                                                else delete next[sticker.id]
                                                                return next
                                                            })
                                                        }}
                                                        className="w-6 h-6 rounded-full bg-background hover:bg-border flex items-center justify-center text-sm font-bold shadow-sm"
                                                    >-</button>
                                                    <span className="text-sm font-bold">{qty}</span>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedStickerQuantities(prev => ({
                                                                ...prev,
                                                                [sticker.id]: (prev[sticker.id] || 0) + 1
                                                            }))
                                                        }}
                                                        className="w-6 h-6 rounded-full bg-background hover:bg-border flex items-center justify-center text-sm font-bold shadow-sm"
                                                    >+</button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {variants.length > 0 && !(isPack && packMode === 'Choose Stickers') && (
                <div className="space-y-4 bg-muted/50 p-5 rounded-2xl border border-border">
                    {variants.map((v, idx) => (
                        <div key={idx}>
                            <p className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">{v.name}</p>
                            <div className="flex flex-wrap gap-3">
                                {v.options.map((opt, oIdx) => (
                                    <button
                                        key={oIdx}
                                        onClick={() => setSelectedVariants(prev => ({ ...prev, [v.name]: opt.value }))}
                                        className={`px-5 py-2.5 rounded-xl font-display text-base font-bold transition-all ${selectedVariants[v.name] === opt.value
                                            ? 'bg-primary text-primary-foreground shadow-md scale-105'
                                            : 'bg-background border border-border text-muted-foreground hover:text-foreground hover:border-foreground/50'
                                            }`}
                                    >
                                        {opt.value}
                                        {opt.price && opt.price !== basePrice && (
                                            <span className="ml-2 text-xs opacity-80">
                                                (Rs. {opt.price})
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
                <button
                    onClick={handleAddToCart}
                    disabled={product.stock_status === 'out_of_stock'}
                    className={`flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-full font-display text-xl font-bold transition-all ${product.stock_status === 'out_of_stock'
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : added
                            ? 'bg-sticker-green text-foreground shadow-md'
                            : 'bg-primary/10 text-primary hover:bg-primary/20 active:scale-95'
                        }`}
                >
                    <ShoppingCart className="w-5 h-5" />
                    {added ? 'Added to Cart!' : 'Add to Cart'}
                </button>

                <button
                    onClick={handleBuyNow}
                    disabled={product.stock_status === 'out_of_stock'}
                    className={`flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-full font-display text-xl font-bold transition-all ${product.stock_status === 'out_of_stock'
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : 'bg-primary text-primary-foreground hover:scale-105 active:scale-95 shadow-lg'
                        }`}
                >
                    <CreditCard className="w-5 h-5" />
                    Buy Now
                </button>
            </div>

            {isFloating && (
                <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border p-4 z-50 animate-in slide-in-from-bottom-5 duration-300 shadow-2xl">
                    <div className="container mx-auto max-w-6xl flex items-center justify-between gap-4">
                        <div className="hidden sm:flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-card border border-border p-1 shrink-0 bg-background">
                                <img src={product.image_url || 'https://placehold.co/400x400'} alt={product.name} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex flex-col">
                                <p className="font-display font-bold text-foreground text-lg line-clamp-1 leading-tight">{product.name}</p>
                                <p className="text-primary font-bold text-md">Rs. {currentPrice}</p>
                            </div>
                        </div>
                        <div className="flex flex-1 sm:flex-none gap-3 justify-end items-center">
                            {(isPack && packMode === 'Choose Stickers') && (
                                <span className="text-sm font-body text-muted-foreground hidden md:inline-block mr-2">
                                    {Object.values(selectedStickerQuantities).reduce((a, b) => a + b, 0)} selected
                                </span>
                            )}
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock_status === 'out_of_stock'}
                                className={`flex-1 sm:flex-none px-6 py-3 rounded-full font-display font-bold text-lg transition-all ${product.stock_status === 'out_of_stock'
                                    ? 'bg-muted text-muted-foreground'
                                    : added
                                        ? 'bg-sticker-green text-foreground'
                                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                                    }`}
                            >
                                {added ? 'Added!' : 'Add'}
                            </button>
                            <button
                                onClick={handleBuyNow}
                                disabled={product.stock_status === 'out_of_stock'}
                                className={`flex-1 sm:flex-none px-8 py-3 rounded-full font-display font-bold text-lg transition-all ${product.stock_status === 'out_of_stock'
                                    ? 'bg-muted text-muted-foreground'
                                    : 'bg-primary text-primary-foreground hover:scale-105'
                                    }`}
                            >
                                Buy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
