import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://michiharu.github.io',
  base: '/my-way',
  output: 'static',
  integrations: [mdx(), sitemap()],
});
