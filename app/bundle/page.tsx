
import { supabase } from '@/lib/supabase'
import BundlePage from './BundlePage'

export const revalidate = 60

export default async function Page() {
    const { data: products } = await supabase
        .from('bundle_stickers')
        .select('*')
        .order('created_at', { ascending: false })

    return <BundlePage products={products || []} />
}
