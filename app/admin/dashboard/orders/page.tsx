'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Trash2, ArrowLeft, Tag, CreditCard, Banknote, CheckCircle, XCircle } from 'lucide-react'
import { Order } from '@/types'

export default function OrdersPage() {
    const router = useRouter()
    const [orders, setOrders] = useState<Order[]>([])

    const cleanupRejectedOrders = useCallback(async (currentOrders: Order[]) => {
        const twoDaysAgo = new Date()
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

        const ordersToDelete = currentOrders.filter(o =>
            o.status === 'Rejected' &&
            o.rejected_at &&
            new Date(o.rejected_at) < twoDaysAgo
        )

        for (const order of ordersToDelete) {
            await supabase.from('orders').delete().eq('id', order.id)
        }

        if (ordersToDelete.length > 0) {
            const { data: refreshedOrders } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
            if (refreshedOrders) setOrders(refreshedOrders)
        }
    }, [])

    const fetchOrders = useCallback(async () => {
        const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
        if (data) {
            setOrders(data)
            cleanupRejectedOrders(data)
        }
    }, [cleanupRejectedOrders])

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/admin')
            } else {
                fetchOrders()
            }
        }
        checkUser()
    }, [router, fetchOrders])

    const updateOrderStatus = async (id: string, status: string) => {
        setOrders(currentOrders =>
            currentOrders.map(o => o.id === id ? { ...o, status } : o)
        )

        const { error } = await supabase.from('orders').update({ status }).eq('id', id)

        if (error) {
            alert('Failed to update status: ' + error.message)
            fetchOrders()
        }
    }

    const updatePaymentStatus = async (id: string, payment_status: string) => {
        // Optimistic update
        setOrders(current => current.map(o => o.id === id ? { ...o, payment_status } : o))

        const { error } = await supabase.from('orders').update({ payment_status }).eq('id', id)

        if (error) {
            alert('Failed to update payment status: ' + error.message)
            fetchOrders()
        }
    }

    const deleteOrder = async (id: string) => {
        if (!confirm('Are you sure you want to delete this order?')) return

        setOrders(current => current.filter(o => o.id !== id))
        const { error } = await supabase.from('orders').delete().eq('id', id)

        if (error) {
            alert('Error deleting order: ' + error.message)
            fetchOrders()
        }
    }

    const rejectOrder = async (id: string) => {
        if (!confirm('Reject this order? It will be auto-deleted in 2 days.')) return

        const updates = {
            status: 'Rejected',
            rejected_at: new Date().toISOString()
        }

        setOrders(current => current.map(o => o.id === id ? { ...o, ...updates } : o))

        const { error } = await supabase.from('orders').update(updates).eq('id', id)

        if (error) {
            alert('Error rejecting order: ' + error.message)
            fetchOrders()
        }
    }

    return (
        <div className="container mx-auto p-4 md:p-8 text-black min-h-screen bg-gray-100">
            <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/admin/dashboard')} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl font-bold text-black">Manage Orders</h1>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow text-black max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">Recent Orders ({orders.length})</h2>
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order.id} className="border border-gray-200 p-4 rounded-lg bg-gray-50 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-bold text-lg">{order.customer_name}</p>
                                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                                    <p className="text-sm text-gray-600 mt-1">{order.customer_phone}</p>
                                    <p className="text-sm text-gray-500">{order.customer_address}</p>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <p className="font-bold text-xl text-[hsl(var(--primary))]">Rs. {order.total_amount}</p>
                                    {order.discount_total > 0 && <p className="text-xs text-green-600">Saved: Rs. {order.discount_total}</p>}

                                    {/* Payment Method Badge */}
                                    <div className={`mt-2 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border ${order.payment_method === 'online'
                                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                                        : 'bg-gray-100 text-gray-600 border-gray-300'
                                        }`}>
                                        {order.payment_method === 'online' ? <CreditCard className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}
                                        {order.payment_method === 'online' ? 'PAID ONLINE' : 'COD'}
                                    </div>

                                    {/* Payment Status (Only for Online) */}
                                    {order.payment_method === 'online' && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-500">Payment:</span>
                                            {order.payment_status === 'paid' ? (
                                                <button
                                                    onClick={() => updatePaymentStatus(order.id, 'pending')}
                                                    className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded border border-green-200 hover:bg-green-200"
                                                    title="Click to mark as pending"
                                                >
                                                    <CheckCircle className="w-3 h-3" /> CONFIRMED
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => updatePaymentStatus(order.id, 'paid')}
                                                    className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded border border-yellow-200 hover:bg-yellow-200"
                                                    title="Click to confirm payment"
                                                >
                                                    <XCircle className="w-3 h-3" /> PENDING
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4">
                                {(() => {
                                    let items = order.order_items; // Changed from items to order_items
                                    if (typeof items === 'string') {
                                        try {
                                            items = JSON.parse(items);
                                        } catch (e) {
                                            items = [];
                                        }
                                    }
                                    if (!Array.isArray(items)) return null;

                                    return items.map((item: any, i: number) => (
                                        <div key={i} className="text-sm text-gray-700 ml-4 list-disc display-list-item mb-2">
                                            <span>{item.quantity}x {item.name}</span>
                                            {item.selectedVariants && (
                                                <span className="text-xs text-gray-500 ml-2 bg-gray-100 px-1 rounded">
                                                    {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                                </span>
                                            )}
                                            {/* Display Bundle Items if present */}
                                            {item.bundleItems && item.bundleItems.length > 0 && (
                                                <div className="mt-1 ml-4 grid grid-cols-6 gap-2">
                                                    {item.bundleItems.map((bItem: any, bIdx: number) => (
                                                        <div key={bIdx} className="relative group">
                                                            <img
                                                                src={bItem.image_url}
                                                                title={bItem.name}
                                                                alt={bItem.name}
                                                                className="w-8 h-8 object-contain border rounded bg-white"
                                                            />
                                                            <span className="sr-only">{bItem.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ));
                                })()}
                                {order.applied_offers && (
                                    <div className="flex gap-2 flex-wrap mt-2">
                                        {order.applied_offers.split(',').map((offer, i) => (
                                            <span key={i} className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold border border-yellow-200">
                                                <Tag className="w-3 h-3" /> {offer.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between border-t pt-2">
                                <div className="flex items-center">
                                    <p className="text-sm font-bold mr-2">Status:</p>
                                    <select
                                        value={order.status}
                                        onChange={(e) => {
                                            if (e.target.value === 'Rejected') {
                                                rejectOrder(order.id)
                                            } else {
                                                updateOrderStatus(order.id, e.target.value)
                                            }
                                        }}
                                        className={`border rounded px-3 py-1 font-medium text-sm ${order.status === 'Pending' ? 'text-orange-500 bg-orange-50 border-orange-200' :
                                            order.status === 'Delivered' ? 'text-green-500 bg-green-50 border-green-200' :
                                                order.status === 'Rejected' ? 'text-red-700 bg-red-100 border-red-300' :
                                                    'text-red-500 bg-red-50 border-red-200'
                                            }`}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => deleteOrder(order.id)}
                                    className="text-red-500 hover:bg-red-50 p-2 rounded flex items-center gap-1 text-sm"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {orders.length === 0 && <p className="text-center text-gray-500">No orders found.</p>}
                </div>
            </div>
        </div>
    )
}
