'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Trash2, ArrowLeft, Tag } from 'lucide-react'
import { Voucher } from '@/types'

export default function VouchersPage() {
    const router = useRouter()
    const [vouchers, setVouchers] = useState<Voucher[]>([])
    const [newVoucher, setNewVoucher] = useState({ code: '', discount_amount: '', discount_type: 'fixed', is_active: true })

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/admin')
            } else {
                fetchVouchers()
            }
        }
        checkUser()
    }, [router])

    const fetchVouchers = async () => {
        const { data } = await supabase.from('vouchers').select('*').order('created_at', { ascending: false })
        if (data) setVouchers(data)
    }

    const deleteVoucher = async (id: string) => {
        if (!confirm('Delete voucher?')) return
        await supabase.from('vouchers').delete().eq('id', id)
        fetchVouchers()
    }

    const handleAddVoucher = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newVoucher.code || !newVoucher.discount_amount) return

        const { error } = await supabase.from('vouchers').insert([{
            code: newVoucher.code.toUpperCase(),
            discount_amount: parseFloat(newVoucher.discount_amount),
            discount_type: newVoucher.discount_type,
            is_active: newVoucher.is_active
        }])

        if (error) alert('Error adding voucher: ' + error.message)
        else {
            alert('Voucher added!')
            setNewVoucher({ code: '', discount_amount: '', discount_type: 'fixed', is_active: true })
            fetchVouchers()
        }
    }

    return (
        <div className="container mx-auto p-4 md:p-8 text-black min-h-screen bg-gray-100">
            <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/admin/dashboard')} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl font-bold text-black">Manage Vouchers</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow text-black">
                <h2 className="text-2xl font-bold mb-4 border-b pb-2 flex items-center gap-2">
                    <Tag className="w-6 h-6" /> Add New Voucher
                </h2>

                <form onSubmit={handleAddVoucher} className="flex gap-2 mb-8 items-end bg-gray-50 p-4 rounded border border-gray-200">
                    <div className="flex-1">
                        <label className="block text-xs font-bold mb-1">CODE</label>
                        <input
                            type="text"
                            placeholder="e.g. SUMMER10"
                            className="w-full border p-2 rounded uppercase"
                            value={newVoucher.code}
                            onChange={e => setNewVoucher({ ...newVoucher, code: e.target.value })}
                            required
                        />
                    </div>
                    <div className="w-24">
                        <label className="block text-xs font-bold mb-1">Type</label>
                        <select
                            className="w-full border p-2 rounded p-2.5"
                            value={newVoucher.discount_type}
                            onChange={e => setNewVoucher({ ...newVoucher, discount_type: e.target.value })}
                        >
                            <option value="fixed">Fixed (Rs)</option>
                            <option value="percentage">% OFF</option>
                        </select>
                    </div>
                    <div className="w-24">
                        <label className="block text-xs font-bold mb-1">Value</label>
                        <input
                            type="number"
                            placeholder="100"
                            className="w-full border p-2 rounded"
                            value={newVoucher.discount_amount}
                            onChange={e => setNewVoucher({ ...newVoucher, discount_amount: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="bg-black text-white px-4 py-2 rounded h-10 hover:bg-gray-800 font-bold">Add</button>
                </form>

                <h3 className="font-bold text-lg mb-4">Active Vouchers</h3>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {vouchers.map(v => (
                        <div key={v.id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                            <div className="flex flex-col">
                                <span className="font-bold font-mono text-lg">{v.code}</span>
                                <span className="text-sm text-green-600 font-bold">
                                    {v.discount_type === 'percentage' ? `${v.discount_amount}% OFF` : `Rs. ${v.discount_amount} OFF`}
                                </span>
                            </div>
                            <button onClick={() => deleteVoucher(v.id)} className="text-red-500 hover:bg-red-50 p-2 rounded flex items-center gap-1 text-sm">
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                        </div>
                    ))}
                    {vouchers.length === 0 && <p className="text-gray-400 text-center py-4">No vouchers created.</p>}
                </div>
            </div>
        </div>
    )
}
