import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getCards } from '../db';
import type { ResearchCard as ResearchCardType } from '../types';
import { ResearchCardComponent } from './ResearchCard';

export const NotebookView = () => {
  const [cards, setCards] = useState<ResearchCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCards = async () => {
    if (cards.length === 0) setIsLoading(true);
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

  const handleCardDelete = (deletedId: number) => {
    setCards(currentCards => currentCards.filter(card => card.id !== deletedId));
  };

  const handleCardUpdate = async () => {
    await loadCards();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-100 p-4 font-sans min-h-screen"
    >
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-slate-800">Cognito Notebook</h1>
        <button
          onClick={loadCards}
          className="text-slate-500 hover:text-slate-800 transition-colors p-1"
          title="Refresh Cards"
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M20 4l-5 5M4 20l5-5" />
          </svg>
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <p className="text-slate-600">Loading research cards...</p>
        </div>
      )}
      {error && (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">Error: {error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <AnimatePresence>
            {cards.length > 0 ? (
              cards.map((card) => (
                <ResearchCardComponent
                  key={card.id}
                  card={card}
                  onDelete={handleCardDelete}
                  onUpdate={handleCardUpdate} 
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-16 px-4 bg-white rounded-lg shadow-sm"
              >
                <p className="text-slate-600">No research cards saved yet.</p>
                <p className="text-slate-500 text-sm mt-1">Try adding some from the web or the Dev Harness!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};