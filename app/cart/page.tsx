'use client'
import { useCartStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import {
    Minus,
    Plus,
    Trash2,
    Gift,
    Truck,
    Tag,
    X
} from 'lucide-react'
import { useEffect, useState } from 'react'

export default function CartPage() {
    const { items, addItem, decrementItem, removeItem, total, applyVoucher, removeVoucher, voucherCode, getDiscountAmount } = useCartStore()
    const [mounted, setMounted] = useState(false)
    const [inputVoucher, setInputVoucher] = useState('')
    const [voucherMessage, setVoucherMessage] = useState('')
    const [voucherStatus, setVoucherStatus] = useState<null | 'success' | 'error'>(null)

    useEffect(() => {
        setMounted(true)
        if (voucherCode) {
            setInputVoucher(voucherCode)
        }
    }, [voucherCode])

    const cartTotal = total()
    const threshold = 2500 // Threshold for free delivery & gift
    const isFreeDelivery = cartTotal > threshold
    const deliveryCharge = isFreeDelivery ? 0 : 250

    // Final Calculation
    const voucherDiscount = getDiscountAmount()
    const totalAfterDiscount = cartTotal - voucherDiscount
    const finalSubtotal = totalAfterDiscount > 0 ? totalAfterDiscount : 0
    const finalTotal = finalSubtotal + deliveryCharge

    const remainingForFree = threshold - cartTotal
    const progress = Math.min((cartTotal / threshold) * 100, 100)

    const checkVoucher = async () => {
        if (!inputVoucher) return
        setVoucherStatus(null)
        setVoucherMessage('')

        try {
            const { data, error } = await supabase
                .from('vouchers')
                .select('*')
                .eq('code', inputVoucher.toUpperCase())
                .eq('is_active', true)
                .single()

            if (error || !data) {
                setVoucherStatus('error')
                setVoucherMessage('Invalid or expired voucher.')
                // Do not remove existing voucher if any, just show error for new input
            } else {
                const minSpend = data.discount_amount * 5
                if (cartTotal < minSpend) {
                    setVoucherStatus('error')
                    setVoucherMessage(`Minimum spend of Rs. ${minSpend} required to use this voucher.`)
                } else {
                    setVoucherStatus('success')
                    setVoucherMessage(`Voucher applied! Rs. ${data.discount_amount} OFF`)
                    applyVoucher(data.code, data.discount_amount, data.discount_type)
                }
            }
        } catch (err) {
            console.error(err)
            setVoucherStatus('error')
            setVoucherMessage('Error checking voucher.')
        }
    }

    const handleRemoveVoucher = () => {
        removeVoucher()
        setInputVoucher('')
        setVoucherStatus(null)
        setVoucherMessage('')
    }

    if (!mounted) return null



    return (
        <div className="min-h-screen px-4 py-8 md:px-6">
            <div className="max-w-4xl mx-auto container">
                <h1 className="text-3xl font-bold mb-8 text-[hsl(var(--primary))] uppercase tracking-wide">Shopping Cart</h1>

                {/* Free Delivery & Gift Progress Bar */}
                {items.length > 0 && (
                    <div className="mb-8 bg-white p-6 rounded-3xl border-2 border-black/5 shadow-sm">
                        {isFreeDelivery ? (
                            <div className="animate-bounce text-center">
                                <p className="text-xl font-bold text-[hsl(var(--primary))] mb-2 flex items-center justify-center gap-2">
                                    <Gift className="w-6 h-6" />
                                    <span>CONGRATULATIONS! You've unlocked Free Delivery & A Special Gift!</span>
                                    <Truck className="w-6 h-6" />
                                </p>
                                <p className="text-sm text-gray-300">10 Pcs Stickers Pack included for FREE.</p>
                            </div>
                        ) : (
                            <div>
                                <div className="flex justify-between text-sm mb-2 text-gray-400">
                                    <span>Progress to Free Delivery & Gift</span>
                                    <span>Spend Rs. {remainingForFree} more</span>
                                </div>
                                <div className="w-full bg-black/10 rounded-full h-4 overflow-hidden border border-black/5 relative">
                                    <div
                                        className="bg-[hsl(var(--primary))] h-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                                        style={{ width: `${progress}%` }}
                                    >
                                        {progress > 10 && <span className="text-[10px] font-bold text-black">{Math.round(progress)}%</span>}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400 mt-2">
                                    Get <span className="text-[hsl(var(--primary))] font-bold">Free Delivery</span> & <span className="text-[hsl(var(--primary))] font-bold">10 Pcs Sticker Pack</span> on orders above Rs. {threshold}!
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {items.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-3xl border-2 border-black/10 border-dashed">
                        <p className="text-xl text-foreground font-medium mb-4">Your cart is empty.</p>
                        <Link href="/" className="inline-block bg-[hsl(var(--primary))] text-primary-foreground font-bold font-display text-xl px-8 py-3 rounded-full hover:-translate-y-1 transition-transform shadow-sm uppercase tracking-wide">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4 p-4 border-2 border-black/5 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all md:items-center">
                                    <div className="relative w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-black/5 p-2">
                                        <Image
                                            src={item.image_url}
                                            alt={item.name}
                                            fill
                                            className="object-contain"
                                            unoptimized
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col md:flex-row justify-between w-full gap-4">
                                        <div className="flex justify-between items-start w-full">
                                            <div>
                                                <h3 className="font-bold text-lg text-foreground font-display">{item.name}</h3>
                                                {item.selectedVariants && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {Object.entries(item.selectedVariants).map(([key, value]) => (
                                                            <span key={key} className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg font-medium">
                                                                {key}: <span className="text-foreground">{value}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                {item.packStickers && item.packStickers.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {item.packStickers.map((sticker, idx) => (
                                                            <div key={idx} className="flex items-center gap-1 bg-muted p-1 pr-2 rounded-lg border-black/5 border">
                                                                <div className="w-5 h-5 relative rounded overflow-hidden flex-shrink-0 bg-white/50">
                                                                    <Image src={sticker.image_url || 'https://placehold.co/100x100'} alt={sticker.name} fill className="object-contain" unoptimized />
                                                                </div>
                                                                <span className="text-[10px] text-foreground font-bold">{sticker.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <button onClick={() => removeItem(item.id, item.selectedVariants, item.packStickers)} className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors hidden md:block">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center mt-2 md:mt-0 gap-2">
                                            <p className="font-bold text-[hsl(var(--primary))] text-xl">Rs. {item.price * item.quantity}</p>
                                            <div className="flex items-center justify-between w-full md:w-auto mt-2 md:mt-0">
                                                <div className="flex items-center gap-3 border-2 border-black/5 rounded-xl bg-gray-50 p-1">
                                                    <button
                                                        onClick={() => decrementItem(item.id, item.selectedVariants, item.packStickers)}
                                                        className="p-1 hover:bg-black/5 text-foreground rounded-lg transition-colors"
                                                    >
                                                        <Minus className="h-5 w-5" />
                                                    </button>
                                                    <span className="w-8 text-center text-lg font-bold text-foreground">{item.quantity}</span>
                                                    <button
                                                        onClick={() => addItem(item)}
                                                        className="p-1 hover:bg-black/5 text-foreground rounded-lg transition-colors"
                                                    >
                                                        <Plus className="h-5 w-5" />
                                                    </button>
                                                </div>
                                                <button onClick={() => removeItem(item.id, item.selectedVariants, item.packStickers)} className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors md:hidden">
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Free Gift Item Display if Unlocked */}
                            {isFreeDelivery && (
                                <div className="flex gap-4 p-4 border-2 border-primary rounded-3xl bg-primary/5 shadow-sm md:items-center">
                                    <div className="relative w-24 h-24 bg-white rounded-2xl overflow-hidden flex-shrink-0 border-2 border-primary/20 flex items-center justify-center p-2">
                                        <Gift className="w-10 h-10 text-[hsl(var(--primary))]" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h3 className="font-bold text-lg text-[hsl(var(--primary))] font-display">10 Pcs Stickers Pack</h3>
                                        <p className="text-sm font-medium text-muted-foreground">Gift for orders above Rs. 2500</p>
                                        <p className="font-bold text-foreground mt-1">FREE</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-1 space-y-4">
                            {/* Voucher Input Section */}
                            <div className="border-2 border-black/5 rounded-3xl p-6 bg-white shadow-sm">
                                <h2 className="text-lg font-bold mb-4 font-display text-foreground uppercase tracking-wide flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-[hsl(var(--primary))]" /> Discount Code
                                </h2>

                                {voucherCode ? (
                                    <div className="flex justify-between items-center bg-green-50 border-2 border-green-200 p-3 rounded-xl">
                                        <div>
                                            <p className="font-bold text-green-600">{voucherCode}</p>
                                            <p className="text-xs text-green-700 font-medium">Rs. {voucherDiscount} OFF applied</p>
                                        </div>
                                        <button onClick={handleRemoveVoucher} className="text-gray-400 hover:text-foreground">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2 items-center w-full">
                                        <input
                                            type="text"
                                            placeholder="Code"
                                            className="flex-1 min-w-0 rounded-xl border-2 border-black/10 bg-white text-foreground px-4 h-12 font-bold focus:outline-none focus:border-primary uppercase transition-colors"
                                            value={inputVoucher}
                                            onChange={(e) => setInputVoucher(e.target.value)}
                                        />
                                        <button
                                            onClick={checkVoucher}
                                            className="bg-black text-white font-bold px-6 h-12 rounded-xl hover:bg-primary transition-colors text-sm flex items-center justify-center border-2 border-transparent uppercase tracking-wider"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                )}

                                {voucherStatus === 'success' && !voucherCode && <p className="text-green-600 text-sm mt-3 font-bold">{voucherMessage}</p>}
                                {voucherStatus === 'error' && <p className="text-red-500 text-sm mt-3 font-medium">{voucherMessage}</p>}
                            </div>


                            <div className="border-2 border-black/5 rounded-3xl p-6 bg-white sticky top-24 shadow-sm">
                                <h2 className="text-xl font-bold mb-4 font-display text-foreground uppercase tracking-wide">Order Summary</h2>

                                <div className="space-y-3 mb-6 text-muted-foreground font-medium border-b-2 border-black/5 pb-6">
                                    <div className="flex justify-between items-center text-foreground">
                                        <span>Subtotal</span>
                                        <span className="font-bold text-foreground text-lg">Rs. {cartTotal}</span>
                                    </div>

                                    {voucherDiscount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount</span>
                                            <span className="font-bold">- Rs. {voucherDiscount}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center text-foreground">
                                        <span>Delivery Charges</span>
                                        {isFreeDelivery ? (
                                            <span className="font-bold text-[hsl(var(--primary))] bg-primary/10 px-2 py-1 rounded-md text-sm">FREE</span>
                                        ) : (
                                            <span className="font-bold text-foreground">Rs. {deliveryCharge}</span>
                                        )}
                                    </div>

                                    {isFreeDelivery && (
                                        <div className="flex justify-between text-[hsl(var(--primary))] text-sm">
                                            <span>Gift Applied</span>
                                            <span>Sticker Pack</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center mb-8 text-2xl font-display">
                                    <span className="font-bold text-foreground">Total</span>
                                    <span className="font-bold text-[hsl(var(--primary))]">Rs. {finalTotal}</span>
                                </div>

                                <Link href="/checkout" className="block w-full text-center bg-primary text-primary-foreground py-4 rounded-full font-bold font-display text-xl uppercase tracking-widest hover:-translate-y-1 transition-transform shadow-md">
                                    Proceed to Checkout
                                </Link>
                                <Link href="/" className="block w-full text-center text-muted-foreground font-medium text-sm mt-4 hover:text-foreground underline transition-colors">
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
