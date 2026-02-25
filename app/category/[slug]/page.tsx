import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import { notFound } from 'next/navigation'

export const revalidate = 0

interface PageProps {
    params: {
        slug: string
    }
}

export default async function CategoryPage({ params }: PageProps) {
    // Decode slug (e.g. "k-pop" -> "K-Pop" logic or just case insensitive search)
    const categorySlug = params.slug

    // Map friendly URLs to DB category names
    const categoryMap: Record<string, string> = {
        'anime': 'Anime',
        'marvel': 'Marvel',
        'k-pop': 'K-Pop',
        'gaming': 'Gaming',
        'other': 'Other'
    }

    const dbCategory = categoryMap[categorySlug.toLowerCase()]

    if (!dbCategory) {
        return notFound()
    }

    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', dbCategory)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching category:', error)
        return <div className="p-10 text-center text-red-500">Failed to load content.</div>
    }

    return (
        <div className="min-h-screen bg-black text-white px-4 py-8 md:px-6">
            <div className="container mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 text-[hsl(var(--primary))] uppercase">
                        {dbCategory} Collection
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Discover the best {dbCategory} stickers.
                    </p>
                </div>

                {products && products.length > 0 ? (
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-zinc-900 rounded-lg border border-zinc-800 border-dashed">
                        <p className="text-xl text-gray-500">No products found in this category.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
