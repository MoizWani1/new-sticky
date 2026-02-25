'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Package, ShoppingBag, Tag, LogOut, GripHorizontal, Image, Mail } from 'lucide-react'

export default function AdminDashboard() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/admin')
            } else {
                setLoading(false)
            }
        }
        checkUser()
    }, [router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/admin')
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black">Loading...</div>

    return (
        <div className="min-h-screen bg-gray-100 text-black p-4 md:p-8">
            <div className="container mx-auto max-w-4xl">
                <div className="flex justify-between items-center mb-12 bg-white p-6 rounded-lg shadow-sm">
                    <div>
                        <h1 className="text-3xl font-bold text-black">Admin Dashboard</h1>
                        <p className="text-gray-500">Welcome back, Admin</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors font-medium"
                    >
                        <LogOut className="w-5 h-5" /> Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Products Card */}
                    <button
                        onClick={() => router.push('/admin/dashboard/products')}
                        className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-4 group border border-transparent hover:border-blue-100"
                    >
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Package className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-1">Manage Products</h2>
                            <p className="text-sm text-gray-500">Add, Edit, Stock & Sales</p>
                        </div>
                    </button>

                    {/* Orders Card */}
                    <button
                        onClick={() => router.push('/admin/dashboard/orders')}
                        className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-4 group border border-transparent hover:border-orange-100"
                    >
                        <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ShoppingBag className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-1">Manage Orders</h2>
                            <p className="text-sm text-gray-500">View & Update Status</p>
                        </div>
                    </button>

                    {/* Vouchers Card */}
                    <button
                        onClick={() => router.push('/admin/dashboard/vouchers')}
                        className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-4 group border border-transparent hover:border-green-100"
                    >
                        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Tag className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-1">Manage Vouchers</h2>
                            <p className="text-sm text-gray-500">Create & Delete Codes</p>
                        </div>
                    </button>

                    {/* Bundle Stickers Card */}
                    <button
                        onClick={() => router.push('/admin/dashboard/bundle-stickers')}
                        className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-4 group border border-transparent hover:border-purple-100"
                    >
                        <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <GripHorizontal className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-1">Bundle Stickers</h2>
                            <p className="text-sm text-gray-500">Upload & Manage Stickers</p>
                        </div>
                    </button>

                    {/* Sticky Wall Card */}
                    {/* Sticky Wall Card */}
                    <button
                        onClick={() => router.push('/admin/dashboard/sticky-wall')}
                        className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-4 group border border-transparent hover:border-yellow-100"
                    >
                        <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Image className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-1">Sticky Wall</h2>
                            <p className="text-sm text-gray-500">Manage Wall Posts</p>
                        </div>
                    </button>

                    {/* Newsletter Card */}
                    <button
                        onClick={() => router.push('/admin/newsletter')}
                        className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-4 group border border-transparent hover:border-pink-100"
                    >
                        <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Mail className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-1">Newsletter</h2>
                            <p className="text-sm text-gray-500">View Subscribers</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}
