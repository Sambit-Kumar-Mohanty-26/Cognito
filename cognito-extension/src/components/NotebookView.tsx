import { ResearchCardComponent } from './ResearchCard';
import { getCards } from '../db';
import { useEffect, useState } from 'react';
import type { ResearchCard as ResearchCardType } from '../types';

export const NotebookView = () => {
  const [cards, setCards] = useState<ResearchCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCards = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const savedCards = await getCards();
      setCards(savedCards);
    } catch (err) {
      console.error("Failed to load cards:", err);
      setError("Failed to load research cards.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  return (
    <div className="bg-slate-100 p-4 font-sans min-h-screen">
      <h1 className="text-xl font-bold text-slate-800 mb-4">Cognito Notebook</h1>
      {isLoading && <p className="text-slate-600">Loading research cards...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {cards.length > 0 ? (
            cards.map((card) => (
              <ResearchCardComponent key={card.id} card={card} />
            ))
          ) : (
            <p className="text-slate-600">No research cards saved yet. Add some via the Dev Harness!</p>
          )}
        </div>
      )}
    </div>
  );
};
