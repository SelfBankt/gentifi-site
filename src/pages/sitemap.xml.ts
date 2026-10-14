import type { APIRoute } from 'astro';

// Every page on the site, except the 404 page and business pages under /b/, which are noindex.
// Trailing slashes match the canonical URLs.
const pages = Object.keys(import.meta.glob('./**/*.astro'))
  .filter((f) => !f.startsWith('./b/') && !f.endsWith('/404.astro'))
  .map((f) => f.replace(/^\.\//, '/').replace(/\.astro$/, '').replace(/\/?index$/, '') + '/');

export const GET: APIRoute = ({ site }) => {
  const urls = pages
    .sort()
    .map((p) => `  <url><loc>${new URL(p, site)}</loc></url>`)
    .join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
