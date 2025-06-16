/// <reference types="vite/client" />
interface ImportMetaEnv {
	readonly VITE_API_BASE_URL: string;
	readonly VITE_EXTERNAL_API_BASE_URL: string;
	readonly VITE_EXTERNAL_API_KEY: string;
	readonly VITE_HOST: string;
	readonly VITE_PORT: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
