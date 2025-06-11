

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

## Project Status Board
- [ ] Audit Baseline SEO 🔄
- [ ] Site-wide Metadata Enhancements 🔄
- [ ] Canonical & Alternate Links 🔄
- [ ] Robots and Sitemap 🔄
- [ ] Structured Data (JSON-LD) 🔄
- [ ] Verification & Lighthouse Re-run 🔄

## Executor's Feedback or Assistance Requests
*(No updates yet – executor will fill during implementation)* 