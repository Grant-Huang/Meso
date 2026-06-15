/// <reference types="vite/client" />

export interface LlmProvider {
  id: string
  name: string
  baseUrl: string
  model: string
  apiKeyEnvHint: string
}

export const PROVIDERS: LlmProvider[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    apiKeyEnvHint: 'VITE_DEEPSEEK_API_KEY',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    apiKeyEnvHint: 'VITE_OPENAI_API_KEY',
  },
  {
    id: 'kimi',
    name: 'Kimi (Moonshot)',
    baseUrl: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k',
    apiKeyEnvHint: 'VITE_KIMI_API_KEY',
  },
  {
    id: 'qwen',
    name: 'Qwen (Alibaba)',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-turbo',
    apiKeyEnvHint: 'VITE_QWEN_API_KEY',
  },
  {
    id: 'minimax',
    name: 'MiniMax',
    baseUrl: 'https://api.minimax.io/v1',
    model: 'MiniMax-M3',
    apiKeyEnvHint: 'VITE_MINIMAX_API_KEY',
  },
]

export const ENV_KEYS: Record<string, string> = {
  deepseek: import.meta.env.VITE_DEEPSEEK_API_KEY ?? '',
  openai: import.meta.env.VITE_OPENAI_API_KEY ?? '',
  kimi: import.meta.env.VITE_KIMI_API_KEY ?? '',
  qwen: import.meta.env.VITE_QWEN_API_KEY ?? '',
  minimax: import.meta.env.VITE_MINIMAX_API_KEY ?? '',
}
