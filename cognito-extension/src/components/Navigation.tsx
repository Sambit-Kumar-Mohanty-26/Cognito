import type { View } from '../types';

// Define the component's props using the imported View type.
interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export const Navigation = ({ currentView, onViewChange }: NavigationProps) => {
  // Basic button styling for now. Rudra can make this beautiful later.
  const baseButtonClass = "px-3 py-1 rounded-md text-sm font-medium";
  const activeButonClass = "bg-slate-800 text-white";
  const inactiveButtonClass = "text-slate-600 hover:bg-slate-300";

  return (
    <nav className="p-2 bg-slate-200 flex space-x-2 border-b border-slate-300">
      
      <button 
        onClick={() => onViewChange('Notebook')} 
        className={`${baseButtonClass} ${currentView === 'Notebook' ? activeButonClass : inactiveButtonClass}`}
      >
        Notebook
      </button>
      
      <button 
        onClick={() => onViewChange('Dashboard')} 
        className={`${baseButtonClass} ${currentView === 'Dashboard' ? activeButonClass : inactiveButtonClass}`}
      >
        Dashboard
      </button>

      <button 
        onClick={() => onViewChange('WritingStudio')} 
        className={`${baseButtonClass} ${currentView === 'WritingStudio' ? activeButonClass : inactiveButtonClass}`}
      >
        Writing Studio
      </button>
      
      {/* This button is for you, Sambit! */}
      <button 
        onClick={() => onViewChange('Dev')} 
        className={`${baseButtonClass} ${currentView === 'Dev' ? activeButonClass : inactiveButtonClass} ml-auto border border-slate-400`}
      >
        Dev Harness
      </button>

    </nav>
  );
};