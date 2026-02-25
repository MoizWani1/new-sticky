'use client'
import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProductImageGallery({ images, name }: { images: string[], name: string }) {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const filteredImages = images?.filter(Boolean) || []
    const safeImages = filteredImages.length > 0 ? filteredImages : ['https://placehold.co/600x600/png?text=No+Image']
    const selectedImage = safeImages[selectedIndex]

    const handlePrev = () => {
        setSelectedIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1))
    }

    const handleNext = () => {
        setSelectedIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1))
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="relative aspect-square overflow-hidden bg-background rounded-2xl border border-border p-8 group transition-all duration-300">
                <Image
                    src={selectedImage}
                    alt={name}
                    fill
                    className="object-contain"
                    unoptimized
                />

                {safeImages.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card text-foreground p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100 border border-border"
                            aria-label="Previous Image"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card text-foreground p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100 border border-border"
                            aria-label="Next Image"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}
            </div>

            {safeImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {safeImages.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedIndex(index)}
                            className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${selectedIndex === index ? 'border-primary opacity-100 scale-105 shadow-md' : 'border-border opacity-70 hover:opacity-100'
                                }`}
                        >
                            <Image
                                src={img}
                                alt={`${name} ${index + 1}`}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
