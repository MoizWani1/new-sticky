
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { id, imageUrl } = await request.json()

        if (!id) {
            return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
        }

        // Debug: Check if keys are loaded
        console.log('API Delete: Checking Creds:', {
            url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        })

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('Missing Env Vars')
            return NextResponse.json({ error: 'Server Misconfiguration: Missing Keys' }, { status: 500 })
        }

        // Create Admin Client with Service Role Key
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        // 1. Delete from Database first (to remove from UI immediately)
        const { error: dbError } = await supabaseAdmin
            .from('sticky_wall_posts')
            .delete()
            .eq('id', id)

        if (dbError) {
            console.error('Database delete error:', dbError)
            return NextResponse.json({ error: dbError.message }, { status: 500 })
        }

        // 2. Delete from Storage (Best Effort)
        if (imageUrl) {
            try {
                // Extract path after /storage/v1/object/public/
                // Example: https://.../storage/v1/object/public/sticky-wall/filename.png
                // We need: sticky-wall/filename.png (bucket + path)
                // Or just filename.png if we use .from('sticky-wall') 

                // Let's assume the standard URL structure
                const urlParts = imageUrl.split('/sticky-wall/')
                if (urlParts.length > 1) {
                    const filePath = urlParts[1]
                    const { error: storageError } = await supabaseAdmin
                        .storage
                        .from('sticky-wall')
                        .remove([filePath])

                    if (storageError) console.error('Storage delete error:', storageError)
                }
            } catch (storageErr) {
                console.error('Error parsing/deleting image:', storageErr)
                // Continue even if image delete fails, as record is gone
            }
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
