'use client'
import { useCartStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tag, X, CreditCard, Banknote } from 'lucide-react'
import confetti from 'canvas-confetti'
import emailjs from '@emailjs/browser'

export default function CheckoutPage() {
    const { items, total, clearCart, voucherCode, getDiscountAmount, applyVoucher, removeVoucher } = useCartStore()
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
    })
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod')
    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false)

    // Local state for voucher input in checkout
    const [inputVoucher, setInputVoucher] = useState('')
    const [voucherMessage, setVoucherMessage] = useState('')
    const [voucherStatus, setVoucherStatus] = useState<null | 'success' | 'error'>(null)

    useEffect(() => {
        setMounted(true)
        if (voucherCode) setInputVoucher(voucherCode)
    }, [voucherCode])

    // Watch for payment method change to show modal
    useEffect(() => {
        if (paymentMethod === 'online') {
            setShowPaymentDetailsModal(true)
        }
    }, [paymentMethod])

    if (!mounted) return null

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
            } else {
                console.log('Voucher Data:', data)
                const minSpend = data.discount_type === 'percentage' ? 0 : data.discount_amount * 5

                const requiredSpend = data.discount_type === 'percentage' ? 500 : minSpend

                if (cartTotal < requiredSpend) {
                    setVoucherStatus('error')
                    setVoucherMessage(`Minimum spend of Rs. ${requiredSpend} required.`)
                    return
                }

                const discountVal = data.discount_amount
                const type = data.discount_type || 'fixed'

                console.log('Applying:', { code: data.code, val: discountVal, type })
                applyVoucher(data.code, discountVal, type)

                // Trigger fireworks animation
                const duration = 1500;
                const animationEnd = Date.now() + duration;
                const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

                const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

                const interval = setInterval(function () {
                    const timeLeft = animationEnd - Date.now();

                    if (timeLeft <= 0) {
                        return clearInterval(interval);
                    }

                    const particleCount = 50 * (timeLeft / duration);
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
                }, 250);

                if (type === 'percentage') {
                    setVoucherMessage(`Voucher applied! ${discountVal}% OFF`)
                    setVoucherStatus('success')
                } else {
                    setVoucherStatus('success')
                    setVoucherMessage(`Voucher applied! Rs. ${discountVal} OFF`)
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

    const cartTotal = total()
    const threshold = 2500
    const isFreeDelivery = cartTotal > threshold
    const deliveryCharge = isFreeDelivery ? 0 : 250

    const voucherDiscount = getDiscountAmount()
    const totalAfterDiscount = cartTotal - voucherDiscount
    const finalSubtotal = totalAfterDiscount > 0 ? totalAfterDiscount : 0
    const finalTotal = finalSubtotal + deliveryCharge

    const orderItems = [...items]
    if (isFreeDelivery) {
        orderItems.push({
            id: 'free-gift-sticker-pack',
            name: '10 Pcs Stickers Pack (Gift)',
            price: 0,
            quantity: 1,
            image_url: '/assets/stickers.png'
        })
    }

    const handleSubmission = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const offers: string[] = []
        if (isFreeDelivery) offers.push("Free Delivery", "Gift Included")
        if (voucherDiscount > 0 && voucherCode) offers.push(`Voucher: ${voucherCode}`)

        const orderData = {
            customer_name: formData.name,
            customer_phone: formData.phone,
            customer_address: formData.address,
            order_items: orderItems,
            total_amount: finalTotal,
            status: 'Pending',
            applied_offers: offers.length > 0 ? offers.join(', ') : null,
            discount_total: voucherDiscount,
            payment_method: paymentMethod
        }

        const { error } = await supabase.from('orders').insert([orderData])

        if (error) {
            alert('Error placing order: ' + error.message)
            setLoading(false)
        } else {
            // Send Email Notification
            try {
                const templateParams = {
                    customer_name: formData.name,
                    customer_phone: formData.phone,
                    customer_address: formData.address,
                    order_details: orderItems.map(item => `${item.name} (x${item.quantity}) - Rs. ${item.price}`).join('\n'),
                    total_amount: finalTotal,
                    discount_amount: voucherDiscount,
                    payment_method: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
                    offer_details: offers.length > 0 ? offers.join(', ') : 'None'
                }

                await emailjs.send(
                    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
                    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
                    templateParams,
                    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
                )
            } catch (emailError) {
                console.error('Failed to send email:', emailError)
            }

            clearCart()
            setShowSuccessModal(true)
        }
    }

    if (showSuccessModal) {
        return (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border-2 border-black/5 p-8 rounded-3xl max-w-md w-full text-center shadow-xl relative">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Tag className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-foreground mb-4">Order Placed!</h2>
                    <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
                        Thank You So much for your Order. <br /> Our Order Managing Team Will contact You Very soon..
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-primary text-primary-foreground font-bold font-display text-xl py-4 rounded-full uppercase tracking-widest hover:-translate-y-1 transition-transform shadow-md"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen text-foreground container px-4 py-8 text-center flex flex-col justify-center items-center">
                <p className="text-xl text-muted-foreground font-medium">Your cart is empty.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen text-foreground px-4 py-8 md:px-6 relative">
            {/* Payment Details Modal */}
            {showPaymentDetailsModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white border-2 border-primary/20 p-8 rounded-3xl max-w-md w-full shadow-xl relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setShowPaymentDetailsModal(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-display font-bold text-[hsl(var(--primary))] mb-2">Payment Details</h3>
                            <p className="text-muted-foreground font-medium text-sm">Please send the amount to the following account:</p>
                        </div>

                        <div className="bg-gray-50 p-5 rounded-2xl border-2 border-black/5 space-y-3 mb-6">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground font-medium">Account Title:</span>
                                <span className="font-bold text-foreground">Moeez Nabi Wani</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground font-medium">Account Number:</span>
                                <span className="font-bold text-[hsl(var(--primary))] text-lg font-display">03193672223</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground font-medium">Services:</span>
                                <span className="text-foreground font-bold text-sm">EasyPaisa / SadaPay</span>
                            </div>
                        </div>

                        <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl text-sm text-amber-900 mb-6 font-medium">
                            <p className="mb-2">⚠️ <strong>IMPORTANT:</strong></p>
                            <p>After sending payment, please confirm your order here and <strong>send a screenshot</strong> to the same WhatsApp number (03193672223) or our Instagram for verification.</p>
                        </div>

                        <button
                            onClick={() => setShowPaymentDetailsModal(false)}
                            className="w-full bg-black hover:bg-primary text-white hover:text-primary-foreground font-bold py-4 rounded-xl transition-colors uppercase tracking-widest text-sm"
                        >
                            I Understand, Close
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-display font-bold mb-8 text-[hsl(var(--primary))] uppercase tracking-wide">Checkout</h1>
                <div className="grid gap-8">
                    {/* Voucher Section */}
                    <div className="bg-white border-2 border-black/5 p-8 rounded-3xl shadow-sm">
                        <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2 text-foreground">
                            <Tag className="w-5 h-5 text-[hsl(var(--primary))]" />
                            Have a Voucher?
                        </h2>

                        {voucherCode ? (
                            <div className="flex justify-between items-center bg-green-50 border-2 border-green-200 p-4 rounded-2xl">
                                <div>
                                    <p className="font-bold text-green-600 font-display text-lg">{voucherCode}</p>
                                    <p className="text-xs text-green-700 font-medium">Rs. {voucherDiscount} OFF applied</p>
                                </div>
                                <button onClick={handleRemoveVoucher} className="text-gray-400 hover:text-foreground transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter code"
                                    className="flex-1 rounded-xl border-2 border-black/10 bg-white text-foreground px-4 py-3 focus:outline-none focus:border-primary uppercase font-bold transition-colors"
                                    value={inputVoucher}
                                    onChange={(e) => setInputVoucher(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={checkVoucher}
                                    className="bg-black text-white font-bold px-8 py-3 rounded-xl hover:bg-primary transition-colors uppercase tracking-wider text-sm flex items-center justify-center"
                                >
                                    Apply
                                </button>
                            </div>
                        )}

                        {voucherStatus === 'success' && !voucherCode && <p className="text-green-600 text-sm mt-3 font-bold">{voucherMessage}</p>}
                        {voucherStatus === 'error' && <p className="text-red-500 text-sm mt-3 font-medium">{voucherMessage}</p>}
                    </div>

                    <form onSubmit={handleSubmission} className="space-y-6 bg-white border-2 border-black/5 p-8 rounded-3xl shadow-sm">
                        <div>
                            <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">Full Name</label>
                            <input
                                type="text"
                                required
                                className="mt-2 block w-full rounded-xl border-2 border-black/10 bg-white text-foreground px-4 py-4 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 sm:text-base font-bold placeholder-muted-foreground transition-all"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Ali Khan"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">Whatsapp Number</label>
                            <input
                                type="tel"
                                required
                                className="mt-2 block w-full rounded-xl border-2 border-black/10 bg-white text-foreground px-4 py-4 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 sm:text-base font-bold placeholder-muted-foreground transition-all"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="e.g. 0300 1234567 (Whatsapp)"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">Shipping Address</label>
                            <textarea
                                required
                                rows={4}
                                className="mt-2 block w-full rounded-xl border-2 border-black/10 bg-white text-foreground px-4 py-4 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 sm:text-base font-bold placeholder-muted-foreground transition-all"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Full address (House #, Street, City)"
                            />
                        </div>

                        {/* Payment Method Selection */}
                        <div className="pt-4">
                            <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wide mb-4">Payment Method</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('cod')}
                                    className={`relative flex items-center p-5 rounded-2xl border-2 transition-all ${paymentMethod === 'cod'
                                        ? 'border-[hsl(var(--primary))] bg-primary/5'
                                        : 'border-black/10 bg-gray-50 hover:border-primary/50 hover:bg-primary/5'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-[hsl(var(--primary))]' : 'border-black/20'
                                        }`}>
                                        {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--primary))]" />}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-foreground text-lg font-display flex items-center gap-2">
                                            <Banknote className="w-5 h-5 text-green-500" />
                                            Cash on Delivery
                                        </p>
                                        <p className="text-sm text-muted-foreground font-medium mt-0.5">Pay when you receive</p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('online')}
                                    className={`relative flex items-center p-5 rounded-2xl border-2 transition-all ${paymentMethod === 'online'
                                        ? 'border-[hsl(var(--primary))] bg-primary/5'
                                        : 'border-black/10 bg-gray-50 hover:border-primary/50 hover:bg-primary/5'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${paymentMethod === 'online' ? 'border-[hsl(var(--primary))]' : 'border-black/20'
                                        }`}>
                                        {paymentMethod === 'online' && <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--primary))]" />}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-foreground text-lg font-display flex items-center gap-2">
                                            <CreditCard className="w-5 h-5 text-blue-500" />
                                            Online Payment
                                        </p>
                                        <p className="text-sm text-muted-foreground font-medium mt-0.5">EasyPaisa / SadaPay</p>
                                    </div>
                                </button>
                            </div>

                            {paymentMethod === 'online' && (
                                <div className="mt-3 text-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowPaymentDetailsModal(true)}
                                        className="text-[hsl(var(--primary))] text-sm font-bold underline hover:text-foreground transition-colors"
                                    >
                                        View Payment Details Again
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="border-t-2 border-black/5 pt-6 mt-8 space-y-3 font-medium text-muted-foreground">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>Rs. {cartTotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Charges</span>
                                <span className={isFreeDelivery ? "text-[hsl(var(--primary))] font-bold bg-primary/10 px-2 rounded-md" : ""}>
                                    {isFreeDelivery ? 'FREE' : `Rs. ${deliveryCharge}`}
                                </span>
                            </div>
                            {voucherDiscount > 0 && (
                                <div className="flex justify-between text-green-600 font-bold">
                                    <span>Voucher Discount</span>
                                    <span>- Rs. {voucherDiscount}</span>
                                </div>
                            )}
                            {isFreeDelivery && (
                                <div className="flex justify-between text-[hsl(var(--primary))] text-sm">
                                    <span>Gift Included</span>
                                    <span>10 Pcs Stickers Pack</span>
                                </div>
                            )}
                            <div className="flex justify-between text-2xl font-bold font-display pt-6 border-t-2 border-black/5">
                                <span className="text-foreground">Total Amount</span>
                                <span className="text-[hsl(var(--primary))]">Rs. {finalTotal}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[hsl(var(--primary))] text-primary-foreground py-4 rounded-full font-bold font-display uppercase tracking-widest text-xl hover:-translate-y-1 transition-transform shadow-md disabled:opacity-50 disabled:hover:translate-y-0 mt-8"
                        >
                            {loading ? 'Placing Order...' : 'Confirm Order'}
                        </button>
                    </form>
                </div>
            </div>

        </div>
    )
}
