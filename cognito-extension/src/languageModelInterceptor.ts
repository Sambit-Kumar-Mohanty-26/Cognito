interface AiTextSession {
  prompt: (prompt: string, options?: { image?: Blob, outputLanguage?: string }) => Promise<string>;
  destroy: () => void;
}

interface BuiltInAi {
  canCreateTextSession: () => Promise<'no' | 'readily' | 'after-download'>;
  createTextSession: (options?: any) => Promise<AiTextSession>;
  summarize: (options: { text: string; quality?: 'summary' | 'bullet-points' }) => Promise<{ text: string }>;
  languageModel: {
    create: (options?: any) => Promise<AiTextSession>;
    availability: (options?: any) => Promise<'unavailable' | 'ready'>;
    _intercepted?: boolean; // Add this line
  };
}

declare global {
  interface Window {
    ai: BuiltInAi;
  }
}

if (typeof window.ai !== 'undefined' && typeof window.ai.languageModel !== 'undefined' && !window.ai.languageModel._intercepted) {
  const languageModel = window.ai.languageModel;
  const originalCreate = languageModel.create;
  languageModel.create = async (...args: any[]) => {
    const session = await originalCreate(...args);
    const originalPrompt = session.prompt;
    session.prompt = async (promptText: string, options?: any) => {
      const mergedOptions = { ...options, outputLanguage: 'en' };
      return originalPrompt.call(session, promptText, mergedOptions);
    };
    return session;
  };
  const originalAvailability = languageModel.availability;
  languageModel.availability = async (options?: any) => {
    const mergedOptions = { ...options, outputLanguage: 'en' };
    return originalAvailability.call(languageModel, mergedOptions);
  };
  (languageModel as any)._intercepted = true;
}

export {}; // Add this line to make the file a module
