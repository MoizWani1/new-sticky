'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Trash2, ArrowLeft, Upload, Loader2, Edit, X, Plus, Wand2, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import imageCompression from 'browser-image-compression'

interface BundleSticker {
    id: string
    name: string
    image_url: string
    category: string
    created_at: string
}

interface StagedSticker {
    id: string
    file: File
    name: string
    category: string
    preview: string
    status: 'pending' | 'processing' | 'done' | 'error'
    error?: string
}

const CATEGORIES = ['Marvel', 'Anime', 'Programming', 'Girly', 'Other']

export default function BundleStickersPage() {
    const router = useRouter()
    const [stickers, setStickers] = useState<BundleSticker[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState({ current: 0, total: 0 })

    // Form/Staging State
    const [stagedFiles, setStagedFiles] = useState<StagedSticker[]>([])
    const [category, setCategory] = useState(CATEGORIES[0]) // Default/Global Category

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [editCategory, setEditCategory] = useState(CATEGORIES[0])
    const [editCurrentUrl, setEditCurrentUrl] = useState<string | null>(null)
    const [editFile, setEditFile] = useState<File | null>(null)

    const fetchStickers = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('bundle_stickers')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setStickers(data)
        if (error) console.error('Error fetching stickers:', error)
        setLoading(false)
    }, [])

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/admin')
            } else {
                fetchStickers()
            }
        }
        checkUser()
    }, [router, fetchStickers])

    // Handle Paste Event
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (e.clipboardData?.files) {
                const files = Array.from(e.clipboardData.files).filter(f => f.type.startsWith('image/'))
                if (files.length > 0) addFilesToStage(files)
            }
        }
        window.addEventListener('paste', handlePaste)
        return () => window.removeEventListener('paste', handlePaste)
    }, [stagedFiles, category]) // Added category dependency to use current selection

    const startEditing = (sticker: BundleSticker) => {
        setEditingId(sticker.id)
        setEditName(sticker.name)
        setEditCategory(sticker.category)
        setEditCurrentUrl(sticker.image_url)
        setEditFile(null)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const cancelEditing = () => {
        setEditingId(null)
        setEditName('')
        setEditCategory(CATEGORIES[0])
        setEditCurrentUrl(null)
        setEditFile(null)
    }

    const addFilesToStage = (files: File[]) => {
        const remainingSlots = 20 - stagedFiles.length
        if (remainingSlots <= 0) {
            alert('Maximum 20 stickers allowed at once.')
            return
        }

        const newFiles = files.slice(0, remainingSlots).map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            name: file.name.split('.')[0], // Use filename as default name
            category: category, // Initialize with currently selected global category
            preview: URL.createObjectURL(file), // Helper to show preview
            status: 'pending' as const
        }))

        setStagedFiles(prev => [...prev, ...newFiles])
    }

    const removeStagedFile = (id: string) => {
        setStagedFiles(prev => prev.filter(f => f.id !== id))
    }

    const updateStagedName = (id: string, newName: string) => {
        setStagedFiles(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f))
    }

    const updateStagedCategory = (id: string, newCategory: string) => {
        setStagedFiles(prev => prev.map(f => f.id === id ? { ...f, category: newCategory } : f))
    }

    const processAndUploadImage = async (file: File, name: string, category: string): Promise<string> => {
        let fileToUpload = file

        // 5. Compress Result
        try {
            const options = {
                maxSizeMB: 0.2, // 200KB
                maxWidthOrHeight: 1024,
                useWebWorker: true,
                fileType: 'image/png'
            }
            const compressedFile = await imageCompression(fileToUpload, options)
            fileToUpload = compressedFile
        } catch (error) {
            console.error("Compression failed (continuing with original):", error)
        }

        // 6. Upload
        const fileExt = 'png'
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `bundle-stickers/${fileName}`

        try {
            console.log(`Uploading to bucket 'products': ${filePath}`)
            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, fileToUpload)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath)

            return publicUrl
        } catch (err: any) {
            console.error('Storage Upload Failed:', err)
            throw new Error(`Upload Failed: ${err.message}. Check Bucket 'products' exists.`)
        }
    }

    const handleBulkUpload = async () => {
        if (stagedFiles.length === 0) return

        setUploading(true)
        setProgress({ current: 0, total: stagedFiles.length })

        let completed = 0

        for (const sticker of stagedFiles) {
            // Update status to processing
            setStagedFiles(prev => prev.map(f => f.id === sticker.id ? { ...f, status: 'processing' } : f))

            try {
                const publicUrl = await processAndUploadImage(sticker.file, sticker.name, sticker.category)

                const { error: insertError } = await supabase
                    .from('bundle_stickers')
                    .insert({
                        name: sticker.name,
                        category: sticker.category,
                        image_url: publicUrl
                    })

                if (insertError) throw insertError

                // Mark as done
                setStagedFiles(prev => prev.map(f => f.id === sticker.id ? { ...f, status: 'done' } : f))

            } catch (error: any) {
                console.error(`Error uploading ${sticker.name}:`, error)
                setStagedFiles(prev => prev.map(f => f.id === sticker.id ? { ...f, status: 'error', error: error.message } : f))
            }

            completed++
            setProgress({ current: completed, total: stagedFiles.length })
        }

        // Cleanup: remove successfully uploaded files from staging
        // We use a timeout to let the last state update settle, but we trust our local 'completed' count vs total
        setTimeout(() => {
            setStagedFiles(prev => prev.filter(f => f.status === 'error'))
            setUploading(false)
            fetchStickers()

            // Check if we had any failures based on remaining files in staging (which are errors)
            // But since setStagedFiles is async, we can't rely on it immediately here.
            // Better approach: If completed == total, then all good.
            // Actually, we tracked errors in the loop. 
            // Let's just say:
            if (completed === stagedFiles.length) {
                // Optimization: If simple count matches, it doesn't mean no errors if we incremented on error too.
                // Let's rely on the fact that we set status='error' and filter them out.
                // A simple generic message is safer:
                alert('Upload process complete.')
            }
        }, 1000)
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingId || !editName) return

        setUploading(true)
        try {
            let publicUrl = editCurrentUrl

            if (editFile) {
                // Delete old image
                if (editCurrentUrl) {
                    const oldPath = editCurrentUrl.split('/products/').pop()
                    if (oldPath) await supabase.storage.from('products').remove([oldPath])
                }
                // Upload new image
                publicUrl = await processAndUploadImage(editFile, editName, editCategory)
            }

            if (!publicUrl) throw new Error("Image URL missing")

            const { error: updateError } = await supabase
                .from('bundle_stickers')
                .update({
                    name: editName,
                    category: editCategory,
                    image_url: publicUrl
                })
                .eq('id', editingId)

            if (updateError) throw updateError

            alert('Sticker updated!')
            cancelEditing()
            fetchStickers()
        } catch (error: any) {
            console.error(error)
            alert('Error updating: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (id: string, imageUrl: string) => {
        if (!confirm('Are you sure you want to delete this sticker?')) return

        try {
            if (imageUrl) {
                const pathToCheck = 'products/'
                if (imageUrl.includes(pathToCheck)) {
                    const path = imageUrl.split(pathToCheck).pop()
                    if (path) await supabase.storage.from('products').remove([path])
                }
            }

            const { error } = await supabase.from('bundle_stickers').delete().eq('id', id)
            if (error) throw error
            setStickers(stickers.filter(s => s.id !== id))
        } catch (error: any) {
            alert('Error deleting: ' + error.message)
        }
    }

    return (
        <div className="container mx-auto p-4 md:p-8 text-black min-h-screen bg-gray-100">
            <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/admin/dashboard')} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl font-bold text-black">Manage Bundle Stickers</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Upload or Edit */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow sticky top-8">

                        {/* HEADER */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                {editingId ? <Edit className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                                {editingId ? 'Edit Sticker' : 'Bulk Upload'}
                            </h2>
                            {editingId && (
                                <button onClick={cancelEditing} className="text-gray-500 hover:bg-gray-100 p-1 rounded-full"><X className="w-5 h-5" /></button>
                            )}
                        </div>

                        {/* EDIT MODE FORM */}
                        {editingId ? (
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full border rounded px-3 py-2" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category</label>
                                    <select value={editCategory} onChange={e => setEditCategory(e.target.value)} className="w-full border rounded px-3 py-2">
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Change Image</label>
                                    <input type="file" accept="image/*" onChange={e => setEditFile(e.target.files?.[0] || null)} className="w-full" />
                                </div>

                                <button type="submit" disabled={uploading} className="w-full bg-blue-500 text-white font-bold py-2 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Sticker'}
                                </button>
                            </form>
                        ) : (
                            /* BULK UPLOAD MODE */
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Default Category</label>
                                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border rounded px-3 py-2">
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <p className="text-xs text-gray-400 mt-1">This applies to new files but can be changed per sticker.</p>
                                </div>

                                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors relative border-gray-300 hover:bg-gray-50`}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={e => e.target.files && addFilesToStage(Array.from(e.target.files))}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        disabled={uploading}
                                    />
                                    <div className="text-gray-500 space-y-2 pointer-events-none">
                                        <Plus className={`w-8 h-8 mx-auto text-gray-400`} />
                                        <p className="font-medium">Click to select or Drop files</p>
                                        <p className="text-xs">Paste images (Ctrl+V) supported</p>
                                        <p className="text-xs text-blue-500">Max 20 images at once</p>
                                    </div>
                                </div>

                                {/* Staging List */}
                                {stagedFiles.length > 0 && (
                                    <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>Selected ({stagedFiles.length}/20)</span>
                                            <button onClick={() => setStagedFiles([])} className="text-red-500 hover:underline">Clear All</button>
                                        </div>
                                        {stagedFiles.map((file) => (
                                            <div key={file.id} className={`flex flex-col gap-2 p-3 rounded border ${file.status === 'error' ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 relative flex-shrink-0">
                                                        <Image src={file.preview} alt="preview" fill className="object-cover rounded" />
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <input
                                                            type="text"
                                                            value={file.name}
                                                            onChange={(e) => updateStagedName(file.id, e.target.value)}
                                                            disabled={uploading}
                                                            className="w-full text-sm border rounded px-2 py-1"
                                                            placeholder="Name"
                                                        />
                                                        <select
                                                            value={file.category}
                                                            onChange={(e) => updateStagedCategory(file.id, e.target.value)}
                                                            className="w-full text-xs border rounded px-2 py-1 text-gray-600"
                                                            disabled={uploading}
                                                        >
                                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {file.status === 'processing' && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                                                        {file.status === 'done' && <span className="text-green-500 text-xs font-bold">Done</span>}
                                                        {file.status === 'pending' && !uploading && (
                                                            <button onClick={() => removeStagedFile(file.id)} className="text-gray-400 hover:text-red-500">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                {file.error && <p className="text-xs text-red-500">{file.error}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Upload Progress & Action */}
                                {uploading && (
                                    <div className="space-y-1">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                                style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-center text-gray-500">Processing {progress.current} of {progress.total}...</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleBulkUpload}
                                    disabled={uploading || stagedFiles.length === 0}
                                    className="w-full bg-[hsl(var(--primary))] text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    {uploading ? 'Processing Batch...' : `Upload ${stagedFiles.length} Sticker${stagedFiles.length !== 1 ? 's' : ''}`}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stickers Grid */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">All Stickers ({stickers.length})</h2>
                            <div className="flex gap-2">
                                {CATEGORIES.map(c => (
                                    <span key={c} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{c}</span>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <p className="text-center text-gray-500 py-8">Loading stickers...</p>
                        ) : stickers.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No stickers found. Upload some!</p>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                {stickers.map(sticker => (
                                    <div key={sticker.id} className="group relative border rounded-lg p-2 hover:shadow-md transition-shadow bg-gray-50 aspect-square flex flex-col items-center justify-center">
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={sticker.image_url}
                                                alt={sticker.name}
                                                fill
                                                className="object-contain p-2"
                                                unoptimized
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 rounded-lg text-white">
                                            <p className="font-bold text-xs text-center px-1">{sticker.name}</p>
                                            <p className="text-[10px] bg-white/20 px-2 py-0.5 rounded">{sticker.category}</p>
                                            <div className="flex gap-2 mt-1">
                                                <button
                                                    onClick={() => startEditing(sticker)}
                                                    className="bg-blue-500 p-2 rounded-full hover:bg-blue-600 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(sticker.id, sticker.image_url)}
                                                    className="bg-red-500 p-2 rounded-full hover:bg-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
