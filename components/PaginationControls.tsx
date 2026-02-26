'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
        <div className='flex gap-3 justify-center mt-4'>
            <button
                className={`flex items-center justify-center skeuo-btn-outline text-white px-5 py-2.5 rounded-xl font-bold hover:text-[hsl(var(--primary))] transition-all uppercase tracking-wider text-sm md:text-base shadow-sm ${!hasPrevPage && 'opacity-50 cursor-not-allowed hover:bg-transparent hover:shadow-none hover:text-white'}`}
                disabled={!hasPrevPage}
                onClick={() => {
                    const prevPage = Number(page) - 1
                    router.push(`${pathname}?${createQueryString('page', prevPage.toString())}#products-grid-top`)
                }}>
                <ChevronLeft className="w-5 h-5 mr-1 -ml-1" /> Prev
            </button>

            <div className='flex items-center px-4 font-extrabold text-lg text-[hsl(var(--primary))] drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]'>
                Page {page}
            </div>

            <button
                className={`flex items-center justify-center skeuo-btn text-black px-5 py-2.5 rounded-xl font-bold transition-all uppercase tracking-wider text-sm md:text-base shadow-sm ${!hasNextPage && 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none'}`}
                disabled={!hasNextPage}
                onClick={() => {
                    const nextPage = Number(page) + 1
                    router.push(`${pathname}?${createQueryString('page', nextPage.toString())}#products-grid-top`)
                }}>
                Next <ChevronRight className="w-5 h-5 ml-1 -mr-1" />
            </button>
        </div>
    )
}
