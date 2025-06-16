import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	return {
		plugins: [vue()],
		resolve: {
			alias: {
				'@': path.resolve(__dirname, 'src'),
			},
		},
		server: {
			host: env.VITE_HOST,
			port: Number(env.VITE_PORT),
		},
		build: {
			outDir: 'dist',
			sourcemap: false,
		},
	};
});
