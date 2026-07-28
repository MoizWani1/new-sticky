'use client'
import React from 'react'
import { usePathname } from 'next/navigation'

const PenDoodle = ({ className, d }: { className: string, d: string }) => (
    <svg
        viewBox="0 0 100 100"
        className={`absolute pointer-events-none opacity-[0.12] text-foreground ${className}`}
        style={{ filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.1))' }}
    >
        <path
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="3 5"
        />
    </svg>
)

export default function BackgroundDoodles() {
    const pathname = usePathname();

    if (pathname?.startsWith('/admin')) {
        return null;
    }

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
            {/* Top Section */}
            <PenDoodle className="w-32 h-32 top-[5%] right-[10%] rotate-12" d="M 20 50 L 80 20 L 50 80 L 40 60 L 20 50 Z M 40 60 L 80 20" />
            <PenDoodle className="w-24 h-24 top-[10%] left-[8%] -rotate-12" d="M 50 10 L 50 90 M 10 50 L 90 50 M 20 20 L 80 80 M 20 80 L 80 20" />

            {/* Mid-Top Section */}
            <PenDoodle className="w-40 h-40 top-[20%] right-[15%] -rotate-[20deg]" d="M 20 50 C 20 20, 80 20, 80 50 C 80 80, 40 80, 40 60 C 40 40, 60 40, 60 55 C 60 65, 50 65, 50 60" />
            <PenDoodle className="w-20 h-20 top-[28%] left-[12%] rotate-45" d="M 50 20 L 80 80 L 20 80 Z" />

            {/* Middle Section */}
            <PenDoodle className="w-28 h-28 top-[38%] right-[8%] rotate-[60deg]" d="M 20 50 L 80 50 M 60 30 L 80 50 L 60 70 M 20 50 Q 40 30 50 50 T 80 50" />
            <PenDoodle className="w-32 h-32 top-[45%] left-[15%] -rotate-6" d="M 30 60 C 20 60 20 45 35 45 C 35 30 55 30 65 40 C 75 35 85 45 80 60 Z" />

            {/* Mid-Bottom Section */}
            <PenDoodle className="w-24 h-24 top-[55%] right-[20%] rotate-12" d="M 50 80 C 50 80, 10 50, 10 30 C 10 10, 40 10, 50 30 C 60 10, 90 10, 90 30 C 90 50, 50 80, 50 80 Z" />
            <PenDoodle className="w-28 h-28 top-[65%] left-[10%] rotate-[180deg]" d="M 20 50 L 80 20 L 50 80 L 40 60 L 20 50 Z M 40 60 L 80 20" />
            <PenDoodle className="w-20 h-20 top-[72%] right-[12%] rotate-45" d="M 50 10 L 50 90 M 10 50 L 90 50 M 20 20 L 80 80 M 20 80 L 80 20" />

            {/* Bottom Section */}
            <PenDoodle className="w-32 h-32 top-[82%] left-[16%] -rotate-[15deg]" d="M 20 50 C 20 20, 80 20, 80 50 C 80 80, 40 80, 40 60 C 40 40, 60 40, 60 55 C 60 65, 50 65, 50 60" />
            <PenDoodle className="w-24 h-24 top-[90%] right-[15%] rotate-[-45deg]" d="M 20 50 L 80 50 M 60 30 L 80 50 L 60 70 M 20 50 Q 40 30 50 50 T 80 50" />
            <PenDoodle className="w-32 h-32 top-[95%] left-[8%] rotate-12" d="M 30 60 C 20 60 20 45 35 45 C 35 30 55 30 65 40 C 75 35 85 45 80 60 Z" />
        </div>
    )
}
