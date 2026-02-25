import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
    image_url: string
    selectedVariants?: { [key: string]: string }
    bundleItems?: { name: string; image_url: string }[] // For 'Make Your Own Bundle' items
    packStickers?: { id: string, name: string, image_url: string }[]
}

interface CartState {
    items: CartItem[]
    voucherCode: string | null
    voucherType: 'fixed' | 'percentage' | null
    voucherValue: number
    addItem: (item: CartItem) => void
    removeItem: (id: string, selectedVariants?: { [key: string]: string }, packStickers?: any[]) => void
    decrementItem: (id: string, selectedVariants?: { [key: string]: string }, packStickers?: any[]) => void
    clearCart: () => void
    applyVoucher: (code: string, value: number, type: 'fixed' | 'percentage') => void
    removeVoucher: () => void
    total: () => number
    getDiscountAmount: () => number
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            voucherCode: null,
            voucherType: null,
            voucherValue: 0,
            addItem: (item) => set((state) => {
                const existing = state.items.find((i) =>
                    i.id === item.id &&
                    JSON.stringify(i.selectedVariants || {}) === JSON.stringify(item.selectedVariants || {}) &&
                    JSON.stringify(i.packStickers || []) === JSON.stringify(item.packStickers || [])
                )
                if (existing) {
                    return {
                        items: state.items.map((i) =>
                            (i.id === item.id &&
                                JSON.stringify(i.selectedVariants || {}) === JSON.stringify(item.selectedVariants || {}) &&
                                JSON.stringify(i.packStickers || []) === JSON.stringify(item.packStickers || []))
                                ? { ...i, quantity: i.quantity + 1 }
                                : i
                        ),
                    }
                }
                return { items: [...state.items, { ...item, quantity: 1 }] }
            }),
            removeItem: (id, selectedVariants, packStickers) => set((state) => ({
                items: state.items.filter((i) => !(
                    i.id === id &&
                    JSON.stringify(i.selectedVariants || {}) === JSON.stringify(selectedVariants || {}) &&
                    JSON.stringify(i.packStickers || []) === JSON.stringify(packStickers || [])
                )),
            })),
            decrementItem: (id, selectedVariants, packStickers) => set((state) => {
                const existing = state.items.find((i) =>
                    i.id === id &&
                    JSON.stringify(i.selectedVariants || {}) === JSON.stringify(selectedVariants || {}) &&
                    JSON.stringify(i.packStickers || []) === JSON.stringify(packStickers || [])
                )
                if (existing && existing.quantity > 1) {
                    return {
                        items: state.items.map((i) =>
                            (i.id === id &&
                                JSON.stringify(i.selectedVariants || {}) === JSON.stringify(selectedVariants || {}) &&
                                JSON.stringify(i.packStickers || []) === JSON.stringify(packStickers || []))
                                ? { ...i, quantity: i.quantity - 1 }
                                : i
                        ),
                    }
                }
                return {
                    items: state.items.filter((i) => !(
                        i.id === id &&
                        JSON.stringify(i.selectedVariants || {}) === JSON.stringify(selectedVariants || {}) &&
                        JSON.stringify(i.packStickers || []) === JSON.stringify(packStickers || [])
                    ))
                }
            }),
            clearCart: () => set({ items: [], voucherCode: null, voucherType: null, voucherValue: 0 }),
            applyVoucher: (code, value, type) => set({ voucherCode: code, voucherValue: value, voucherType: type }),
            removeVoucher: () => set({ voucherCode: null, voucherType: null, voucherValue: 0 }),
            total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
            getDiscountAmount: () => {
                const state = get()
                // console.log('getDiscountAmount state:', { code: state.voucherCode, type: state.voucherType, val: state.voucherValue, total: state.items.reduce((sum, item) => sum + item.price * item.quantity, 0) })
                if (!state.voucherCode || !state.voucherType) return 0

                if (state.voucherType === 'fixed') {
                    return state.voucherValue
                } else {
                    // Percentage
                    const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
                    return Math.round((total * state.voucherValue) / 100)
                }
            }
        }),
        {
            name: 'cart-storage',
        }
    )
)
