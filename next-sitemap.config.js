/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://leetcode-company-questions.vercel.app',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    additionalSitemaps: [
      'https://leetcode-company-questions.vercel.app/sitemap.xml',
    ],
  },
  exclude: ['/api/*'],
} 