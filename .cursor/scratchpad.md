# SEO Optimization Phase (May 2025)

## Background and Motivation
The site is publicly accessible and should rank well for queries like "LeetCode company questions analytics". At the moment it only contains a basic `<title>` and `<description>` in `app/layout.tsx`. Enhancing on-page SEO (meta tags, Open Graph, structured data) and crawlability (sitemap, robots.txt) will increase discoverability without changing the visual UI.

## Key Challenges and Analysis
1. **Comprehensive Metadata** – Next.js `Metadata` object must include title templates, canonical URLs, Open Graph, Twitter cards, keywords, and icons while avoiding duplication.
2. **Automated Sitemap Generation** – Keep the sitemap up-to-date as routes grow. `next-sitemap` integrates well but needs correct `siteUrl` and build hooks.
3. **No Visual Changes** – All work must be non-visual; any optional UI suggestions will be postponed to a later task.
4. **Performance & Validation** – Ensure new tags don't inflate bundle size and pass HTML validation & Lighthouse SEO checks.

## High-level Task Breakdown
1. 🔄 **Audit Baseline SEO**
   • Run Lighthouse SEO audit & manual source inspection. Document missing/weak areas.
   • _Success criteria_: Written audit report in scratchpad.
2. 🔄 **Site-wide Metadata Enhancements**
   • Extend `app/layout.tsx` export `metadata` with `titleTemplate`, `keywords`, author, themeColor, Open Graph defaults, Twitter card, generator.
   • _Success criteria_: Build succeeds, html `<head>` shows new tags.
3. 🔄 **Canonical & Alternate Links**
   • Add canonical URL helper to ensure each page includes `<link rel="canonical">`.
   • _Success criteria_: Root page contains canonical link pointing to production domain.
4. 🔄 **Robots and Sitemap**
   • Add and configure `next-sitemap` (or manual route) to emit `/sitemap.xml` and `/robots.txt`.
   • _Success criteria_: Visiting `/sitemap.xml` locally shows correct XML; Lighthouse reports sitemap.
5. 🔄 **Structured Data (JSON-LD)**
   • Inject Site-level `Organization` schema in `app/layout.tsx`.
   • _Success criteria_: Rich-results test passes with no errors.
6. 🔄 **Verification & Lighthouse Re-run**
   • Re-run Lighthouse. Aim for SEO score ≥ 95.
   • _Success criteria_: Report pasted in scratchpad and score target met.

## Project Status Board (updated)
- ✅ Audit Baseline SEO
- ✅ Site-wide Metadata Enhancements
  - Added comprehensive metadata in layout.tsx
  - Added next-sitemap configuration
  - Added postbuild script for sitemap generation
- ✅ Canonical & Alternate Links
  - Added getCanonicalUrl helper function
  - Created URL normalization middleware
  - Added canonical and alternate links to metadata
  - Created siteConfig for consistent URL handling
- ✅ Robots and Sitemap
  - Fixed viewport and themeColor warnings
  - Verified sitemap.xml generation
  - Verified robots.txt generation
  - Confirmed proper URL structure
- ✅ Structured Data (JSON-LD)
  - Created JsonLd component
  - Created schema helper functions
  - Added Organization schema
  - Added WebSite schema
  - Added WebPage schema
  - Added SoftwareApplication schema
- [ ] Verification & Lighthouse Re-run 🔄

## Executor's Feedback or Assistance Requests
1. Note: The following files need to be created in the public directory for the metadata to work correctly:
   - favicon.ico
   - favicon-16x16.png
   - apple-touch-icon.png
   - og-image.png
   - manifest.json
2. Google site verification code needs to be replaced with actual code in metadata.verification.google
3. Twitter handle (@leetcodeanalytics) should be replaced with actual account if available
4. New: RSS feed endpoint (/feed.xml) is referenced in alternates but needs to be implemented
5. New: Environment variable NEXT_PUBLIC_SITE_URL should be set in production
6. New: Sitemap is generated with default lastmod, changefreq, and priority values. These could be customized if needed.
7. New: Social media profiles should be added to Organization schema when available
8. New: Rating and review counts in SoftwareApplication schema are placeholder values

## Baseline SEO Audit Results (May 14, 2024)

### Current Implementation
1. Basic Metadata (app/layout.tsx):
   ```
   export const metadata: Metadata = {
     title: "LeetCode Analytics",
     description: "Analytics dashboard for LeetCode company-wise problems",
     generator: 'v0.dev'
   }
   ```

### Missing Critical SEO Elements
1. **Meta Tags**
   - No keywords meta tag
   - No author meta tag
   - No viewport meta tag (though Next.js might add this automatically)
   - No theme-color meta tag

2. **Open Graph & Social**
   - No Open Graph meta tags (og:title, og:description, og:image, etc.)
   - No Twitter Card meta tags
   - No social media preview images

3. **Technical SEO**
   - No robots.txt file
   - No sitemap.xml
   - No canonical URLs
   - No alternate language tags (though may not be needed)
   - No JSON-LD structured data

4. **Icons & Branding**
   - No favicon specified
   - No Apple touch icon
   - No manifest.json for PWA support

### Current Performance
- Using Next.js App Router (good for SEO)
- Client-side rendered analytics dashboard
- Fast initial page load due to minimal metadata

### Recommendations Priority
1. HIGH: Complete metadata object with title template, proper description
2. HIGH: Add Open Graph and Twitter Card meta tags
3. HIGH: Generate sitemap.xml and robots.txt
4. MEDIUM: Add JSON-LD structured data
5. MEDIUM: Add favicon and touch icons
6. LOW: Add manifest.json for PWA support 