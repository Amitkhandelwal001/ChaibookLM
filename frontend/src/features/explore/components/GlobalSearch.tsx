import { useState, KeyboardEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { globalSearchFn } from '../services/explore.api';
import { useAuthStore } from '../../../store/authStore';
import { Search, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const GlobalSearch = () => {
  const [searchInput, setSearchInput] = useState('');
  const [queryToExecute, setQueryToExecute] = useState('');
  const token = useAuthStore((state) => state.token);

  const { data: results, isLoading } = useQuery({
    queryKey: ['globalSearch', queryToExecute],
    queryFn: () => globalSearchFn(queryToExecute, token!),
    enabled: !!token && queryToExecute.trim().length > 0,
  });

  const handleSearch = () => {
    if (searchInput.trim()) {
      setQueryToExecute(searchInput);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative flex items-center mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question across all your documents..."
          className="w-full bg-zinc-900/60 border border-white/10 rounded-2xl py-4 pl-6 pr-32 text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-zinc-200 placeholder-zinc-500 backdrop-blur-sm"
        />
        <Button
          onClick={handleSearch}
          disabled={isLoading || !searchInput.trim()}
          className="absolute right-2 rounded-xl h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {!queryToExecute && (
          <div className="text-center py-20 text-zinc-500">
            Enter a search term to find semantic matches across your entire knowledge base.
          </div>
        )}

        {queryToExecute && results?.length === 0 && (
          <div className="text-center py-20 text-zinc-500">
            No highly relevant matches found. Try rephrasing your question.
          </div>
        )}

        {results?.map((result: any, index: number) => (
          <div 
            key={`${result.id}-${index}`} 
            className="bg-zinc-900/40 border border-white/5 rounded-xl p-5 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-2 mb-3">
              {result.documentType === 'IMAGE' ? (
                <ImageIcon className="w-4 h-4 text-zinc-400" />
              ) : (
                <FileText className="w-4 h-4 text-zinc-400" />
              )}
              <span className="text-sm font-medium text-zinc-300">{result.documentTitle}</span>
              <span className="ml-auto text-xs text-primary/80 bg-primary/10 px-2 py-1 rounded-full">
                Score: {(result.score * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-zinc-200 leading-relaxed text-sm">
              ...{result.text}...
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
