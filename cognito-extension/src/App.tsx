console.log("App.tsx script parsed!");
import { useState, useEffect } from 'react';
// import reactLogo from './assets/react.svg'; // Removed unused import
// import viteLogo from '/vite.svg'; // Removed unused import
import './App.css';
import { DashboardView } from './components/DashboardView';
import { Navigation } from './components/Navigation';
import { NotebookView } from './components/NotebookView';
import { WritingStudioView } from './components/WritingStudioView';
import { handleClippedContent } from './handlers/content-handler';
import { analyzeImageProvenanceWithDB } from './ai/provenance';
import { generateTagsForContentWithDB } from './ai/tagging';
import { queryCardsFromDB } from './ai/query';
import type { ProvenanceResult, ResearchCard, View } from './types';
import { addCard, getCards, clearAllCards } from './db';

// Declare LanguageModel as a global type if not already declared
declare const LanguageModel: any;

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
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [pendingContentPayload, setPendingContentPayload] = useState<any | null>(null); // New state for pending content

  // Helper function to process clipped content
  const processClippedContent = (payload: any) => {
    console.log("App.tsx: Attempting to process clipped content with payload:", payload);
    handleClippedContent(payload)
      .then(() => {
        getCards().then(setAllCards);
        console.log("App.tsx: Clipped content processed successfully.");
      })
      .catch((error) => {
        console.error('App.tsx: Error handling clipped content in side panel:', error);
      });
  };

  // Effect for initial data loading and AI availability check (runs once on mount)
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

    const checkAIAvailability = async () => {
      console.log("App.tsx: Checking AI availability. window.ai:", window.ai);
      const availability = await LanguageModel.availability({ outputLanguage: 'en' }); 
      console.log("App.tsx: LanguageModel.availability() result:", availability);
      const isAvailable = availability !== 'unavailable';
      console.log("App.tsx: Setting aiAvailable to:", isAvailable);
      setAiAvailable(isAvailable);
    };

    checkAIAvailability();
  }, []); // Revert to empty dependency array to run only once on mount

  // Effect for establishing and managing the port connection (runs once on mount)
  useEffect(() => {
    let port: chrome.runtime.Port | undefined;

    const connectAndIdentify = async () => {
      if (chrome.runtime.id) {
        // Get the active tab ID for the side panel's context
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        console.log("App.tsx: chrome.tabs.query result for connection:", tabs);
        const currentTabId = tabs[0]?.id;
        console.log("App.tsx: Derived currentTabId for port name:", currentTabId);

        if (currentTabId === undefined) {
          console.error("App.tsx: Could not determine currentTabId for port connection. Not connecting.");
          return;
        }

        // Connect with a unique name based on the currentTabId
        port = chrome.runtime.connect({ name: String(currentTabId) });
        console.log("App.tsx: Connected to background script. Port name used:", port.name);

        // The background script will listen for a connection and use port.name for identification.
        // It will then send SET_SIDE_PANEL_CONTEXT_TAB_ID, and we will respond with SIDE_PANEL_READY.

        port.onMessage.addListener((message) => {
          console.log("App.tsx: Received message from background script:", message.type, ":", message);
          if (message.type === 'SET_SIDE_PANEL_CONTEXT_TAB_ID') {
            const receivedTabId: number = message.originalTabId;
            console.log("App.tsx: Received SET_SIDE_PANEL_CONTEXT_TAB_ID with originalTabId:", receivedTabId);

            // Now that we have the context tab ID, we can signal readiness to the background script
            port?.postMessage({ type: 'SIDE_PANEL_READY', originalTabId: receivedTabId });
            console.log("App.tsx: Sent SIDE_PANEL_READY with originalTabId:", receivedTabId);

          } else if (message.type === 'INITIALIZE_SIDE_PANEL_WITH_CONTENT') {
            console.log("App.tsx: Received INITIALIZE_SIDE_PANEL_WITH_CONTENT via port. Payload:", message.payload); // Log payload here
            const { payload } = message; 
            // Store this payload temporarily if AI is not yet available
            if (aiAvailable === null || aiAvailable === false) {
              // Defer processing if AI availability is not yet determined or is unavailable
              setPendingContentPayload(payload); // Store the payload for later processing
              console.warn("App.tsx: AI availability still loading or unavailable, deferring content processing.");
              return;
            }

            console.log("App.tsx: AI is available, processing content immediately.", { aiAvailable, payload });
            // Process immediately if AI is available
            processClippedContent(payload);
          }
        });

        port.onDisconnect.addListener(() => {
          console.log("App.tsx: Disconnected from background script.");
        });
      }
    };

    connectAndIdentify();

    return () => {
      if (port) {
        port.disconnect();
      }
    };
  }, []); // Revert to empty dependency array to run only once on mount

  // New useEffect to handle deferred content processing once AI availability is confirmed
  useEffect(() => {
    if (aiAvailable === true && pendingContentPayload) {
      console.log("App.tsx: AI is available and pending content exists. Processing deferred content.");
      processClippedContent(pendingContentPayload);
      setPendingContentPayload(null); // Clear the pending payload after processing
    } else if (aiAvailable === false && pendingContentPayload) {
      console.error("App.tsx: Built-in AI is unavailable. Cannot process deferred content.", pendingContentPayload);
      setPendingContentPayload(null); // Clear pending payload if AI is unavailable
    }
  }, [aiAvailable, pendingContentPayload]);

  const renderView = () => {
    switch (currentView) {
      case 'Notebook':
        return <NotebookView allCards={allCards} setAllCards={setAllCards} />;
      case 'Dashboard':
        return <DashboardView />;
      case 'WritingStudio':
        return <WritingStudioView />;
      case 'Dev':
        return <SambitTestHarness allCards={allCards} setAllCards={setAllCards} textCardId={textCardId} imageCardId={imageCardId} />;
      default:
        return <NotebookView allCards={allCards} setAllCards={setAllCards} />;
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