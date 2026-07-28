import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()

        const userName = formData.get('userName') as string
        const image = formData.get('image') as File

        if (!userName || !image) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // 1. Upload Image
        const fileExt = image.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('sticky-wall')
            .upload(filePath, image)

        if (uploadError) {
            return NextResponse.json({ error: 'Image upload failed: ' + uploadError.message }, { status: 500 })
        }

        const { data: { publicUrl } } = supabase.storage
            .from('sticky-wall')
            .getPublicUrl(filePath)

        // 2. Generate Discount Code (5% off)
        // Code format: WALL-XXXX (4 random uppercase chars/numbers)
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
        const voucherCode = `WALL-${randomSuffix}`

        // Use Admin Client for Voucher Creation (requires privileged access)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { error: voucherError } = await supabaseAdmin
            .from('vouchers')
            .insert({
                code: voucherCode,
                discount_amount: 5,
                discount_type: 'percentage',
                is_active: true
            })

        if (voucherError) {
            // If code exists (unlikely but possible), try one more time or just fail
            // For now, fail but ideally recursion or retry loop
            return NextResponse.json({ error: 'Failed to generate voucher: ' + voucherError.message }, { status: 500 })
        }

        // 3. Create Post
        const { data: post, error: dbError } = await supabase
            .from('sticky_wall_posts')
            .insert({
                image_url: publicUrl,
                user_name: userName,
                voucher_code: voucherCode
            })
            .select()
            .single()

        if (dbError) {
            return NextResponse.json({ error: 'Failed to save post: ' + dbError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, post, voucherCode })

    } catch (err: any) {
        console.error('Sticky Wall Upload Error:', err)
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
    }
}
