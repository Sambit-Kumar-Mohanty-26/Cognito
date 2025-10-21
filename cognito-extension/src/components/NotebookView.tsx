import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getCards } from '../db';
import type { ResearchCard as ResearchCardType } from '../types';
import { ResearchCardComponent } from './ResearchCard';

interface NotebookViewProps {
  allCards: ResearchCardType[];
  setAllCards: React.Dispatch<React.SetStateAction<ResearchCardType[]>>; // Update type here
}

export const NotebookView: React.FC<NotebookViewProps> = ({ allCards, setAllCards }) => {
  const [isLoading, setIsLoading] = useState(false); // Initialize as false, data comes from props

  // The allCards prop is the source of truth, so we don't need a local 'cards' state.
  // We also don't need a useEffect to set local state from props if we're rendering directly from props.

  const handleCardDelete = (deletedId: number) => {
    setAllCards((currentCards: ResearchCardType[]) => currentCards.filter((card: ResearchCardType) => card.id !== deletedId));
  };

  const handleCardUpdate = async () => {
    setIsLoading(true);
    try {
      const updatedCards = await getCards();
      setAllCards(updatedCards);
    } catch (error) {
      console.error("Failed to refresh cards:", error);
    } finally {
      setIsLoading(false);
    }
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
          onClick={() => setAllCards([])} // Clear all cards button
          className="text-slate-500 hover:text-slate-800 transition-colors p-1"
          title="Clear All Cards"
          disabled={isLoading}
        >
          Clear All
        </button>
        <button
          onClick={handleCardUpdate} // Refresh button
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
      
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <AnimatePresence>
            {allCards.length > 0 ? (
              allCards.map((card) => (
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