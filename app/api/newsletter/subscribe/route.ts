import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
        return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email })

    if (error) {
        if (error.code === '23505') { // Unique constraint violation
            return NextResponse.json({ message: 'Already subscribed!' }, { status: 200 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Subscribed successfully!' }, { status: 200 })
}
