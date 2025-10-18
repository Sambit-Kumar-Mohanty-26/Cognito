interface ResearchCardProps {
  title: string;
  summary: string;
}

export const ResearchCard: React.FC<ResearchCardProps> = ({ title, summary }) => {
  return (
    <div className="bg-white p-3 my-4 rounded-lg shadow-md border border-slate-200">
      <h2 className="font-bold text-slate-800">{title}</h2>
      <p className="text-slate-600 mt-2 text-sm">{summary}</p>
    </div>
  );
};
