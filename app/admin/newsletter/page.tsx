'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function NewsletterAdmin() {
    const [subscribers, setSubscribers] = useState<{ id: string, email: string, created_at: string }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSubscribers()
    }, [])

    const fetchSubscribers = async () => {
        const { data, error } = await supabase
            .from('newsletter_subscribers')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setSubscribers(data)
        if (error) console.error("Error fetching subscribers:", error)
        setLoading(false)
    }

    const copyAllEmails = () => {
        // Copy as comma-separated list for easy pasting into Gmail
        const emails = subscribers.map(s => s.email).join(', ')
        navigator.clipboard.writeText(emails)
    }

    if (loading) return <div className="p-8 text-white">Loading newsletter data...</div>

    return (
        <div className="p-8 text-white max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F1D97C] to-[#bf9c2e] bg-clip-text text-transparent">Newsletter Subscribers</h1>
                    <p className="text-gray-400 mt-1">Manage your email list ({subscribers.length} subscribers)</p>
                </div>
                <button
                    onClick={copyAllEmails}
                    className="btn-physical px-6 py-3 bg-[hsl(var(--primary))] text-black flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    Copy Emails for Gmail
                </button>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black/40 text-[hsl(var(--primary))] uppercase text-xs tracking-wider">
                            <tr>
                                <th className="p-4 font-bold border-b border-white/10">Email Address</th>
                                <th className="p-4 font-bold border-b border-white/10">Subscribed Date</th>
                                <th className="p-4 font-bold border-b border-white/10 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {subscribers.length > 0 ? (
                                subscribers.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-sm font-medium text-white">{sub.email}</td>
                                        <td className="p-4 text-xs text-gray-400 font-mono">{new Date(sub.created_at).toLocaleString()}</td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => { navigator.clipboard.writeText(sub.email) }}
                                                className="text-xs text-gray-500 hover:text-white transition-colors"
                                            >
                                                Copy
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-gray-500 italic">No subscribers yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
