import { useState } from 'react';
import { NotebookView } from './components/NotebookView';
import { DashboardView } from './components/DashboardView';
import { WritingStudioView } from './components/WritingStudioView';
import { Navigation } from './components/Navigation';
import './App.css';

type View = 'Notebook' | 'Dashboard' | 'WritingStudio';

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

export default App
