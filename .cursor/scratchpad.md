# Observability Enhancements – Vercel Analytics & Speed Insights (June 2025)

## Background and Motivation
We already ship basic `<Analytics />` from `@vercel/analytics/next` but without any configuration flags.  The free Hobby tier of Vercel also includes **Speed Insights** (10 k data points, 7-day window) which is not yet enabled.  Adding these client-side scripts with sensible defaults (and avoiding local noise) will provide real-world usage and performance metrics while staying inside the free quotas.

## Key Challenges and Analysis
1. **Environment-Sensitive Flags** – `mode`, `debug`, and `beforeSend` should automatically toggle between development (localhost), preview, and production.
2. **Noise Filtering** – Ignore events coming from localhost or internal `/debug*` and `/private*` routes to preserve event quota.
3. **Speed Insights Sample Rate** – Optional `sampleRate` env var can throttle data points if approaching the 10 k monthly limit.
4. **Zero Visual Impact** – Scripts must load after main content; no blocking of rendering.
5. **Verification** – Network tab should show requests to `/_vercel/insights/view` and `/_vercel/speed-insights/view` only in deploy previews/production.

## High-level Task Breakdown (new subtasks)
1. 🔄 **Audit Current Analytics**
   • Verify `<Analytics />` import and placement in `app/layout.tsx`.
   • _Success criteria_: Written notes confirming baseline.
2. 🔄 **Add Environment Flags to Analytics**
   • Wrap `<Analytics />` with props: `mode`, `debug`, `beforeSend` to filter localhost & private routes.
   • Use `process.env.NEXT_PUBLIC_VERCEL_ENV` or `NODE_ENV` to determine flags.
   • _Success criteria_: In dev console, analytics logs appear when `debug=true`; network request skipped for filtered routes.
3. 🔄 **Integrate Speed Insights**
   • Install `@vercel/speed-insights` and add `<SpeedInsights />` below `<Analytics />`.
   • Add optional `sampleRate` via `NEXT_PUBLIC_SPEED_INSIGHTS_SAMPLE_RATE`.
   • _Success criteria_: Network request to `/_vercel/speed-insights/view` visible in production build locally (`vercel dev`).
4. 🔄 **Env Vars & Documentation**
   • Update `.env.example` and README with new variables and quotas.
   • _Success criteria_: Docs explain how to enable/disable debug & sampling.
5. 🔄 **Deployment Verification**
   • Deploy preview, open dashboard Analytics & Speed Insights panels and confirm data flowing.
   • _Success criteria_: Screenshot or note confirming first events recorded.

## Project Status Board (additions)
- [ ] Audit Current Analytics
- [ ] Add Environment Flags to Analytics
- [ ] Integrate Speed Insights
- [ ] Env Vars & Documentation
- [ ] Deployment Verification

## Executor's Feedback or Assistance Requests
_(empty for now)_ 