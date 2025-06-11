'use client';

import type { BeforeSendEvent } from '@vercel/analytics/next';

export const beforeSendAnalytics = (event: BeforeSendEvent) => {
  // Don't track local development
  if (event.url.includes('localhost')) return null;
  // Don't track debug/private routes
  if (event.url.includes('/debug') || event.url.includes('/private')) return null;
  return event;
}; 