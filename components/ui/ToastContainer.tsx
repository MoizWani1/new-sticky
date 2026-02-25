'use client'
import { useToastStore } from '@/lib/toast'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ToastContainer() {
    const { toasts, removeToast } = useToastStore()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 z-50 flex flex-col gap-2 md:w-full md:max-w-sm pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="pointer-events-auto bg-zinc-900 border border-zinc-800 text-white p-4 rounded-lg shadow-2xl flex items-center gap-3 animate-in slide-in-from-right fade-in duration-300"
                >
                    {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-[hsl(var(--primary))]" />}
                    {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                    {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}

                    <p className="flex-1 text-sm font-medium">{toast.message}</p>

                    <button onClick={() => removeToast(toast.id)} className="text-gray-500 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    )
}
