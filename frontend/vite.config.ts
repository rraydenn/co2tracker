import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => ({
	plugins: [vue()],
	base: mode === 'production' ? '/prod/' : '/',
	build: {
		outDir: mode === 'production' ? 'dist' : 'dev-dist', // Répertoire de sortie pour Vite
		emptyOutDir: true, // Nettoie le répertoire de sortie avant chaque build
	},
	server: {
		port: 3000,
		open: true,
	},
	define: {
		__DEV__: mode === 'development',
	},
	css: {
		devSourcemap: mode === 'development',
	},
}));
