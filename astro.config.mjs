import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: 'https://www.jonathan-petitcolas.com',
  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['ai-agents.tail30b592.ts.net'],
    },
  },

  markdown: {
    shikiConfig: {
      theme: 'monokai',
    },
  },

  adapter: cloudflare()
});