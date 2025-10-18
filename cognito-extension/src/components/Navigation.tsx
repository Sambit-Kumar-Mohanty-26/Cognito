type View = 'Notebook' | 'Dashboard' | 'WritingStudio';

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const getButtonClass = (view: View) => {
    return `px-4 py-2 rounded-md ${currentView === view ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`;
  };

  return (
    <nav className="flex justify-around p-4 bg-gray-100 border-b border-gray-200">
      <button onClick={() => onViewChange('Notebook')} className={getButtonClass('Notebook')}>
        Notebook
      </button>
      <button onClick={() => onViewChange('Dashboard')} className={getButtonClass('Dashboard')}>
        Dashboard
      </button>
      <button onClick={() => onViewChange('WritingStudio')} className={getButtonClass('WritingStudio')}>
        Writing Studio
      </button>
    </nav>
  );
};
