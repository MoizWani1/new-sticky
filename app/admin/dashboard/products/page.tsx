'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Trash2, ArrowLeft, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { Product } from '@/types'

export default function ProductsPage() {
    const router = useRouter()
    const [products, setProducts] = useState<Product[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [isCompressing, setIsCompressing] = useState<{ [key: number]: boolean }>({})
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)
    const [compressionStats, setCompressionStats] = useState<{ [key: number]: string }>({})

    const processImage = async (file: File): Promise<File> => {
        // Just compress the image directly
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 2000,
            useWebWorker: true,
            fileType: 'image/webp' // Changed from PNG to WebP for better compression
        }

        try {
            const compressedFile = await imageCompression(file, options)
            return compressedFile
        } catch (error) {
            console.error("Compression failed", error)
            return file
        }
    }

    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        salePrice: '',
        category: '',
        type: '',
        stockStatus: 'in_stock',
        isBestSeller: false,
        variants: [] as any[], // Using any[] to avoid complex nested type issues in state for now, or cast properly
        images: [] as (File | string)[],
        packStickers: [] as { id?: string, file?: File, name: string, image_url?: string }[],
        stickerPrice: '35',
    })

    const fetchProducts = useCallback(async () => {
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
        if (data) setProducts(data)
    }, [])

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/admin')
            } else {
                fetchProducts()
            }
        }
        checkUser()
    }, [router, fetchProducts])

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = products.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(products.length / itemsPerPage)

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

    const startEditing = (product: Product) => {
        setEditingId(product.id)
        setNewProduct({
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            salePrice: product.sale_price ? product.sale_price.toString() : '',
            category: product.category || 'Pop Culture',
            type: product.type || 'Sticker',
            stockStatus: product.stock_status || 'in_stock',
            isBestSeller: product.is_best_seller || false,
            variants: product.variants || [],
            images: (product.images && product.images.length > 0)
                ? product.images
                : (product.image_url ? [product.image_url] : []),
            packStickers: product.pack_stickers || [],
            stickerPrice: product.sticker_price ? product.sticker_price.toString() : '35',
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const cancelEditing = () => {
        setEditingId(null)
        setNewProduct({
            name: '', description: '', price: '', salePrice: '',
            category: 'Pop Culture', type: 'Sticker', stockStatus: 'in_stock',
            isBestSeller: false, variants: [], images: [], packStickers: [], stickerPrice: '35',
        })
    }

    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })

    const handleAddOrUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault()
        setUploading(true)
        setUploadProgress({ current: 0, total: 0 })

        try {
            const uploadedUrls: string[] = []
            const imagesToProcess = newProduct.images

            // Calculate total items to process (only Blobs need processing/uploading)
            const filesToProcess = imagesToProcess.filter(item => item instanceof Blob).length
            // Existing strings count as "already done" effectively, but for the user it's clearer 
            // to show progress of the *active* operation. 
            // Let's count total items in the array to show overall progress "Processing image 1 of 3..."
            setUploadProgress({ current: 0, total: imagesToProcess.length })

            let processedCount = 0

            for (const item of imagesToProcess) {
                processedCount++
                setUploadProgress(prev => ({ ...prev, current: processedCount }))

                if (typeof item === 'string') {
                    uploadedUrls.push(item)
                } else if (item instanceof Blob) {
                    let file = item as File

                    // Process Image (AI or Manual + Compression)
                    file = await processImage(file)

                    const fileExt = file.name ? file.name.split('.').pop() : 'png'
                    const fileName = `${Math.random()}.${fileExt}`
                    const filePath = `${fileName}`

                    const { error: uploadError } = await supabase.storage
                        .from('product-images')
                        .upload(filePath, file)

                    if (uploadError) throw uploadError

                    const { data: { publicUrl } } = supabase.storage
                        .from('product-images')
                        .getPublicUrl(filePath)

                    uploadedUrls.push(publicUrl)
                }
            }

            const mainImageUrl = uploadedUrls.length > 0 ? uploadedUrls[0] : null
            const imagesArray = uploadedUrls.length > 0 ? uploadedUrls : null

            // Upload pack stickers if any
            const processedPackStickers = []
            if (newProduct.type === 'Pack') {
                for (const sticker of newProduct.packStickers) {
                    if (sticker.file) {
                        const fileExt = sticker.file.name ? sticker.file.name.split('.').pop() : 'png'
                        const fileName = `pack-sticker-${Math.random()}.${fileExt}`

                        const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1000, useWebWorker: true }
                        const compressedSticker = await imageCompression(sticker.file, options).catch(() => sticker.file)

                        if (!compressedSticker) continue; // TS guard

                        const { error: uploadError } = await supabase.storage
                            .from('product-images')
                            .upload(fileName, compressedSticker)

                        if (!uploadError) {
                            const { data: { publicUrl } } = supabase.storage
                                .from('product-images')
                                .getPublicUrl(fileName)

                            processedPackStickers.push({
                                id: sticker.id || Math.random().toString(36).substr(2, 9),
                                name: sticker.name || 'Sticker',
                                image_url: publicUrl
                            })
                        }
                    } else if (sticker.image_url) {
                        processedPackStickers.push({
                            id: sticker.id || Math.random().toString(36).substr(2, 9),
                            name: sticker.name || 'Sticker',
                            image_url: sticker.image_url
                        })
                    }
                }
            }

            const productData = {
                name: newProduct.name,
                description: newProduct.description,
                price: parseFloat(newProduct.price),
                sale_price: newProduct.salePrice ? parseFloat(newProduct.salePrice) : null,
                category: newProduct.category,
                type: newProduct.type,
                stock_status: newProduct.stockStatus,
                is_best_seller: newProduct.isBestSeller,
                variants: newProduct.variants,
                pack_stickers: newProduct.type === 'Pack' ? processedPackStickers : null,
                sticker_price: newProduct.type === 'Pack' ? parseFloat(newProduct.stickerPrice) : null,
                image_url: mainImageUrl,
                images: imagesArray
            }

            if (editingId) {
                const { error } = await supabase.from('products').update(productData).eq('id', editingId)
                if (error) throw error
                alert('Product updated successfully!')
            } else {
                const { error } = await supabase.from('products').insert([productData])
                if (error) throw error
                alert('Product added successfully!')
            }

            cancelEditing()
            fetchProducts()
        } catch (error) {
            if (error instanceof Error) {
                alert('Error saving product: ' + error.message)
            } else {
                alert('An unknown error occurred saving the product.')
            }
        } finally {
            setUploading(false)
            setUploadProgress({ current: 0, total: 0 })
        }
    }

    const handleDeleteProduct = async (product: Product) => {
        if (!confirm('Are you sure?')) return

        try {
            // Collect all image paths to delete
            const pathsToDelete: string[] = []

            if (product.image_url) {
                const path = product.image_url.split('/product-images/').pop()
                if (path) pathsToDelete.push(path)
            }

            if (product.images && product.images.length > 0) {
                product.images.forEach(url => {
                    const path = url.split('/product-images/').pop()
                    if (path) pathsToDelete.push(path)
                })
            }

            if (pathsToDelete.length > 0) {
                const { error: storageError } = await supabase.storage
                    .from('product-images')
                    .remove(pathsToDelete)

                if (storageError) {
                    console.error('Error deleting images:', storageError)
                    // We continue with product deletion even if image deletion fails, 
                    // but logging it is important. 
                }
            }

            const { error } = await supabase.from('products').delete().eq('id', product.id)
            if (error) alert('Error deleting: ' + error.message)
            else fetchProducts()

        } catch (err) {
            console.error('Unexpected error during deletion:', err)
            alert('An unexpected error occurred.')
        }
    }

    const updateProductStock = async (id: string, stock_status: string) => {
        setProducts(currentProducts =>
            currentProducts.map(p => p.id === id ? { ...p, stock_status } : p)
        )
        const { error } = await supabase.from('products').update({ stock_status }).eq('id', id)
        if (error) {
            fetchProducts()
            alert('Error updating stock: ' + error.message)
        }
    }

    return (
        <div className="container mx-auto p-4 md:p-8 text-black min-h-screen bg-gray-100">
            <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/admin/dashboard')} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl font-bold text-black">Manage Products</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow text-black">
                        <form onSubmit={handleAddOrUpdateProduct} className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-700 text-xl">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                                {editingId && (
                                    <button type="button" onClick={cancelEditing} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                        Cancel
                                    </button>
                                )}
                            </div>

                            <input
                                type="text"
                                placeholder="Product Name"
                                required
                                className="w-full border border-zinc-300 p-2 rounded"
                                value={newProduct.name}
                                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                            />

                            <textarea
                                placeholder="Description"
                                rows={3}
                                className="w-full border border-zinc-300 p-2 rounded"
                                value={newProduct.description}
                                onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                            />

                            <div className="flex gap-2">
                                <div className="w-1/2">
                                    <label className="block text-xs font-bold mb-1 text-gray-500">Price (Rs)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full border border-zinc-300 p-2 rounded"
                                        value={newProduct.price}
                                        onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-xs font-bold mb-1 text-green-600">Sale (Rs)</label>
                                    <input
                                        type="number"
                                        className="w-full border border-green-200 bg-green-50 p-2 rounded"
                                        value={newProduct.salePrice}
                                        onChange={e => setNewProduct({ ...newProduct, salePrice: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <select
                                    className="w-full border border-zinc-300 p-2 rounded"
                                    value={newProduct.category}
                                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                >
                                    <option value="" disabled>Select Theme</option>
                                    <option value="Ramadan Kareem">Ramadan Kareem</option>
                                    <option value="Girly">Girly</option>
                                    <option value="Pop Culture">Pop Culture</option>
                                    <option value="K-pop">K-pop</option>
                                    <option value="Best for Laptops">Best for Laptops</option>
                                    <option value="Best for Phones">Best for Phones</option>
                                    <option value="Others">Others</option>
                                </select>
                                <select
                                    className="w-full border border-zinc-300 p-2 rounded"
                                    value={newProduct.type}
                                    onChange={e => {
                                        const type = e.target.value
                                        let updates: any = { type }

                                        if (type === 'Sticker') {
                                            updates = {
                                                ...updates,
                                                price: '449',
                                                salePrice: '349',
                                                description: `Each sticker is made with a strong adhesive backing to ensure long-lasting performance on multiple surfaces.

Product Details
• Sticker Size: Approx. 5–7 cm each
• Finish: Smooth, high-quality print
• Waterproof and scratch-resistant

Quality Check
Every single sticker is carefully inspected before packing to ensure perfect print quality and finishing.

Delivery Time
Estimated delivery: 5–6 working days

Perfect For
Laptops, mobile phones, bottles, notebooks, bikes, helmets, and more.`,
                                                variants: [
                                                    {
                                                        name: 'Packs',
                                                        options: [
                                                            { value: '10 Pcs', price: 349 },
                                                            { value: '20 Pcs', price: 499 },
                                                            { value: '30 Pcs', price: 619 }
                                                        ]
                                                    }
                                                ]
                                            }
                                        }

                                        setNewProduct({ ...newProduct, ...updates })
                                    }}
                                >
                                    <option value="" disabled>Select Type</option>
                                    <option value="Sticker">Sticker</option>
                                    <option value="Pack">Pack</option>
                                    <option value="Poster">Poster</option>
                                    <option value="Helmet">Helmet</option>
                                    <option value="Merchandise">Merchandise</option>
                                    <option value="Other">Other</option>
                                </select>
                                <select
                                    className="w-full border border-zinc-300 p-2 rounded"
                                    value={newProduct.stockStatus}
                                    onChange={e => setNewProduct({ ...newProduct, stockStatus: e.target.value })}
                                >
                                    <option value="in_stock">In Stock</option>
                                    <option value="low_stock">Low Stock</option>
                                    <option value="out_of_stock">Out of Stock</option>
                                </select>
                            </div>

                            {/* Variants Section */}
                            <div className="border p-4 rounded bg-gray-50 space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold">Variants</label>
                                    <button
                                        type="button"
                                        onClick={() => setNewProduct(p => ({ ...p, variants: [...p.variants, { name: '', options: [] }] }))}
                                        className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded"
                                    >
                                        + Add Group
                                    </button>
                                </div>
                                {newProduct.variants.map((variant, vIndex) => (
                                    <div key={vIndex} className="border border-gray-200 p-2 rounded bg-white">
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                placeholder="Group Name (e.g. Size)"
                                                value={variant.name}
                                                onChange={e => {
                                                    const updated = [...newProduct.variants];
                                                    updated[vIndex].name = e.target.value;
                                                    setNewProduct({ ...newProduct, variants: updated });
                                                }}
                                                className="w-full text-xs border p-1 rounded"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = [...newProduct.variants];
                                                    updated.splice(vIndex, 1);
                                                    setNewProduct({ ...newProduct, variants: updated });
                                                }}
                                                className="text-red-500 hover:bg-red-50 p-1 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="space-y-2 pl-4 border-l-2 border-gray-100">
                                            {variant.options.map((option: any, oIndex: number) => (
                                                <div key={oIndex} className="flex gap-2 items-center">
                                                    <input
                                                        type="text"
                                                        placeholder="Value (e.g. Small)"
                                                        value={option.value}
                                                        onChange={e => {
                                                            const updated = [...newProduct.variants];
                                                            updated[vIndex].options[oIndex].value = e.target.value;
                                                            setNewProduct({ ...newProduct, variants: updated });
                                                        }}
                                                        className="flex-1 text-xs border p-1 rounded"
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Price (Optional)"
                                                        value={option.price || ''}
                                                        onChange={e => {
                                                            const updated = [...newProduct.variants];
                                                            updated[vIndex].options[oIndex].price = e.target.value ? parseFloat(e.target.value) : undefined;
                                                            setNewProduct({ ...newProduct, variants: updated });
                                                        }}
                                                        className="w-20 text-xs border p-1 rounded"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updated = [...newProduct.variants];
                                                            updated[vIndex].options.splice(oIndex, 1);
                                                            setNewProduct({ ...newProduct, variants: updated });
                                                        }}
                                                        className="text-red-400"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = [...newProduct.variants];
                                                    updated[vIndex].options.push({ value: '', price: undefined });
                                                    setNewProduct({ ...newProduct, variants: updated });
                                                }}
                                                className="text-xs text-blue-500 hover:underline"
                                            >
                                                + Add Option
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 border p-2 rounded bg-gray-50">
                                <input
                                    type="checkbox"
                                    id="bestSeller"
                                    checked={newProduct.isBestSeller}
                                    onChange={e => setNewProduct({ ...newProduct, isBestSeller: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300"
                                />
                                <label htmlFor="bestSeller" className="font-medium text-sm">Add to Best Sellers</label>
                            </div>

                            {newProduct.type === 'Pack' && (
                                <div className="border p-4 rounded bg-blue-50 space-y-4">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-bold text-blue-800">Pack Stickers (Themes)</label>
                                            <button
                                                type="button"
                                                onClick={() => setNewProduct(p => ({ ...p, packStickers: [...p.packStickers, { name: '' }] }))}
                                                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                            >
                                                + Add Sticker to Pack
                                            </button>
                                        </div>
                                        <div className="w-1/2 md:w-1/3">
                                            <label className="block text-xs font-bold mb-1 text-blue-800">Single Sticker Price (Rs)</label>
                                            <input
                                                type="number"
                                                className="w-full border border-blue-200 bg-white p-2 rounded text-sm"
                                                value={newProduct.stickerPrice}
                                                onChange={e => setNewProduct({ ...newProduct, stickerPrice: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {newProduct.packStickers.map((sticker, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-white border p-2 rounded flex flex-col gap-2 relative group focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
                                                tabIndex={0}
                                                onPaste={(e) => {
                                                    const items = e.clipboardData?.items;
                                                    if (!items) return;
                                                    for (let i = 0; i < items.length; i++) {
                                                        if (items[i].type.indexOf('image') !== -1) {
                                                            const file = items[i].getAsFile();
                                                            if (file) {
                                                                const updated = [...newProduct.packStickers];
                                                                updated[idx].file = file;
                                                                if (!updated[idx].name) {
                                                                    updated[idx].name = `Sticker ${idx + 1}`;
                                                                }
                                                                setNewProduct({ ...newProduct, packStickers: updated });
                                                                e.preventDefault();
                                                                break;
                                                            }
                                                        }
                                                    }
                                                }}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = [...newProduct.packStickers];
                                                        updated.splice(idx, 1);
                                                        setNewProduct({ ...newProduct, packStickers: updated });
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>

                                                <div className="aspect-square bg-gray-100 rounded border border-dashed flex items-center justify-center relative overflow-hidden">
                                                    {(sticker.file || sticker.image_url) ? (
                                                        <Image
                                                            src={sticker.file ? URL.createObjectURL(sticker.file) : sticker.image_url!}
                                                            alt="preview"
                                                            fill
                                                            className="object-contain p-1"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <span className="text-xs text-gray-400">No Image</span>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        title="Upload"
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                const updated = [...newProduct.packStickers];
                                                                updated[idx].file = e.target.files[0];
                                                                setNewProduct({ ...newProduct, packStickers: updated });
                                                            }
                                                        }}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                    />
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Sticker Name"
                                                    value={sticker.name}
                                                    onChange={e => {
                                                        const updated = [...newProduct.packStickers];
                                                        updated[idx].name = e.target.value;
                                                        setNewProduct({ ...newProduct, packStickers: updated });
                                                    }}
                                                    className="w-full text-xs p-1 border rounded"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-blue-600 mt-2">
                                        These stickers will be shown as choices when a customer selects &quot;Choose stickers in pack&quot;.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-4 border p-4 rounded bg-gray-50">
                                <label className="block text-sm font-bold">Product Images (Max 3)</label>
                                <p className="text-[10px] text-gray-400 mb-2">
                                    Uploads image (automatically compressed).
                                </p>
                                <div className="flex flex-col gap-3">
                                    {[0, 1, 2].map((index) => (
                                        <div
                                            key={index}
                                            className="text-sm p-3 border rounded-lg bg-white/50 hover:bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all group"
                                            tabIndex={0}
                                            onPaste={async (e) => {
                                                const items = e.clipboardData?.items;
                                                if (!items) return;
                                                for (let i = 0; i < items.length; i++) {
                                                    if (items[i].type.indexOf('image') !== -1) {
                                                        const file = items[i].getAsFile();
                                                        if (file) {
                                                            e.preventDefault();
                                                            setIsCompressing(p => ({ ...p, [index]: true }))
                                                            const initialUpdated = [...newProduct.images]
                                                            initialUpdated[index] = file
                                                            setNewProduct(p => ({ ...p, images: initialUpdated }))

                                                            try {
                                                                const options = { maxSizeMB: 1, maxWidthOrHeight: 2000, useWebWorker: true, fileType: 'image/webp', initialQuality: 0.9 }
                                                                const compressed = await imageCompression(file, options)
                                                                const updated = [...newProduct.images]
                                                                updated[index] = compressed
                                                                setNewProduct(p => ({ ...p, images: updated }))
                                                                const saved = ((file.size - compressed.size) / 1024).toFixed(0)
                                                                setCompressionStats(p => ({ ...p, [index]: `Saved ${saved}KB` }))
                                                            } catch (err) {
                                                                console.error(err)
                                                                const updated = [...newProduct.images]
                                                                updated[index] = file
                                                                setNewProduct(p => ({ ...p, images: updated }))
                                                            } finally {
                                                                setIsCompressing(p => ({ ...p, [index]: false }))
                                                            }
                                                            break;
                                                        }
                                                    }
                                                }
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-500 w-6">{index + 1}.</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files ? e.target.files[0] : null
                                                        if (!file) {
                                                            const updated = [...newProduct.images]; delete updated[index];
                                                            setNewProduct(p => ({ ...p, images: updated }))
                                                            return
                                                        }

                                                        // Set file immediately to avoid race condition
                                                        setIsCompressing(p => ({ ...p, [index]: true }))
                                                        const initialUpdated = [...newProduct.images]
                                                        initialUpdated[index] = file
                                                        setNewProduct(p => ({ ...p, images: initialUpdated }))

                                                        try {
                                                            const options = { maxSizeMB: 1, maxWidthOrHeight: 2000, useWebWorker: true, fileType: 'image/webp', initialQuality: 0.9 }
                                                            const compressed = await imageCompression(file, options)
                                                            const updated = [...newProduct.images]
                                                            updated[index] = compressed
                                                            setNewProduct(p => ({ ...p, images: updated }))
                                                            const saved = ((file.size - compressed.size) / 1024).toFixed(0)
                                                            setCompressionStats(p => ({ ...p, [index]: `Saved ${saved}KB` }))
                                                        } catch (err) {
                                                            console.error(err)
                                                            // Keep original file if compression fails
                                                            const updated = [...newProduct.images]
                                                            updated[index] = file
                                                            setNewProduct(p => ({ ...p, images: updated }))
                                                        } finally {
                                                            setIsCompressing(p => ({ ...p, [index]: false }))
                                                        }
                                                    }}
                                                    className="w-full flex-1 text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                                                />
                                                {newProduct.images[index] && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updated = [...newProduct.images];
                                                            updated.splice(index, 1);
                                                            setNewProduct(p => ({ ...p, images: updated }))

                                                            const statsUpdated = { ...compressionStats };
                                                            delete statsUpdated[index];
                                                            setCompressionStats(statsUpdated);
                                                        }}
                                                        className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                                        title="Remove Image"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            {typeof newProduct.images[index] === 'string' && (
                                                <div className="ml-8 mt-2 flex items-center gap-2">
                                                    <img src={newProduct.images[index] as string} alt="Preview" className="w-10 h-10 object-cover rounded border bg-white" />
                                                    <p className="text-[10px] text-gray-500 truncate">Current: ...{(newProduct.images[index] as string).slice(-20)}</p>
                                                </div>
                                            )}
                                            {newProduct.images[index] instanceof Blob && (
                                                <div className="ml-8 mt-2 flex items-center gap-2">
                                                    <img src={URL.createObjectURL(newProduct.images[index] as Blob)} alt="Preview" className="w-10 h-10 object-cover rounded border bg-white" />
                                                    <p className="text-[10px] text-gray-500 truncate">New Upload</p>
                                                </div>
                                            )}
                                            {isCompressing[index] && <p className="text-[10px] text-blue-500 ml-8">Compressing...</p>}
                                            {compressionStats[index] && <p className="text-[10px] text-green-600 ml-8">{compressionStats[index]}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Adding Progress Bar UI before the submit button */}
                            {uploading && uploadProgress.total > 0 && (
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-blue-600">Processing & Uploading...</span>
                                        <span className="text-gray-500">{uploadProgress.current} / {uploadProgress.total}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                                            style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={uploading || Object.values(isCompressing).some(Boolean)}
                                className={`text-white px-4 py-3 rounded disabled:opacity-50 w-full font-bold transition-all shadow-lg ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black hover:bg-gray-800'
                                    }`}
                            >
                                {uploading ? 'Processing...' : (Object.values(isCompressing).some(Boolean) ? 'Compressing Images...' : (editingId ? 'Update Product' : 'Add Product'))}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow text-black">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Product List ({products.length})</h2>

                            {/* Items Per Page Selector */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Show:</span>
                                <select
                                    className="border rounded p-1 text-sm bg-gray-50"
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value))
                                        setCurrentPage(1)
                                    }}
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {currentItems.map(p => (
                                <div key={p.id} className="flex items-center justify-between border p-3 rounded hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                            {p.image_url ? (
                                                <Image src={p.image_url} alt={p.name} width={64} height={64} className="w-full h-full object-cover" unoptimized />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Img</div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold">{p.name}</p>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span className={p.sale_price ? 'line-through' : ''}>Rs. {p.price}</span>
                                                {p.sale_price && <span className="text-green-600 font-bold">Rs. {p.sale_price}</span>}
                                                {p.sale_price && <span className="text-[10px] bg-green-100 text-green-800 px-1 rounded">SALE</span>}
                                            </div>
                                            <div className="flex gap-2 mt-1 text-xs text-gray-400">
                                                <span>{p.category}</span>
                                                <span>•</span>
                                                <span>{p.type}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={p.stock_status || 'in_stock'}
                                                onChange={(e) => updateProductStock(p.id, e.target.value)}
                                                className={`text-xs border rounded p-1 font-medium ${p.stock_status === 'out_of_stock' ? 'text-red-600 bg-red-50' :
                                                    p.stock_status === 'low_stock' ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50'
                                                    }`}
                                            >
                                                <option value="in_stock">In Stock</option>
                                                <option value="low_stock">Low Stock</option>
                                                <option value="out_of_stock">Out of Stock</option>
                                            </select>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => startEditing(p)} className="text-blue-500 hover:bg-blue-50 px-3 py-1 rounded text-xs font-bold border border-blue-100">
                                                EDIT
                                            </button>
                                            <button onClick={() => handleDeleteProduct(p)} className="text-red-500 hover:bg-red-50 px-2 py-1 rounded">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {products.length > 0 && (
                            <div className="flex justify-between items-center mt-6 pt-4 border-t">
                                <span className="text-sm text-gray-500">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, products.length)} of {products.length}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm font-bold px-2">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                        {products.length === 0 && <p className="text-center text-gray-500">No products found.</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}
