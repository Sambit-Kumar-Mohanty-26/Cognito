import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ResearchCard } from '../types';
import { deleteCard } from '../db';
import { analyzeImageProvenanceWithDB } from '../ai/provenance';

const Tag: React.FC<{ text: string }> = ({ text }) => (
  <span className="bg-sky-100 text-sky-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
    {text}
  </span>
);

const ProvenanceBadge: React.FC<{ status: NonNullable<ResearchCard['provenance']>['status'] | 'pending' | undefined }> = ({ status }) => {
  const statusStyles = {
    'verified-authentic': { bg: 'bg-green-100', text: 'text-green-800', label: 'Verified Authentic' },
    'caution-advised': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Caution Advised' },
    'warning-manipulated': { bg: 'bg-red-100', text: 'text-red-800', label: 'Warning: Manipulated' },
    'pending': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Analyzing...' },
    'unverified': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Unverified' },
  };
  const style = statusStyles[status || 'unverified'];
  return (
    <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${style.bg} ${style.text} transition-colors`}>
      {style.label}
    </span>
  );
};

interface ResearchCardProps {
  card: ResearchCard;
  onDelete: (id: number) => void;
  onUpdate: () => void;     
}

export const ResearchCardComponent: React.FC<ResearchCardProps> = ({ card, onDelete, onUpdate }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    await analyzeImageProvenanceWithDB(card.id);
    onUpdate(); 
    setIsAnalyzing(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete this card?`)) {
      await deleteCard(card.id);
      onDelete(card.id);
    }
  };

  const renderCardContent = () => {
    if (card.type === 'text' && typeof card.content === 'string') {
      return (
        <p className="text-slate-600 mt-2 text-sm leading-relaxed whitespace-pre-wrap">
          {card.content}
        </p>
      );
    }
    if (card.type === 'image' && typeof card.content === 'string') {
      return (
        <div className="mt-2 flex justify-center items-center">
          <img
            src={card.content}
            alt={card.summary}
            className="rounded-lg max-h-48 w-auto object-contain"
          />
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-md font-bold text-slate-900 pr-2">{card.summary}</h3>
          <button
            onClick={handleDelete}
            className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
            title="Delete Card"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {card.tags && card.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-y-1">
            {card.tags.map(tag => <Tag key={tag} text={tag} />)}
          </div>
        )}

        {renderCardContent()}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200">
        {card.type === 'image' && (
          <div className="flex flex-col items-start">
            <div className="flex items-center justify-between w-full">
              <ProvenanceBadge status={isAnalyzing ? 'pending' : card.provenance?.status} />
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Provenance'}
              </button>
            </div>
            {card.provenance && (
              <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs text-slate-500 mt-2">
                {isExpanded ? 'Hide Details ▼' : 'Show Details ▲'}
              </button>
            )}
            <AnimatePresence>
              {isExpanded && card.provenance && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 p-2 bg-slate-50 rounded-md text-xs text-slate-700 w-full overflow-hidden whitespace-pre-wrap"
                >
                  {card.provenance.findings}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};