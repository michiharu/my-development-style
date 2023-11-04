import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkCodeTitles from 'remark-code-titles';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://michiharu.github.io',
  base: '/my-way',
  trailingSlash: 'always',
  markdown: { remarkPlugins: [remarkCodeTitles] },
  integrations: [mdx(), sitemap()],
});
