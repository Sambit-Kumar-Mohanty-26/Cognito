import React from 'react';

export const NotebookView = () => {
  return (
    // We are using Rudra's layout and styling here
    <div className="bg-slate-100 p-4 font-sans">
      <h1 className="text-xl font-bold text-slate-800">Cognito Notebook</h1>

      {/* This will eventually be a dynamic <ResearchCard> component */}
      <div className="bg-white p-3 my-4 rounded-lg shadow-md border border-slate-200">
        <h2 className="font-bold text-slate-800">This is a Saved Note</h2>
        <p className="text-slate-600 mt-2 text-sm">
          An AI-generated summary will appear here once the backend is connected.
        </p>
      </div>

      <div className="bg-white p-3 my-4 rounded-lg shadow-md border border-slate-200">
        <h2 className="font-bold text-slate-800">Another Saved Note</h2>
        <p className="text-slate-600 mt-2 text-sm">
          You can create multiple cards to design the layout.
        </p>
      </div>
    </div>
  );
};
