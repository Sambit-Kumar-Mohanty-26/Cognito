import type { ProvenanceResult, ProvenanceStatus, ResearchCard } from '../types';
import { getCard, updateCard } from '../db';

// Declare LanguageModel as a global type if not already declared
declare const LanguageModel: any;

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
    // Use LanguageModel.availability() for a robust check before creating session
    const availability = await LanguageModel.availability({ outputLanguage: 'en' });
    if (availability === 'unavailable') {
      console.warn("Built-in AI is not available for provenance. Using mock data.");
      return new Promise(resolve => setTimeout(() => resolve({ status: 'caution-advised', findings: 'Mock analysis: This is a placeholder result because the Built-in AI is not active in this browser.' }), 1000));
    }

    const session = await LanguageModel.create({ outputLanguage: 'en' });
    const resultString = await session.prompt(MASTER_PROMPT, { image: imageBlob, outputLanguage: 'en' }); // Added output_language
    session.destroy();

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

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch data URL: ${response.statusText}`);
  }
  return await response.blob();
}

export async function analyzeImageProvenanceWithDB(cardId: number): Promise<void> {
  try {
    const card = await getCard(cardId);
    if (!card || card.type !== 'image' || typeof card.content !== 'string') {
      console.warn(`Card ${cardId} is not a valid image card or has no content.`);
      return;
    }
    const imageBlob = await dataUrlToBlob(card.content);
    const provenanceResult = await analyzeImageProvenance(imageBlob);
    const updatedCard: ResearchCard = {
      ...card,
      provenance: provenanceResult,
    };

    await updateCard(updatedCard);
    console.log(`Provenance analysis for card ${cardId} completed and updated in DB.`);
  } catch (error) {
    console.error(`Failed to analyze and update provenance for card ${cardId}:`, error);
  }
}