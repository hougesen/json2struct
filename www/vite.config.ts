import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    build: {
        cssCodeSplit: true,
        minify: true,
        cssMinify: true,
    },
    optimizeDeps: { entries: ['prettier'] },
});
