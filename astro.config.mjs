import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://gentifi.com',
  devToolbar: { enabled: false },
  // CSS goes inside each page: no stylesheet requests hold up the first paint on phones
  build: { inlineStylesheets: 'always' },
});
