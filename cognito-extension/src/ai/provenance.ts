import type { ProvenanceResult, ProvenanceStatus, ResearchCard } from '../types';
import { getCard, updateCard } from '../db';

const MASTER_PROMPT = `You are a world-class digital image forensic analyst. Your task is to analyze the provided image for any signs of digital alteration or AI generation. Be objective, technical, and precise.

Examine the following forensic markers:
1.  **Anatomy & Proportions:** Look for unnatural details in hands, fingers, eyes, teeth, and body proportions.
2.  **Light & Shadow:** Check for inconsistent light sources, impossible shadows, or reflections that don't match the environment.
3.  **Textures & Surfaces:** Analyze skin texture, hair strands, fabric patterns, and background details for waxy, overly smooth, or strangely detailed patterns characteristic of some AI models.
4.  **Logical Inconsistencies:** Identify any elements that defy physics or common sense (e.g., floating objects, nonsensical text in the background).

After your analysis, you MUST format your response in two parts, separated by '---':
1.  A final verdict on a single line: "Verdict: [High Confidence of Authenticity | Moderate Signs of Manipulation | Strong Indicators of AI Generation]".
2.  A bulleted list under the heading "Forensic Findings:" detailing your specific observations.

Example Response:
Verdict: Strong Indicators of AI Generation
---
Forensic Findings:
- The subject's left hand has six fingers.
- Shadows cast by the subject and the tree in the background are inconsistent with a single light source.
- The texture of the brick wall behind the subject appears unnaturally smooth and lacks realistic detail.`;

export async function analyzeImageProvenance(imageBlob: Blob): Promise<ProvenanceResult> {
  try {
    const ai: any = (window as any).ai;
    if (!ai || typeof ai.prompt !== 'function') {
      // Fallback to a mock AI response if the built-in AI is not available
      console.warn("Built-in AI is not available for provenance. Using mock data.");
      return { status: 'caution-advised', findings: 'Mock analysis: Image appears slightly off.' };
    }

    const resultString: string = await ai.prompt(MASTER_PROMPT, { image: imageBlob });
    const parts = resultString.split('---');
    if (parts.length < 2) {
      return { status: 'unverified', findings: "AI response was not in the expected format.\n\n" + resultString };
    }

    const verdictLine = parts[0].trim();
    const findings = parts[1].trim();
    let status: ProvenanceStatus = 'unverified';

    if (verdictLine.includes('High Confidence of Authenticity')) {
      status = 'verified-authentic';
    } else if (verdictLine.includes('Moderate Signs of Manipulation')) {
      status = 'caution-advised';
    } else if (verdictLine.includes('Strong Indicators of AI Generation')) {
      status = 'warning-manipulated';
    }

    return { status, findings };

  } catch (error) {
    console.error("Provenance analysis failed:", error);
    return {
      status: 'unverified',
      findings: 'Analysis could not be completed due to an error.',
    };
  }
}

// Helper to convert Blob to base64 string
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Manually decode a base64 string to a Uint8Array, bypassing atob issues
function base64ToUint8Array(base64: string): Uint8Array {
  const base64Map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const len = base64.length;
  const padding = (base64.endsWith('==')) ? 2 : (base64.endsWith('=')) ? 1 : 0;
  const bufferLength = len * 0.75 - padding;
  const uint8 = new Uint8Array(bufferLength);

  let offset = 0;
  for (let i = 0; i < len; i += 4) {
    const b1 = base64Map.indexOf(base64[i]);
    const b2 = base64Map.indexOf(base64[i + 1]);
    const b3 = base64Map.indexOf(base64[i + 2]);
    const b4 = base64Map.indexOf(base64[i + 3]);

    uint8[offset++] = (b1 << 2) | (b2 >> 4);
    if (b3 !== -1 && b3 !== 64) { // 64 is for padding, -1 for invalid char
      uint8[offset++] = ((b2 & 0x0f) << 4) | (b3 >> 2);
    }
    if (b4 !== -1 && b4 !== 64) { // 64 is for padding, -1 for invalid char
      uint8[offset++] = ((b3 & 0x03) << 6) | b4;
    }
  }
  return uint8.subarray(0, offset);
}

export async function analyzeImageProvenanceWithDB(cardId: number): Promise<void> {
  try {
    const card = await getCard(cardId);
    if (!card || card.type !== 'image' || !card.content) {
      console.warn(`Card ${cardId} is not an image card or has no content.`);
      return;
    }

    let imageContentForAnalysis: Blob | undefined;

    if (card.content instanceof Blob) {
      imageContentForAnalysis = card.content;
    } else if (typeof card.content === 'string' && card.content.startsWith('data:image')) {
      const base64Prefix = card.content.split(',')[0];
      let base64Part = card.content.split(',')[1];

      // Trim any leading/trailing whitespace
      base64Part = base64Part.trim();
      // Remove any existing padding characters first (if any)
      base64Part = base64Part.replace(/=+$/, '');
      // Aggressively remove any characters that are not part of the standard base64 alphabet
      base64Part = base64Part.replace(/[^A-Za-z0-9+/]/g, '');

      // Manually decode the base64 string
      const byteArray = base64ToUint8Array(base64Part);

      const mimeMatch = base64Prefix.match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/png'; // Default to png if mime not found

      // Create a new ArrayBuffer to ensure compatibility with BlobPart and avoid SharedArrayBuffer issues
      const cleanArrayBuffer = new ArrayBuffer(byteArray.byteLength);
      new Uint8Array(cleanArrayBuffer).set(byteArray);

      imageContentForAnalysis = new Blob([cleanArrayBuffer], { type: mime });

    } else {
      console.error(`Unknown image content type for card ${cardId}.`);
      return;
    }

    if (!imageContentForAnalysis) {
      console.error(`Could not prepare image content for analysis for card ${cardId}.`);
      return;
    }

    const provenanceResult = await analyzeImageProvenance(imageContentForAnalysis);

    const updatedCard: ResearchCard = {
      ...card,
      provenance: provenanceResult,
    };

    // Ensure image content is stored as base64 string in DB
    if (updatedCard.content instanceof Blob) {
      updatedCard.content = await blobToBase64(updatedCard.content);
    }

    await updateCard(updatedCard);
    console.log(`Provenance analysis for card ${cardId} completed and updated in DB.`);
  } catch (error) {
    console.error(`Failed to analyze and update provenance for card ${cardId}:`, error);
  }
}