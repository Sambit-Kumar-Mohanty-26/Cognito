import type { ProvenanceResult, ProvenanceStatus } from '../types';

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
      throw new Error("Built-in AI is not available.");
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