"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

const originalImages = [
    "/assets/dummy.png",
    "/assets/dummy1.png",
    "/assets/dummy2.png",
    "/assets/dummy3.png",
    "/assets/dummy4.png",
    "/assets/dummy5.png",
    "/assets/dummy6.png",
    "/assets/dummy7.png",
    "/assets/dummy8.png",
]

export default function HeroSlideshow() {
    const [index, setIndex] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(true)
    // We append the first image at the end to create an infinite loop effect
    const images = [...originalImages, originalImages[0]]
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prevIndex) => prevIndex + 1)
            setIsTransitioning(true)
        }, 5000)

        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        // When we reach the cloned last image (which is visually the same as index 0)
        if (index === images.length - 1) {
            // Wait for the transition to finish (matches duration-1000 = 1000ms)
            timeoutRef.current = setTimeout(() => {
                setIsTransitioning(false) // Disable transition for instant jump
                setIndex(0) // Jump back to real index 0
            }, 1000)
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [index, images.length])

    return (
        <div className="relative w-full h-full overflow-hidden shadow-liquid-glass z-0 border-b border-white/10">
            <div
                className="flex h-full"
                style={{
                    width: `${images.length * 100}%`,
                    transform: `translateX(-${(index * 100) / images.length}%)`,
                    transition: isTransitioning ? "transform 1000ms ease-in-out" : "none",
                }}
            >
                {images.map((src, i) => (
                    <div
                        key={i}
                        className="relative h-full"
                        style={{ width: `${100 / images.length}%` }}
                    >
                        <Image
                            src={src}
                            alt="Hero Feature"
                            fill
                            className="object-cover object-center"
                            priority={i === 0}
                            unoptimized
                        />
                    </div>
                ))}
            </div>
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20 pointer-events-none"></div>
        </div>
    )
}
