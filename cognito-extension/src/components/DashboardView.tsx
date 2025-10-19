import { motion } from 'framer-motion';
const mockGroups = [
  {
    title: "Market Research - Q3 Report",
    tabs: [
      { title: "Statista - Global User Growth & Market Share", favicon: 'https://cdn.statcdn.com/favicon.ico' },
      { title: "Competitor X - Official Pricing Page", favicon: 'https://www.google.com/s2/favicons?domain=competitorx.com' },
      { title: "Industry Analysis: Trends for 2025", favicon: 'https://www.google.com/s2/favicons?domain=forbes.com' },
    ]
  },
  {
    title: "Project Phoenix - Technical Specifications",
    tabs: [
      { title: "React Docs - The Official Hooks API Reference", favicon: 'https://www.google.com/s2/favicons?domain=reactjs.org' },
      { title: "Vite | Next Generation Frontend Tooling", favicon: 'https://www.google.com/s2/favicons?domain=vitejs.dev' },
      { title: "Tailwind CSS - A Utility-First CSS Framework", favicon: 'https://www.google.com/s2/favicons?domain=tailwindcss.com' },
    ]
  },
  {
    title: "Team Collaboration & Comms",
    tabs: [
        { title: "Jira - COG-127 Sprint Planning", favicon: 'https://www.google.com/s2/favicons?domain=jira.com' },
        { title: "Figma - High-Fidelity Mockups for Notebook", favicon: 'https://www.google.com/s2/favicons?domain=figma.com' },
    ]
  }
];

export const DashboardView = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4"
    >
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Live Tab Dashboard</h1>
      
      <div className="space-y-6">
        {mockGroups.map((group, index) => (
          <motion.div 
            key={group.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0, transition: { delay: index * 0.1 } }}
            className="bg-white p-4 rounded-lg shadow-md border border-slate-200"
          >
            <h2 className="font-semibold text-slate-800 mb-3">{group.title}</h2>
            <div className="space-y-2">
              {group.tabs.map((tab) => (
                <div key={tab.title} className="flex items-center p-2 rounded-md hover:bg-slate-50 cursor-pointer transition-colors">
                  <img 
                    src={tab.favicon} 
                    alt="" 
                    className="w-4 h-4 mr-3 flex-shrink-0" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; 
                      target.src = `https://www.google.com/s2/favicons?domain=google.com`;
                    }} 
                  />
                  <span className="text-sm text-slate-700 truncate">{tab.title}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700 font-medium">This is a mock UI.</p>
        <p className="text-xs text-blue-600 mt-1">Real-time tab grouping and summarization will be implemented soon!</p>
      </div>
    </motion.div>
  );
};