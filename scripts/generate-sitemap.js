// scripts/generate-sitemap.js
const fs = require('fs');
const path = require('path');

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://growthbridge.org').replace(/\/$/, '');
const CURRENT_DATE = new Date().toISOString().split('T')[0];

// ─── All your static pages ──────────────────────────────────────────
const pages = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/about', priority: 0.8, changefreq: 'monthly' },
  { path: '/contact', priority: 0.7, changefreq: 'monthly' },
  { path: '/blog', priority: 0.9, changefreq: 'weekly' },
  { path: '/projects', priority: 0.8, changefreq: 'weekly' },
  { path: '/services', priority: 0.8, changefreq: 'weekly' },
  { path: '/team', priority: 0.7, changefreq: 'monthly' },
  { path: '/talent-hub', priority: 0.7, changefreq: 'weekly' },
  // Admin paths intentionally excluded — noindex via robots.txt
  // ─── Add more pages as you create them ──────────────────────────
];

// ─── Generate XML ──────────────────────────────────────────────────
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${BASE_URL}${page.path}</loc>
    <lastmod>${CURRENT_DATE}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

// ─── Write to public folder ──────────────────────────────────────
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
console.log('✅ Sitemap generated successfully at public/sitemap.xml');
