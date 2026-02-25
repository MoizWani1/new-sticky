'use client'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { useEffect, useState } from 'react'

export default function Navbar() {
    const cartItems = useCartStore((state) => state.items)
    const [mounted, setMounted] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const itemCount = mounted ? cartItems.reduce((acc, item) => acc + item.quantity, 0) : 0

    const navItems = [
        { label: "Shop", href: "/#shop" },
        { label: "Themes", href: "/#themes" },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
            <div className="container mx-auto flex items-center justify-between py-3 px-4">
                <Link href="/">
                    <h1 className="font-display text-3xl md:text-4xl font-extrabold hover:scale-105 active:scale-95 transition-transform">
                        <span className="text-sticker-green">Sticky</span>
                        <span className="text-primary">Bits</span>
                    </h1>
                </Link>
                <ul className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                        <li key={item.label}>
                            <Link
                                href={item.href}
                                className="font-display text-lg font-bold px-4 py-2 rounded-full hover:bg-muted transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                    <li>
                        <Link href="/cart" className="relative p-2 ml-4 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform">
                            <ShoppingCart className="w-6 h-6" />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                                    {itemCount}
                                </span>
                            )}
                        </Link>
                    </li>
                </ul>

                <div className="flex md:hidden items-center gap-4">
                    <Link href="/cart" className="relative p-2 flex items-center justify-center active:scale-95 transition-transform">
                        <ShoppingCart className="w-6 h-6" />
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                                {itemCount}
                            </span>
                        )}
                    </Link>
                    <button
                        className="md:hidden font-display text-xl"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        ☰
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden bg-background border-b border-border">
                    <ul className="flex flex-col">
                        {navItems.map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className="font-display text-xl font-bold block px-6 py-4 hover:bg-muted transition-colors border-b border-border/50"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </nav>
    );
}
