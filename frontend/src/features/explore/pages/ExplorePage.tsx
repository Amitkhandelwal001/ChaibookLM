import { useState } from 'react';
import { GlobalSearch } from '../components/GlobalSearch';
import { KnowledgeGraphViewer } from '../components/KnowledgeGraphViewer';
import { Compass, Search, Share2 } from 'lucide-react';

export const ExplorePage = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'graph'>('search');

  return (
    <div className="p-8 max-w-[1400px] mx-auto h-[calc(100vh-2rem)] flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Compass className="w-8 h-8 text-primary" />
          Explore Knowledge
        </h1>
        <p className="text-zinc-400 mt-2 text-lg">
          Search semantically across your entire second brain, or visualize it as a graph.
        </p>
      </div>

      <div className="flex space-x-1 bg-zinc-900/50 p-1 rounded-xl mb-6 w-fit border border-white/5">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'search'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <Search className="w-4 h-4" />
          Global Search
        </button>
        <button
          onClick={() => setActiveTab('graph')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'graph'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <Share2 className="w-4 h-4" />
          Knowledge Graph
        </button>
      </div>

      <div className="flex-1 min-h-0 bg-zinc-900/30 rounded-2xl border border-white/5 p-6 backdrop-blur-md">
        {activeTab === 'search' ? <GlobalSearch /> : <KnowledgeGraphViewer />}
      </div>
    </div>
  );
};
