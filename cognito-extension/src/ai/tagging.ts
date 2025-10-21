import type { ResearchCard } from "../types";
import { getCard, updateCard } from '../db';

declare const LanguageModel: any;

const MASTER_PROMPT = `You are a highly intelligent content analysis engine. Your task is to extract the most relevant keywords and concepts from the provided text to be used as organizational tags.

Follow these rules strictly:
1.  Generate between 2 and 5 tags.
2.  Tags should be concise (1-3 words) and represent the core topics.
3.  Prioritize key entities (people, products, companies), primary themes, and specific technologies.
4.  Do not generate generic or vague tags like "information" or "article".
5.  Return the tags as a single, comma-separated string ONLY. Example: "AI, Gemini Nano, On-Device AI, Web Development".
6.  Do not add any preamble, explanation, or other text. Only return the comma-separated list.`;

export async function generateTagsForContent(content: string): Promise<string[]> {
  try {
    if ((await LanguageModel.availability({ outputLanguage: 'en' })) === 'unavailable') {
      console.warn("Built-in AI is not available for tagging. Using mock data.");
      return ['mock-tag', 'placeholder'];
    }

    const session = await LanguageModel.create({ outputLanguage: 'en' });
    const resultString = await session.prompt(`${MASTER_PROMPT}\n\nText to analyze:\n"""\n${content}\n"""`);
    session.destroy();

    if (!resultString) return [];
    
    return resultString
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0); 

  } catch (error) {
    console.error("Tag generation failed:", error);
    return []; 
  }
}

export async function generateTagsForContentWithDB(cardId: number): Promise<void> {
  try {
    const card = await getCard(cardId);
    if (!card || card.type !== 'text' || typeof card.content !== 'string') {
      console.warn(`Card ${cardId} is not a text card or has no content.`);
      return;
    }

    const tags = await generateTagsForContent(card.content);

    const updatedCard: ResearchCard = {
      ...card,
      tags: tags,
    };
    await updateCard(updatedCard);
    console.log(`Tags for card ${cardId} generated and updated in DB.`);
  } catch (error) {
    console.error(`Failed to generate tags and update card ${cardId}:`, error);
  }
}