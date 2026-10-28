import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';

export default defineConfig({
  plugins: [sveltekit({
    adapter: adapter(),
    alias: { '#lib': resolve('src/lib') },
    extensions: ['.svelte', '.svx'],
    preprocess: [vitePreprocess(), mdsvex({ extensions: ['.svx'], layout: { runbook: resolve('src/lib/layouts/runbook.svelte') } })],
    prerender: { entries: ['*'] },
  })],
});
