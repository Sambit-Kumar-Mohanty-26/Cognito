import { ResearchCard } from './ResearchCard';

export const NotebookView = () => {
  return (
    <div className="bg-slate-100 p-4 font-sans">
      <h1 className="text-xl font-bold text-slate-800">Cognito Notebook</h1>
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
