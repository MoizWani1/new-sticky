import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import { notFound } from 'next/navigation'

export const revalidate = 0

interface PageProps {
    params: {
        type: string
    }
}

export default async function TypePage({ params }: PageProps) {
    const typeSlug = params.type

    // Basic mapping
    const typeMap: Record<string, string> = {
        'stickers': 'Sticker',
        'posters': 'Poster',
        'helmets': 'Helmet',
        'merchandise': 'Merchandise',
        'others': 'Other'
    }

    const dbType = typeMap[typeSlug.toLowerCase()]

    if (!dbType) {
        return notFound()
    }

    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('type', dbType)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching type:', error)
        return <div className="p-10 text-center text-red-500">Failed to load content.</div>
    }

    return (
        <div className="min-h-screen bg-black text-white px-4 py-8 md:px-6">
            <div className="container mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 text-[hsl(var(--primary))] uppercase">
                        {dbType}s
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Explore our collection of {dbType}s.
                    </p>
                </div>

                {/* Optional: Add Filters for Sub-Categories (Anime, Marvel etc) here later */}

                {products && products.length > 0 ? (
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-zinc-900 rounded-lg border border-zinc-800 border-dashed">
                        <p className="text-xl text-gray-500">No {dbType}s found yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
