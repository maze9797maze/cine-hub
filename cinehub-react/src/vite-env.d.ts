/// <reference types="vite/client" />

// 给 import.meta.env 补上自定义变量的类型，编辑器里就有智能提示
interface ImportMetaEnv {
  readonly VITE_TMDB_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
