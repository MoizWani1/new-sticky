import { supabase } from '@/lib/supabase'
import Hero from '@/components/Hero'
import FreshPeel from '@/components/FreshPeel'
import StickerThemes from '@/components/StickerPacks'
import ProductGrid from '@/components/ProductGrid'
import PaginationControls from '@/components/PaginationControls'

// ISR: Revalidate every 60 seconds
export const revalidate = 60

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = searchParams?.page ?? '1'
  const currentPage = Number(page)
  const per_page = 12 // User requested 12 products per page
  const start = (currentPage - 1) * per_page
  const end = start + per_page - 1

  const { data: products, count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(start, end)

  // Fetch Best Sellers separately (Top 10)
  const { data: bestSellers } = await supabase
    .from('products')
    .select('*')
    .eq('is_best_seller', true)
    .range(0, 9)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return <div className="p-10 text-center text-red-500">Failed to load products. Please check connection.</div>
  }

  const showHeroAndFeatured = currentPage === 1

  return (
    <div className="min-h-screen">
      <main>
        {showHeroAndFeatured && (
          <>
            <Hero />
            <FreshPeel products={bestSellers || []} />
            <StickerThemes />
          </>
        )}

        {/* All Products Grid styled to match the simple UI */}
        <section id="all-products" className="container mx-auto px-4 pt-8 pb-4">
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-center mb-10">
            {showHeroAndFeatured ? "More Sticky Goodness" : "All Products"}
          </h2>

          <ProductGrid products={products || []} />

          <div className="mt-6 flex justify-center">
            <PaginationControls
              hasNextPage={end < (count ?? 0)}
              hasPrevPage={start > 0}
              totalCount={count ?? 0}
            />
          </div>
        </section>
      </main>
    </div>
  )
}
