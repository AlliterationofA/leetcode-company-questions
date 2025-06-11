import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { getCanonicalUrl } from "@/lib/utils"
import { JsonLd } from "@/components/json-ld"
import { generateOrganizationSchema, generateWebSiteSchema, generateWebPageSchema, generateSoftwareApplicationSchema } from "@/lib/schema"

const inter = Inter({ subsets: ["latin"] })

const siteConfig = {
  name: "LeetCode Analytics",
  url: getCanonicalUrl(),
  description: "Interactive analytics dashboard for LeetCode company-wise problems. Track frequencies, patterns, and prepare efficiently for technical interviews."
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" }
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "LeetCode Analytics Dashboard",
    template: "%s | LeetCode Analytics"
  },
  description: siteConfig.description,
  keywords: ["leetcode", "coding interview", "technical interview", "programming problems", "company questions", "interview preparation", "coding practice", "algorithm problems"],
  authors: [{ name: "LeetCode Analytics Team" }],
  creator: "LeetCode Analytics Team",
  publisher: "LeetCode Analytics",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  generator: "Next.js",
  applicationName: siteConfig.name,
  referrer: "origin-when-cross-origin",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: siteConfig.url,
    types: {
      'application/rss+xml': `${siteConfig.url}/feed.xml`,
    }
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: "LeetCode Analytics Dashboard",
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [{
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "LeetCode Analytics Dashboard Preview"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LeetCode Analytics Dashboard",
    description: siteConfig.description,
    images: ["/og-image.png"],
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
  verification: {
    google: "google-site-verification-code", // You'll need to replace this with actual code
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLd data={generateOrganizationSchema()} />
        <JsonLd data={generateWebSiteSchema()} />
        <JsonLd data={generateWebPageSchema()} />
        <JsonLd data={generateSoftwareApplicationSchema()} />
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
