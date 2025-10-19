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

export async function handleClippedContent(payload: ClipPayload): Promise<void> {
  if (!window.ai || (await window.ai.canCreateTextSession()) === 'no') {
    console.error("Built-in AI is not available. Cannot process and save content.");
    return;
  }

  if (payload.menuItemId === 'save-selection-to-cognito' && payload.selectionText) {
    try {
      const content = payload.selectionText;
      const tags = await generateTagsForContent(content);
      const summaryResult = await window.ai.summarize({ text: content });
      
      await addCard({
        type: 'text',
        content,
        summary: summaryResult.text,
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