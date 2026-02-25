'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface PaginationControlsProps {
    hasNextPage: boolean
    hasPrevPage: boolean
    totalCount: number
}

export default function PaginationControls({
    hasNextPage,
    hasPrevPage,
    totalCount
}: PaginationControlsProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const page = searchParams.get('page') ?? '1'
    const per_page = '12'

    const pathname = usePathname()

    const createQueryString = (name: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(name, value)
        return params.toString()
    }

    return (
        <div className='flex gap-2 justify-center mt-12'>
            <button
                className={`skeuo-btn-outline text-white px-6 py-3 rounded-xl font-bold hover:text-[hsl(var(--primary))] transition-all uppercase tracking-wider ${!hasPrevPage && 'opacity-50 cursor-not-allowed hover:bg-transparent hover:shadow-none hover:text-white'}`}
                disabled={!hasPrevPage}
                onClick={() => {
                    const prevPage = Number(page) - 1
                    router.push(`${pathname}?${createQueryString('page', prevPage.toString())}#products-grid-top`)
                }}>
                Previous
            </button>

            <div className='flex items-center px-4 font-bold text-[hsl(var(--primary))] drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]'>
                Page {page}
            </div>

            <button
                className={`skeuo-btn text-black px-6 py-3 rounded-xl font-bold transition-all uppercase tracking-wider ${!hasNextPage && 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none'}`}
                disabled={!hasNextPage}
                onClick={() => {
                    const nextPage = Number(page) + 1
                    router.push(`${pathname}?${createQueryString('page', nextPage.toString())}#products-grid-top`)
                }}>
                Next
            </button>
        </div>
    )
}
