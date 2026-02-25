'use client'

import { useState, useEffect } from 'react'
import { StickyWallPost } from '@/types'
import Image from 'next/image'

export default function GalleryGrid({ posts: initialPosts }: { posts: StickyWallPost[] }) {
    const [posts, setPosts] = useState(initialPosts)

    useEffect(() => {
        setPosts(initialPosts)
    }, [initialPosts])

    useEffect(() => {
        const handleNewPost = (event: CustomEvent<StickyWallPost>) => {
            console.log('New post received:', event.detail)
            setPosts((prev) => [event.detail, ...prev])
        }

        window.addEventListener('new-sticky-post' as any, handleNewPost as any)
        return () => {
            window.removeEventListener('new-sticky-post' as any, handleNewPost as any)
        }
    }, [])

    if (posts.length === 0) {
        return (
            <div className="text-center py-20 text-gray-500">
                <p className="text-xl">No posts yet. Be the first to upload!</p>
            </div>
        )
    }

    return (
        <div className="flex flex-wrap justify-center items-start gap-3 md:gap-5 pb-20 pt-10 px-2">
            {posts.map((post, index) => {
                // Determine size - SMALLER widths to fit 6-7 items on large screens
                // Base sizes: Small (w-32/36), Medium (w-40/44), Large (w-48/52)
                const sizeIndex = index % 5;
                let sizeClass = 'w-40 md:w-44'; // Default Medium
                if (sizeIndex === 0 || sizeIndex === 3) sizeClass = 'w-32 md:w-36'; // Small
                if (sizeIndex === 1) sizeClass = 'w-48 md:w-52'; // Large

                // Rotation: Random mess (-10 to +10 deg)
                const rotation = (index % 2 === 0 ? 1 : -1) * ((index * 13) % 10 + 2);

                // Y-Offset to break horizontal lines
                const yOffset = (index % 3) * 30;

                return (
                    <div
                        key={post.id}
                        className={`relative group ${sizeClass} transition-all duration-500 hover:z-50 hover:scale-110 hover:rotate-0 transform-gpu`}
                        style={{
                            transform: `rotate(${rotation}deg) translateY(${yOffset}px)`,
                            marginTop: `${index % 4 * 25}px`
                        }}
                    >
                        <div className="bg-white p-1.5 pb-8 shadow-md group-hover:shadow-2xl transition-all duration-300">
                            <div className="relative aspect-square overflow-hidden bg-gray-100 border border-gray-100">
                                <Image
                                    src={post.image_url}
                                    alt={`Posted by ${post.user_name}`}
                                    width={300}
                                    height={300}
                                    className="w-full h-full object-cover filter contrast-110 saturate-110"
                                    unoptimized
                                />
                            </div>

                            {/* Tape Effect */}
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/40 backdrop-blur-[2px] shadow-sm rotate-1 mix-blend-overlay border border-white/20"></div>

                            {/* Name Label */}
                            <div className="absolute bottom-1.5 left-0 right-0 text-center px-1">
                                <p className="font-[family-name:var(--font-permanent-marker)] text-xs md:text-sm text-black rotate-[-1deg] opacity-90 truncate leading-none">
                                    {post.user_name}
                                </p>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
