import type { Metadata } from 'next'
import { Nunito, Baloo_2, Permanent_Marker } from 'next/font/google'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'
import NextTopLoader from 'nextjs-toploader'
import ClickSparkle from '@/components/ui/ClickSparkle'
import BackgroundDoodles from '@/components/BackgroundDoodles'

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const baloo2 = Baloo_2({ subsets: ['latin'], variable: '--font-baloo2' })
const permanentMarker = Permanent_Marker({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-permanent-marker',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://stickybits.pk'),
  title: {
    default: 'StickyBits.pk - Premium Anime & Pop Culture Stickers',
    template: '%s | StickyBits.pk',
  },
  description: 'Shop the best anime, marvel, and pop culture stickers in Pakistan. High quality, waterproof, and custom bundles available.',
  openGraph: {
    title: 'StickyBits.pk - Premium Stickers',
    description: 'Shop the best anime, marvel, and pop culture stickers in Pakistan.',
    url: 'https://stickybits.pk',
    siteName: 'StickyBits',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StickyBits.pk',
    description: 'Premium anime & pop culture stickers.',
  },
  icons: {
    icon: '/assets/favicon-square.png',
  },
}

import Script from 'next/script'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${baloo2.variable} ${permanentMarker.variable} font-body overflow-x-hidden bg-background antialiased relative`}>
        <BackgroundDoodles />
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src={'https://www.googletagmanager.com/gtag/js?id=G-588NYPY86M'}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-588NYPY86M');
          `}
        </Script>

        <NextTopLoader
          color="#D4AF37"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #D4AF37,0 0 5px #D4AF37"
        />
        <ClickSparkle />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
