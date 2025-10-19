import { useState } from 'react';
import { NotebookView } from './components/NotebookView';
import { DashboardView } from './components/DashboardView';
import { WritingStudioView } from './components/WritingStudioView';
import { Navigation } from './components/Navigation';
import './App.css';
import { analyzeImageProvenanceWithDB } from './ai/provenance';
import { generateTagsForContentWithDB } from './ai/tagging';
import { queryCardsFromDB } from './ai/query';
import type { ProvenanceResult, ResearchCard, View } from './types';
import { addCard, getCards, clearAllCards } from './db';
import { useEffect } from 'react';
import { handleClippedContent } from './handlers/content-handler';

interface SambitTestHarnessProps {
  allCards: ResearchCard[];
  setAllCards: (cards: ResearchCard[]) => void;
  textCardId: number | undefined;
  imageCardId: number | undefined;
}

const SambitTestHarness: React.FC<SambitTestHarnessProps> = ({ allCards, setAllCards, textCardId, imageCardId }) => {
    const [provResult, setProvResult] = useState<ProvenanceResult | null>(null);
    const [isProvLoading, setIsProvLoading] = useState(false);
    const [tagContent, setTagContent] = useState('Chrome\'s new built-in AI, including models like Gemini Nano, allows developers to build privacy-preserving features directly into their web applications.');
    const [generatedTags, setGeneratedTags] = useState<string[]>([]);
    const [isTagLoading, setIsTagLoading] = useState(false);
    const [query, setQuery] = useState('What were the financial results?');
    const [filteredCards, setFilteredCards] = useState<ResearchCard[]>([]);
    const [isQueryLoading, setIsQueryLoading] = useState(false);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsProvLoading(true); setProvResult(null);
            if (imageCardId === undefined) {
                console.error("Image card ID is not available for provenance analysis.");
                setIsProvLoading(false);
                return;
            }
            await analyzeImageProvenanceWithDB(imageCardId);
            const updatedCard = allCards.find(card => card.id === imageCardId);
            setProvResult(updatedCard?.provenance || null);
            setIsProvLoading(false);
            setAllCards(await getCards());
        }
    };
    const handleGenerateTags = async () => {
        setIsTagLoading(true); setGeneratedTags([]);
        if (textCardId === undefined) {
            console.error("Text card ID is not available for tag generation.");
            setIsTagLoading(false);
            return;
        }
        await generateTagsForContentWithDB(textCardId);
        const refreshedCards = await getCards();
        setAllCards(refreshedCards);
        const updatedCard = refreshedCards.find(card => card.id === textCardId);
        setGeneratedTags(updatedCard?.tags || []);
        setIsTagLoading(false);
    };
    const handleQueryCards = async () => {
        setIsQueryLoading(true); setFilteredCards([]);
        const resultCards = await queryCardsFromDB(query);
        setFilteredCards(resultCards);
        setIsQueryLoading(false);
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto' }}>
            <h1>Sambit's AI Core Test Harness</h1>
            <hr style={{ margin: '2rem 0' }}/>
            <h2>1. Provenance Analyzer</h2>
            <input type="file" accept="image/*" onChange={handleFileChange} disabled={isProvLoading} />
            {isProvLoading && <p>Analyzing image...</p>}
            {provResult && <pre>{JSON.stringify(provResult, null, 2)}</pre>}
            <hr style={{ margin: '2rem 0' }}/>
            <h2>2. AI-Powered Tagging</h2>
            <textarea rows={5} style={{ width: '100%', padding: '0.5rem' }} value={tagContent} onChange={(e) => setTagContent(e.target.value)} />
            <button onClick={handleGenerateTags} disabled={isTagLoading}> {isTagLoading ? 'Generating...' : 'Generate Tags'} </button>
            {generatedTags.length > 0 && <p><strong>Tags:</strong> {generatedTags.join(', ')}</p>}
            <hr style={{ margin: '2rem 0' }}/>
            <h2>3. Multimodal Query</h2>
            <input type="text" style={{ width: '100%', padding: '0.5rem' }} value={query} onChange={(e) => setQuery(e.target.value)} />
            <button onClick={handleQueryCards} disabled={isQueryLoading}> {isQueryLoading ? 'Querying...' : 'Filter Cards with AI'} </button>
            <h3>Query Results:</h3>
            {isQueryLoading && <p>Finding relevant cards...</p>}
            {filteredCards.length > 0 ? <pre>{JSON.stringify(filteredCards, null, 2)}</pre> : <p>No relevant cards found.</p>}
            <h3>Original Mock Data in DB:</h3>
            <pre style={{ background: '#f0f0f0', padding: '1rem', whiteSpace: 'pre-wrap' }}>{JSON.stringify(allCards, null, 2)}</pre>
        </div>
    );
};

function App() {
  const [currentView, setCurrentView] = useState<View>('Notebook');
  const [allCards, setAllCards] = useState<ResearchCard[]>([]);
  const [textCardId, setTextCardId] = useState<number | undefined>(undefined);
  const [imageCardId, setImageCardId] = useState<number | undefined>(undefined);

  useEffect(() => {
    const loadInitialMockData = async () => {
      await clearAllCards();
      setTextCardId(await addCard({ type: 'text', content: 'The latest report shows a 15% increase in Q3 revenue, driven by the new "Phoenix" project.', sourceUrl: 'http://example.com', createdAt: Date.now(), summary: '15% Q3 revenue increase from Phoenix project.', tags: ['finance', 'revenue', 'phoenix project'] }));
      setImageCardId(await addCard({
          type: 'image',
          content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAHBJREFUOE9jZGBg+M/AIAQQFgIwYGZgFGP+HwygYBSLgBSGAoYBAxkgCIMmBAMAAAEwWwO5/0u7AAAAAElFTkSuQmCC', // 64x64 grey square
          sourceUrl: 'http://example.com',
          createdAt: Date.now() - 10000,
          summary: 'Chart showing user engagement over time.',
          tags: ['data', 'user engagement', 'chart'],
        }));
      await addCard({ type: 'text', content: 'Client feedback has been overwhelmingly positive regarding the new UI/UX update. Key themes include "intuitive" and "responsive".', sourceUrl: 'http://example.com', createdAt: Date.now() - 20000, summary: 'Positive client feedback on UI/UX update.', tags: ['ux', 'feedback', 'design'] });

      setAllCards(await getCards());
    };
    
    loadInitialMockData();
  }, []); 

  useEffect(() => {
    const messageListener = (message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
      if (message.type === 'SAVE_CLIPPED_CONTENT') {
        console.log("Received SAVE_CLIPPED_CONTENT message:", message.payload);
        handleClippedContent(message.payload).then(() => {
          getCards().then(setAllCards);
        });
        sendResponse({ status: 'processing' });
        return true; 
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []); 
  const renderView = () => {
    switch (currentView) {
      case 'Notebook':
        return <NotebookView />;
      case 'Dashboard':
        return <DashboardView />;
      case 'WritingStudio':
        return <WritingStudioView />;
      case 'Dev':
        return <SambitTestHarness allCards={allCards} setAllCards={setAllCards} textCardId={textCardId} imageCardId={imageCardId} />;
      default:
        return <NotebookView />;
    }
  };

  return (
    <>
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <div className="p-4">
        {renderView()}
      </div>
    </>
  );
}

export default App;