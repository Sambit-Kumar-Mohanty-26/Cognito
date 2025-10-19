/// <reference types="vite/client" />
interface AiTextSession {
  prompt: (prompt: string, options?: { image?: Blob }) => Promise<string>;
  destroy: () => void;
}

interface BuiltInAi {
  canCreateTextSession: () => Promise<'no' | 'readily' | 'after-download'>;
  createTextSession: (options?: any) => Promise<AiTextSession>;
  summarize: (options: { text: string; quality?: 'summary' | 'bullet-points' }) => Promise<{ text: string }>;
}

declare global {
  interface Window {
    ai: BuiltInAi;
  }
}
export {};