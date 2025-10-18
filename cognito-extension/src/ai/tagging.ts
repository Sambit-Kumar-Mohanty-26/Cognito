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
    const ai: any = (window as any).ai;
    if (!ai || typeof ai.prompt !== 'function') {
      throw new Error("Built-in AI is not available.");
    }

    const resultString: string = await ai.prompt(`${MASTER_PROMPT}\n\nText to analyze:\n"""\n${content}\n"""`);

    if (!resultString) return [];
    
    return resultString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0); 

  } catch (error) {
    console.error("Tag generation failed:", error);
    return []; 
  }
}