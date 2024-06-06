/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_BACK_HOST: string
  readonly VITE_BACK_PORT: number
  readonly VITE_MQTT_HOST: string
  readonly VITE_MQTT_PORT: number
  readonly VITE_MQTT_QOS: 0 | 1 | 2
  readonly VITE_MQTT_USERNAME: string
  readonly VITE_MQTT_PASSWORD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'codemirror-editor-vue3'