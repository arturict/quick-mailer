/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_FROM_ADDRESSES: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
