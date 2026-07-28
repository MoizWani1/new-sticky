'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Upload, Check, Camera, Search } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import confetti from 'canvas-confetti'
import { createPortal } from 'react-dom'

export default function UploadModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [step, setStep] = useState(1) // 1: Form, 2: Success
    const [loading, setLoading] = useState(false)

    // Form State
    const [userName, setUserName] = useState('')
    const [image, setImage] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)

    // Success State
    const [voucherCode, setVoucherCode] = useState('')

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]

            try {
                const options = {
                    maxSizeMB: 0.2, // 200KB
                    maxWidthOrHeight: 1200, // Reduced from 1920 to ensure better compression
                    useWebWorker: true,
                    fileType: 'image/jpeg'
                }
                const compressedFile = await imageCompression(file, options)
                setImage(compressedFile)
                setPreview(URL.createObjectURL(compressedFile))
            } catch (error) {
                console.error('Compression ended:', error)
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!image || !userName) return

        setLoading(true)

        try {
            const formData = new FormData()
            formData.append('image', image)
            formData.append('userName', userName)

            const res = await fetch('/api/sticky-wall/create', {
                method: 'POST',
                body: formData
            })

            const data = await res.json()

            if (data.success) {
                setVoucherCode(data.voucherCode)
                setStep(2)

                // Optimistic Update: Notify GalleryGrid
                const event = new CustomEvent('new-sticky-post', { detail: data.post })
                window.dispatchEvent(event)

                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                })
            } else {
                alert(data.error || 'Something went wrong')
            }
        } catch (err) {
            alert('Failed to upload')
        } finally {
            setLoading(false)
        }
    }

    const reset = () => {
        setIsOpen(false)
        setStep(1)
        setImage(null)
        setPreview(null)
        setUserName('')
        setVoucherCode('')
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="liquid-btn px-8 py-4 text-xl font-bold uppercase tracking-wider rounded-full shadow-[0_0_20px_rgba(255,215,0,0.5)] hover:shadow-[0_0_30px_rgba(255,215,0,0.8)] transition-all transform hover:scale-105"
            >
                Upload Your Vibe
            </button>
        )
    }

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden relative shadow-2xl">
                <button onClick={reset} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
                    <X />
                </button>

                {step === 1 ? (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-600 mb-6">
                            Share Your Vibe
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <input
                                type="text"
                                placeholder="Your Name (or Nickname)"
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:border-yellow-500 outline-none"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                required
                            />

                            <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-yellow-500/50 transition-colors relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    required
                                />
                                {preview ? (
                                    <img src={preview} alt="Preview" className="h-48 mx-auto rounded object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-gray-400">
                                        <Camera className="w-8 h-8" />
                                        <span className="text-sm">Click to upload photo</span>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? 'Uploading...' : 'Post & Get 5% Off'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="p-8 text-center bg-gradient-to-b from-yellow-500/10 to-transparent">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-8 h-8 text-black" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Awesome!</h2>
                        <p className="text-gray-400 mb-6">Thanks for sharing. Here is your 5% discount code:</p>

                        <div className="bg-black/50 border border-yellow-500/30 p-4 rounded-lg mb-6 flex items-center justify-center gap-4">
                            <span className="text-2xl font-mono font-bold text-yellow-400 tracking-widest">{voucherCode}</span>
                        </div>

                        <p className="text-xs text-gray-400 mb-6">
                            Note: It normally takes 1-2 minutes to appear on the Sticky Wall.
                            <br />
                            Valid for your next order. Auto-applied if you shop now!
                        </p>

                        <button onClick={reset} className="text-white hover:text-yellow-400 font-bold">
                            Close & Browse Gallery
                        </button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    )
}
