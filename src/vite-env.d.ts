/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_REAL_API: string
  readonly VITE_API_URL: string
  readonly VITE_MOCK_DELAY_MIN: string
  readonly VITE_MOCK_DELAY_MAX: string
  readonly VITE_MOCK_DELAY_FIXED: string
  readonly VITE_MOCK_ERROR_RATE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}