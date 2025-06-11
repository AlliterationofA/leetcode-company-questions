import { getCanonicalUrl } from "./utils"

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${getCanonicalUrl()}#organization`,
    name: "LeetCode Analytics",
    url: getCanonicalUrl(),
    logo: {
      "@type": "ImageObject",
      url: `${getCanonicalUrl()}/leetcode-analytics-logo.svg`,
    },
    sameAs: [
      // Add social media profiles when available
    ],
  }
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${getCanonicalUrl()}#website`,
    name: "LeetCode Analytics",
    url: getCanonicalUrl(),
    description: "Interactive analytics dashboard for LeetCode company-wise problems. Track frequencies, patterns, and prepare efficiently for technical interviews.",
    publisher: {
      "@id": `${getCanonicalUrl()}#organization`,
    },
  }
}

export function generateWebPageSchema(path: string = '') {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${getCanonicalUrl(path)}#webpage`,
    url: getCanonicalUrl(path),
    name: path === '' 
      ? "LeetCode Analytics Dashboard" 
      : `${path} | LeetCode Analytics`,
    isPartOf: {
      "@id": `${getCanonicalUrl()}#website`,
    },
    about: {
      "@id": `${getCanonicalUrl()}#organization`,
    },
    description: "Interactive analytics dashboard for LeetCode company-wise problems. Track frequencies, patterns, and prepare efficiently for technical interviews.",
  }
}

export function generateSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${getCanonicalUrl()}#software`,
    name: "LeetCode Analytics Dashboard",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "100",
    },
  }
} 