import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import AddToCartButton from '@/components/AddToCartButton'
import ProductImageGallery from '@/components/ProductImageGallery'
import type { Metadata, ResolvingMetadata } from 'next'

export const revalidate = 60

interface Props {
    params: { id: string }
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const id = params.id
    const { data: product } = await supabase.from('products').select('*').eq('id', id).single()

    if (!product) {
        return {
            title: 'Product Not Found - StickyBits',
        }
    }

    const previousImages = (await parent).openGraph?.images || []

    return {
        title: `${product.name} | StickyBits.pk`,
        description: product.description?.slice(0, 160) || `Buy ${product.name} at StickyBits. Premium quality stickers and more.`,
        openGraph: {
            title: product.name,
            description: product.description?.slice(0, 160),
            url: `https://stickybits.pk/product/${product.id}`,
            images: [product.image_url, ...previousImages],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description: product.description?.slice(0, 160),
            images: [product.image_url],
        },
    }
}

export default async function ProductPage({ params }: Props) {
    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single()

    if (error || !product) {
        notFound()
    }

    let imageList: string[] = []
    if (product.images && product.images.length > 0) {
        imageList = product.images
    } else if (product.image_url) {
        imageList = [product.image_url]
    } else {
        imageList = ['https://placehold.co/600x600/png?text=No+Image']
    }

    return (
        <div className="min-h-screen bg-background container mx-auto px-4 py-8 md:py-16">
            <div className="max-w-6xl mx-auto bg-card rounded-3xl p-6 md:p-12 shadow-sm border border-border">
                <div className="grid gap-12 md:grid-cols-2">
                    <ProductImageGallery images={imageList} name={product.name} />
                    <div className="flex flex-col justify-center space-y-8">
                        <div>
                            <h1 className="font-display text-xl md:text-5xl font-extrabold text-foreground leading-tight mb-4">{product.name}</h1>
                            <div className="h-1.5 w-24 bg-primary rounded-full"></div>
                        </div>

                        <div className="mt-8">
                            <AddToCartButton product={product} />
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border">
                    <h3 className="font-display text-2xl font-bold mb-4">Product Details</h3>
                    <div className="prose prose-lg text-muted-foreground font-body max-w-none">
                        <p className="leading-relaxed whitespace-pre-line">{product.description}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
