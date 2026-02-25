
import { supabase } from '@/lib/supabase'

export const revalidate = 0

export default async function DebugPage() {
    const { data: products, error } = await supabase.from('products').select('*')

    if (error) {
        return <div>Error loading products: {JSON.stringify(error)}</div>
    }

    return (
        <div className="p-8 bg-white text-black min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Product Debugger</h1>

            <div className="grid gap-8">
                {products?.map(p => (
                    <div key={p.id} className="border p-4 rounded bg-gray-50">
                        <h3 className="font-bold">{p.name}</h3>
                        <div className="text-xs font-mono mb-2">ID: {p.id}</div>
                        <div className="text-xs font-mono mb-2 text-blue-600 break-all">
                            image_url: {p.image_url || 'NULL'}
                        </div>
                        <div className="text-xs font-mono mb-2 text-purple-600 break-all">
                            images: {JSON.stringify(p.images)}
                        </div>

                        <div className="flex gap-4 mt-2 border-t pt-2">
                            <div>
                                <p className="text-xs font-bold mb-1">Standard &lt;img&gt; tag:</p>
                                {p.image_url ? (
                                    <img src={p.image_url} alt="Test" className="w-32 h-32 object-contain border bg-white" />
                                ) : <div className="w-32 h-32 border bg-gray-200 flex items-center justify-center text-xs">No URL</div>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <h2 className="text-xl font-bold mt-8 mb-4">Raw Data</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs font-mono">
                {JSON.stringify(products, null, 2)}
            </pre>
        </div>
    )
}
