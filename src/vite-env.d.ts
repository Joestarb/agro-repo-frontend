/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IS_PROD: string;
  readonly VITE_API_BASE_URL_LOCAL: string;
  readonly VITE_API_BASE_URL_PROD: string;
  readonly VITE_API_BASE_URL_PARCELAS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
