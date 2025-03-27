import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
	plugins: [vue()],
	base: '/',

	server: {
		host: 'localhost',
		port: 3000,
		strictPort: true,
		open: true,
	},
});
