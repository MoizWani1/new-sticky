'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ToastContainer from '@/components/ui/ToastContainer'


export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    // Check if the current route is an admin route
    // Adjust logic if you have other paths to exclude
    const isAdmin = pathname?.startsWith('/admin')
    const isCartOrCheckout = pathname === '/cart' || pathname?.startsWith('/checkout')
    const isBundlePage = pathname === '/bundle'

    return (
        <div className="flex min-h-screen flex-col">
            {!isAdmin && !isCartOrCheckout && !isBundlePage && <Navbar />}
            <ToastContainer />
            <main className="flex-1">{children}</main>
            {!isAdmin && !isBundlePage && <Footer />}
        </div>
    )
}
