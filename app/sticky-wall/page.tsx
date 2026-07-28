import GalleryGrid from '@/components/StickyWall/GalleryGrid'
import UploadModal from '@/components/StickyWall/UploadModal'
import { supabase } from '@/lib/supabase'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function StickyWallPage() {
    const { data: posts } = await supabase
        .from('sticky_wall_posts')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-20 relative overflow-x-hidden selection:bg-yellow-500/30">
            {/* Premium Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {/* 1. Golden Spotlight at Top */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-600/20 via-neutral-950/0 to-transparent blur-3xl opacity-60"></div>

                {/* 2. Subtle Grid Pattern */}
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] bg-[length:40px_40px]"></div>

                {/* 3. Noise Texture (Kept existing but adjusted) */}
                <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'url("/noise.png")' }}></div>
            </div>

            {/* Header Section */}
            <div className="relative pt-20 pb-32 text-center z-20 px-4 pointer-events-none">
                <div className="pointer-events-auto">
                    <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight text-white mb-4 drop-shadow-xl">
                        Sticky Wall of Fame
                    </h1>
                    <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto drop-shadow-md">
                        Want to show your art to our community?
                    </p>
                    <p className="text-yellow-400 font-medium mt-2 drop-shadow-md">
                        Do so and grab <span className="font-bold underline">5% off</span> on your next order.
                    </p>

                    <div className="mt-8">
                        <UploadModal />
                    </div>
                </div>
            </div>

            {/* Gallery Section */}
            <div className="w-full px-2 md:px-8 relative z-10 -mt-20">
                <GalleryGrid posts={posts || []} />
            </div>
        </div>
    )
}
