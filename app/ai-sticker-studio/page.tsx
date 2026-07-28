"use client";

import Link from "next/link";
import { Construction, Zap } from "lucide-react";

export default function AIStickerStudio() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-white relative overflow-hidden px-4 selection:bg-yellow-500/30">

            {/* --- FUTURISTIC BACKGROUND LAYERS --- */}

            {/* 1. Grid Floor with Perspective */}
            <div className="absolute inset-0 pointer-events-none perspective-[1000px]">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [transform:rotateX(60deg)_translateY(-10%)] origin-top opacity-30" />
            </div>

            {/* 2. Scanning Laser Line */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-500/10 to-transparent h-[200%] w-full animate-[scan_8s_linear_infinite] pointer-events-none" />

            {/* 3. Floating Particles/Data/Specs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-500 rounded-full animate-ping opacity-20" />
                <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-cyan-500 rounded-full animate-ping opacity-20 delay-1000" />
                <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-white rounded-full animate-pulse opacity-10" />
            </div>

            {/* 4. Vignette & Noise Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(0,0,0,0.8)_90%)] pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />


            {/* --- MAIN CONTENT CARD --- */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-3xl animate-in fade-in zoom-in-95 duration-1000">

                {/* Holographic Badge */}
                <div className="mb-10 relative group">
                    <div className="absolute inset-0 bg-yellow-400 blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

                    <div className="relative bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-[0_0_40px_-10px_rgba(234,179,8,0.3)] flex items-center justify-center overflow-hidden">
                        {/* Inner animating ring */}
                        <div className="absolute inset-0 border border-yellow-500/30 rounded-3xl animate-[spin_10s_linear_infinite]" />
                        <div className="absolute inset-1 border border-cyan-500/20 rounded-[20px] animate-[spin_15s_linear_infinite_reverse]" />

                        <div className="relative z-10">
                            <Construction className="w-20 h-20 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] animate-pulse" />
                            <div className="absolute -bottom-2 -right-2 text-cyan-400 animate-bounce">
                                <Zap className="w-6 h-6 fill-cyan-400/50" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Typography with Glitch/Tech Effect */}
                <div className="space-y-2 mb-8">
                    <div className="flex items-center justify-center gap-3 text-cyan-500/80 font-mono text-xs tracking-[0.3em] uppercase mb-2">
                        <span>System Upgrade In Progress</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase text-white drop-shadow-2xl">
                        AI LAB <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500">V3.0</span>
                    </h1>
                </div>

                {/* Glassmorphism Status Panel */}
                <div className="w-full max-w-lg bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-12 relative overflow-hidden">
                    {/* Scanning sheen effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />

                    <div className="grid grid-cols-2 gap-4 text-left mb-6">
                        <div className="space-y-1">
                            <span className="text-xs text-neutral-500 font-mono uppercase">Module</span>
                            <p className="text-sm font-bold text-white flex items-center gap-2">
                                Image Gen Core
                            </p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-neutral-500 font-mono uppercase">Status</span>
                            <p className="text-sm font-bold text-yellow-500 animate-pulse">
                                Re-training...
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono text-neutral-400">
                            <span>Upload Protocol</span>
                            <span>98%</span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 w-[98%] shadow-[0_0_10px_rgba(234,179,8,0.5)] relative">
                                <div className="absolute inset-0 bg-white/20 animate-[pulse_1s_infinite]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Primary Actions */}
                <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
                    <Link
                        href="/"
                        className="group relative px-8 py-3 bg-white text-black font-bold rounded-lg overflow-hidden transition-all hover:scale-105 active:scale-95"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-200 via-white to-cyan-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <span className="relative flex items-center gap-2">
                            Return to Base
                        </span>
                    </Link>

                    <Link
                        href="/shop/stickers"
                        className="group px-8 py-3 bg-transparent text-white border border-white/20 font-bold rounded-lg hover:bg-white/5 transition-all hover:border-yellow-500/50 hover:text-yellow-400"
                    >
                        Access Archives
                    </Link>
                </div>

            </div>

            {/* Footer Tech Details */}
            <div className="absolute bottom-6 w-full flex justify-between px-8 text-[10px] text-neutral-600 font-mono tracking-widest uppercase pointer-events-none md:flex-row flex-col items-center gap-2">
                <span>SECURE_CONN_ESTABLISHED</span>
                <span>ID: SB-LABS-003</span>
            </div>

            <style jsx>{`
                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </main>
    );
}
