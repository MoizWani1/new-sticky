# Environment Variables for Netlify

When deploying StickyBits.pk to Netlify, you must configure the following Environment Variables in the Netlify Dashboard (Site Settings > Build & deploy > Environment > Environment variables).

## Required Variables

1.  **NEXT_PUBLIC_SUPABASE_URL**
    *   **Value:** `https://your-project-ref.supabase.co`
    *   **Description:** The URL of your Supabase project.

2.  **NEXT_PUBLIC_SUPABASE_ANON_KEY**
    *   **Value:** `eyJh...` (Your long anon key)
    *   **Description:** The anonymous public key for your Supabase project.

## How to Deploy
1.  Connect your GitHub repository to Netlify.
2.  Set the **Build Command** to: `next build` (Standard Next.js build).
3.  Set the **Publish Directory** to: `.next` (Standard Next.js output).
4.  Add the above Environment Variables.
5.  Deploy!
