import { supabase } from '@/lib/supabase'
import ProductGrid from '@/components/ProductGrid'
import PaginationControls from '@/components/PaginationControls'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// Render dynamically because of searchParams
export const dynamic = 'force-dynamic'

export default async function ThemePage({
    params,
    searchParams,
}: {
    params: { themeName: string }
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const decodedThemeName = decodeURIComponent(params.themeName)
    const page = searchParams?.page ?? '1'
    const currentPage = Number(page)
    const per_page = 12 // Using 12 products per page to match homepage
    const start = (currentPage - 1) * per_page
    const end = start + per_page - 1

    const { data: products, count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('category', decodedThemeName)
        .order('created_at', { ascending: false })
        .range(start, end)

    if (error) {
        console.error('Error fetching products for theme:', error)
        return <div className="p-10 text-center text-red-500">Failed to load theme products. Please check connection.</div>
    }

    return (
        <div className="min-h-screen">
            <main className="container mx-auto px-4 py-8 md:py-16">
                <Link
                    href="/#themes"
                    className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-6 md:mb-10 font-bold"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Themes
                </Link>

                <h1 className="font-display text-4xl md:text-6xl font-extrabold text-center mb-12">
                    {decodedThemeName} <span className="text-primary">Stickers</span>
                </h1>

                <ProductGrid products={products || []} />

                <div className="mt-8 flex justify-center">
                    <PaginationControls
                        hasNextPage={end < (count ?? 0)}
                        hasPrevPage={start > 0}
                        totalCount={count ?? 0}
                    />
                </div>
            </main>
        </div>
    )
}
