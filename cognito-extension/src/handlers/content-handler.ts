import { addCard } from '../db';
import { generateTagsForContent } from '../ai/tagging';
import { imageUrlToBase64 } from '../lib/image-utils';

interface ClipPayload {
  menuItemId: string;
  selectionText?: string;
  srcUrl?: string;
  sourcePageUrl: string;
  sourcePageTitle: string;
}

// Declare LanguageModel as a global type if not already declared
declare const LanguageModel: any; 

export async function handleClippedContent(payload: ClipPayload): Promise<void> {
  // The LanguageModel availability check is now handled at the entry point in App.tsx

  if (payload.menuItemId === 'save-selection-to-cognito' && payload.selectionText) {
    try {
      const content = payload.selectionText;
      const tags = await generateTagsForContent(content);
      
      // Use LanguageModel.create() directly, assuming it's available in side panel context
      const session = await LanguageModel.create({ outputLanguage: 'en' }); 
      const summaryResult = await session.prompt(content, { outputLanguage: 'en' }); // Added output_language
      session.destroy();
      
      await addCard({
        type: 'text',
        content,
        summary: summaryResult,
        tags,
        sourceUrl: payload.sourcePageUrl,
        createdAt: Date.now(),
      });
      console.log('Text selection saved successfully from frontend handler.');
    } catch (error) {
      console.error('Failed to save text selection:', error);
    }
  }

  if (payload.menuItemId === 'save-image-to-cognito' && payload.srcUrl) {
    try {
      const base64content = await imageUrlToBase64(payload.srcUrl);
      const summary = payload.sourcePageTitle || 'Image from ' + new URL(payload.srcUrl).hostname;
      const tags = await generateTagsForContent(summary);

      await addCard({
        type: 'image',
        content: base64content,
        summary,
        tags,
        sourceUrl: payload.sourcePageUrl,
        createdAt: Date.now(),
        provenance: { status: 'unverified', findings: '' },
      });
      console.log('Image saved successfully from frontend handler.');
    } catch (error) {
      console.error('Failed to save image:', error);
    }
  }
}