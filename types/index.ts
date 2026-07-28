export interface VariantOption {
    value: string
    price?: number
}

export interface Variant {
    name: string
    options: VariantOption[]
}

export interface PackSticker {
    id: string
    name: string
    image_url: string
}

export interface Product {
    id: string
    name: string
    description: string | null
    price: number
    sale_price?: number | null
    image_url: string | null
    images?: string[]
    stock_status?: string
    category?: string
    type?: string
    is_best_seller?: boolean
    variants?: Variant[]
    pack_stickers?: PackSticker[]
    sticker_price?: number
    created_at: string
}

export interface Order {
    id: string
    created_at: string
    customer_name: string
    customer_address: string
    customer_phone: string
    order_items: any
    total_amount: number
    status: string
    discount_total: number
    applied_offers?: string
    rejected_at?: string
    payment_method?: string
    payment_status?: string
}

export interface Voucher {
    id: string
    code: string
    discount_amount: number
    discount_type: string
    is_active: boolean
    created_at: string
}
export interface StickyWallPost {
    id: string
    image_url: string
    product_id: string
    user_name: string
    review: string
    rating: number
    voucher_code?: string
    created_at: string
    product?: Product // Joined product data
}
