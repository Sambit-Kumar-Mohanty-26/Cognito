declare global {
  namespace chrome {
    namespace runtime {
      interface Port {
        _originalContentTabId?: number;
      }
    }
  }
}

export {}; // This ensures it's a module and not just a global script

