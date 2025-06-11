import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000",
}

export const metadata: Metadata = {
  title: "LeetCode Analytics Dashboard",
  description: "Comprehensive analytics dashboard for LeetCode company-wise problems. Track your progress, analyze patterns, and prepare effectively for technical interviews.",
  generator: "Next.js",
  applicationName: "LeetCode Analytics",
  referrer: "origin-when-cross-origin",
  keywords: ["leetcode", "coding problems", "technical interview", "programming", "algorithms", "data structures", "company questions"],
  authors: [{ name: "LeetCode Analytics Team" }],
  creator: "LeetCode Analytics Team",
  publisher: "LeetCode Analytics",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://leetcode-analytics.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LeetCode Analytics Dashboard",
    description: "Comprehensive analytics dashboard for LeetCode company-wise problems. Track your progress, analyze patterns, and prepare effectively for technical interviews.",
    url: "https://leetcode-analytics.vercel.app",
    siteName: "LeetCode Analytics",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LeetCode Analytics Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LeetCode Analytics Dashboard",
    description: "Comprehensive analytics dashboard for LeetCode company-wise problems",
    images: ["/twitter-image.png"],
    creator: "@leetcodeanalytics",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.png" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
      },
    ],
  },
  manifest: "/manifest.json",
  verification: {
    google: "google-site-verification-code", // Add your Google verification code
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        
        {/* Preload critical assets */}
        <link rel="preload" href="/icon.png" as="image" />
        <link rel="preload" href="/favicon.png" as="image" />
        
        {/* Add PWA meta tags */}
        <meta name="application-name" content="LeetCode Analytics" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LeetCode Analytics" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Add PWA icons */}
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "LeetCode Analytics Dashboard",
              "description": "Comprehensive analytics dashboard for LeetCode company-wise problems. Track your progress, analyze patterns, and prepare effectively for technical interviews.",
              "url": "https://leetcode-analytics.vercel.app",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "LeetCode Analytics Team"
              },
              "publisher": {
                "@type": "Organization",
                "name": "LeetCode Analytics",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://leetcode-analytics.vercel.app/icon-512.png"
                }
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
