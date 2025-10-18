
import { ResearchCard } from './ResearchCard';

export const NotebookView = () => {
  return (
    // We are using Rudra's layout and styling here
    <div className="bg-slate-100 p-4 font-sans">
      <h1 className="text-xl font-bold text-slate-800">Cognito Notebook</h1>

      {/* This will eventually be a dynamic list of cards from the database */}
      <ResearchCard
        title="This is a Saved Note"
        summary="An AI-generated summary will appear here once the backend is connected."
      />

      <ResearchCard
        title="Another Saved Note"
        summary="You can create multiple cards to design the layout."
      />
    </div>
  );
};
