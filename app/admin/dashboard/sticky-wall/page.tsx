'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Trash2, Edit2, Save, X, ArrowLeft, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

type StickyPost = {
    id: string
    created_at: string
    user_name: string
    image_url: string
    voucher_code: string | null
    product_id: string | null
    review: string | null
}

export default function AdminStickyWall() {
    const router = useRouter()
    const [posts, setPosts] = useState<StickyPost[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        fetchPosts()
    }, [])

    const fetchPosts = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('sticky_wall_posts')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching posts:', error)
            alert('Failed to fetch posts')
        } else {
            setPosts(data || [])
        }
        setLoading(false)
    }

    const startEditing = (post: StickyPost) => {
        setEditingId(post.id)
        setEditName(post.user_name)
    }

    const cancelEditing = () => {
        setEditingId(null)
        setEditName('')
    }

    const saveName = async (id: string) => {
        if (!editName.trim()) return

        const { error } = await supabase
            .from('sticky_wall_posts')
            .update({ user_name: editName })
            .eq('id', id)

        if (error) {
            console.error('Error updating name:', error)
            alert('Failed to update name')
        } else {
            setPosts(posts.map(p => p.id === id ? { ...p, user_name: editName } : p))
            setEditingId(null)
        }
    }

    const deletePost = async (id: string, imageUrl: string) => {
        if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return

        setDeletingId(id)

        try {
            // Call our new API route
            const response = await fetch('/api/sticky-wall/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, imageUrl }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete post')
            }

            setPosts(posts.filter(p => p.id !== id))
            alert('Post deleted successfully!')
        } catch (error: any) {
            console.error('Error deleting post:', error)
            alert('Failed to delete post: ' + error.message)
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 text-black p-4 md:p-8">
            <div className="container mx-auto max-w-6xl">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl font-bold">Manage Sticky Wall</h1>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-600">Image</th>
                                    <th className="p-4 font-semibold text-gray-600">User Name</th>
                                    <th className="p-4 font-semibold text-gray-600">Voucher</th>
                                    <th className="p-4 font-semibold text-gray-600">Date</th>
                                    <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                            Loading posts...
                                        </td>
                                    </tr>
                                ) : posts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">
                                            No posts found on the Sticky Wall.
                                        </td>
                                    </tr>
                                ) : (
                                    posts.map((post) => (
                                        <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                                    <Image
                                                        src={post.image_url}
                                                        alt={post.user_name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {editingId === post.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={editName}
                                                            onChange={(e) => setEditName(e.target.value)}
                                                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-yellow-500 w-full max-w-[150px]"
                                                            autoFocus
                                                        />
                                                        <button
                                                            onClick={() => saveName(post.id)}
                                                            className="text-green-600 hover:text-green-700"
                                                            title="Save"
                                                        >
                                                            <Save className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={cancelEditing}
                                                            className="text-gray-400 hover:text-gray-600"
                                                            title="Cancel"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="font-medium text-gray-900">{post.user_name}</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {post.voucher_code ? (
                                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-mono">
                                                        {post.voucher_code}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => startEditing(post)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Name"
                                                        disabled={editingId === post.id}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deletePost(post.id, post.image_url)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Post"
                                                        disabled={deletingId === post.id}
                                                    >
                                                        {deletingId === post.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
