import type { ResearchCard } from "../types";
import { getCards } from '../db';

const MASTER_PROMPT = `You are a powerful semantic search and filtering engine for a user's private research notebook.
I will provide a user's search query and a list of their saved research cards in a simplified JSON format.
Your task is to analyze the user's intent and identify ONLY the cards that are the most direct and relevant answers to their query.

You must adhere to the following rules without exception:
1.  Analyze the query against each card's 'summary', 'tags', and 'contentSnippet'. A strong match in any of these fields makes a card a candidate.
2.  Your SOLE output must be a comma-separated list of the 'id' numbers for the matching cards.
3.  Example of correct output: "3, 7, 12"
4.  If no cards are relevant to the query, you MUST return an empty string.
5.  Do not include any other text, explanation, headers, or formatting. Your entire response must be ONLY the list of IDs.`;

export async function queryCards(query: string, cards: ResearchCard[]): Promise<ResearchCard[]> {
  try {
    if (cards.length === 0) return [];
    if (!window.ai || (await window.ai.canCreateTextSession()) === 'no') {
      console.warn("Built-in AI is not available for querying. Performing simple text search.");
      return cards.filter(card => JSON.stringify(card).toLowerCase().includes(query.toLowerCase()));
    }

    const simplifiedCards = cards.map(card => ({
      id: card.id,
      summary: card.summary,
      tags: card.tags,
      contentSnippet: card.type === 'text' && typeof card.content === 'string' 
        ? card.content.substring(0, 100) 
        : '',
    }));

    const fullPrompt = `${MASTER_PROMPT}\n\nUser Query: "${query}"\n\nResearch Cards JSON:\n${JSON.stringify(simplifiedCards, null, 2)}`;
    
    const session = await window.ai.createTextSession();
    const resultString = await session.prompt(fullPrompt);
    session.destroy();

    if (!resultString) return [];

    const relevantIds = resultString
      .split(',')
      .map(id => parseInt(id.trim(), 10))
      .filter(id => !isNaN(id));

    const relevantIdSet = new Set(relevantIds);

    return cards.filter(card => relevantIdSet.has(card.id));

  } catch (error) {
    console.error("Card query failed:", error);
    return [];
  }
}

export async function queryCardsFromDB(query: string): Promise<ResearchCard[]> {
  try {
    const allCards = await getCards();
    const filteredCards = await queryCards(query, allCards);
    console.log(`Query for "${query}" completed.`);
    return filteredCards;
  } catch (error) {
    console.error(`Failed to query cards from DB for "${query}":`, error);
    return [];
  }
}