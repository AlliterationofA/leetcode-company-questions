import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCanonicalUrl(path: string = ''): string {
  // Remove trailing slashes and ensure leading slash
  const normalizedPath = path.replace(/^\/+|\/+$/g, '')
  
  // Base URL from environment or default
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://leetcode-company-questions.vercel.app'
  
  // Combine and ensure single slash between segments
  return `${baseUrl}${normalizedPath ? `/${normalizedPath}` : ''}`
}
