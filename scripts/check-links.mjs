// Checks every internal link in the built site (dist/): the page or file must exist, and a link
// to a part of a page (#id) must find that id. Run after `npm run build`: `npm run check:links`.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const pages = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name.endsWith('.html')) pages.push(path);
  }
};
walk(dist);

const htmlCache = new Map();
const read = (file) => {
  if (!htmlCache.has(file)) htmlCache.set(file, readFileSync(file, 'utf8'));
  return htmlCache.get(file);
};
/** The file a site path such as /join or /brand/mark.svg is served from, or null. */
const resolve = (path) => {
  const clean = decodeURIComponent(path);
  for (const candidate of [clean, join(clean, 'index.html'), `${clean}.html`]) {
    const file = join(dist, candidate);
    if (existsSync(file) && statSync(file).isFile()) return file;
  }
  return null;
};
const hasId = (html, id) => new RegExp(`\\sid=["']?${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'\\s>]`).test(html);

const problems = [];
let checked = 0;
for (const page of pages) {
  // Links written by scripts at run time aren't in the page yet, so scripts are left out
  const html = read(page).replace(/<script[\s\S]*?<\/script>/g, '');
  const from = '/' + page.slice(dist.length);
  for (const [, , raw] of html.matchAll(/\s(href|src|poster)=["']([^"']+)["']/g)) {
    const link = raw.replace(/&amp;/g, '&');
    if (/^(https?:|mailto:|tel:|data:|\/\/|javascript:)/i.test(link)) continue;
    const [beforeHash, hash = ''] = link.split('#');
    const path = beforeHash.split('?')[0];
    let target = page;
    if (path) {
      target = resolve(path.startsWith('/') ? path : join(dirname(from), path));
      checked += 1;
      if (!target) { problems.push(`${from}: ${link} goes nowhere`); continue; }
    }
    if (hash && target.endsWith('.html')) {
      checked += 1;
      if (!hasId(read(target), hash)) problems.push(`${from}: ${link} has no part with id "${hash}"`);
    }
  }
}

if (problems.length) {
  console.error([...new Set(problems)].join('\n'));
  console.error(`\n${new Set(problems).size} broken link(s) in ${pages.length} pages.`);
  process.exit(1);
}
console.log(`${checked} internal links checked in ${pages.length} pages: all good.`);
