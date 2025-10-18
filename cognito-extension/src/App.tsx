import { useState } from 'react';
import { NotebookView } from './components/NotebookView';
import { DashboardView } from './components/DashboardView';
import { WritingStudioView } from './components/WritingStudioView';
import { Navigation } from './components/Navigation';
import './App.css';
import { analyzeImageProvenance } from './ai/provenance';
import { generateTagsForContent } from './ai/tagging';
import { queryCards } from './ai/query';
import type { ProvenanceResult, ResearchCard, View } from './types';

const mockCards: ResearchCard[] = [
  { id: 1, type: 'text', content: 'The latest report shows a 15% increase in Q3 revenue, driven by the new "Phoenix" project.', sourceUrl: 'http://example.com', createdAt: Date.now(), summary: '15% Q3 revenue increase from Phoenix project.', tags: ['finance', 'revenue', 'phoenix project'] },
  { id: 2, type: 'image', content: new Blob(), sourceUrl: 'http://example.com', createdAt: Date.now() - 10000, summary: 'Chart showing user engagement over time.', tags: ['data', 'user engagement', 'chart'] },
  { id: 3, type: 'text', content: 'Client feedback has been overwhelmingly positive regarding the new UI/UX update. Key themes include "intuitive" and "responsive".', sourceUrl: 'http://example.com', createdAt: Date.now() - 20000, summary: 'Positive client feedback on UI/UX update.', tags: ['ux', 'feedback', 'design'] },
];

const SambitTestHarness = () => {
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
            const analysisResult = await analyzeImageProvenance(file);
            setProvResult(analysisResult);
            setIsProvLoading(false);
        }
    };
    const handleGenerateTags = async () => {
        setIsTagLoading(true); setGeneratedTags([]);
        const tags = await generateTagsForContent(tagContent);
        setGeneratedTags(tags);
        setIsTagLoading(false);
    };
    const handleQueryCards = async () => {
        setIsQueryLoading(true); setFilteredCards([]);
        const resultCards = await queryCards(query, mockCards);
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
            <h3>Original Mock Data:</h3>
            <pre style={{ background: '#f0f0f0', padding: '1rem', whiteSpace: 'pre-wrap' }}>{JSON.stringify(mockCards, null, 2)}</pre>
        </div>
    );
};

function App() {
  const [currentView, setCurrentView] = useState<View>('Notebook');

  const renderView = () => {
    switch (currentView) {
      case 'Notebook':
        return <NotebookView />;
      case 'Dashboard':
        return <DashboardView />;
      case 'WritingStudio':
        return <WritingStudioView />;
      case 'Dev':
        return <SambitTestHarness />;
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