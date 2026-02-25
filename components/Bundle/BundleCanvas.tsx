'use client'

interface BundleCanvasProps {
    className?: string
}

export default function BundleCanvas({ className = "fixed inset-0 z-0 bg-neutral-950" }: BundleCanvasProps) {
    return (
        <div className={className}>
            {/* Base Gold Dot Pattern */}
            <div className="absolute inset-0 opacity-40"
                style={{
                    backgroundImage: `radial-gradient(#D4AF37 1.5px, transparent 1.5px)`,
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Secondary Interactive Pattern */}
            <div className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    backgroundPosition: '12px 12px'
                }}
            />

            {/* Vignette & Gradient Overlays for Depth - Reduced opacity to show pattern */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-40" />

            {/* Subtle Gold Glow in center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-[hsl(var(--primary))] opacity-[0.08] blur-[100px] rounded-full pointer-events-none" />
        </div>
    )
}
