import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchStudyDataFn } from '../services/study.api';
import { useAuthStore } from '../../../store/authStore';
import { GenerateStudyMaterials } from '../components/GenerateStudyMaterials';
import { NotesViewer } from '../components/NotesViewer';
import { FlashcardCarousel } from '../components/FlashcardCarousel';
import { BookOpen, FileText, Layers } from 'lucide-react';

export const NotesPage = () => {
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'notes' | 'flashcards'>('notes');
  const token = useAuthStore((state) => state.token);

  const { data: studyData, isLoading } = useQuery({
    queryKey: ['studyData', selectedDocId],
    queryFn: () => fetchStudyDataFn(selectedDocId, token!),
    enabled: !!token && !!selectedDocId,
  });

  return (
    <div className="p-8 max-w-6xl mx-auto h-[calc(100vh-2rem)] overflow-y-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" />
          Study Materials
        </h1>
        <p className="text-zinc-400 mt-2 text-lg">
          Generate structured notes and interactive flashcards from your knowledge base.
        </p>
      </div>

      <GenerateStudyMaterials 
        onDocumentSelect={setSelectedDocId} 
        selectedDocId={selectedDocId} 
      />

      {selectedDocId && (
        <div className="mt-8">
          <div className="flex space-x-1 bg-zinc-900/50 p-1 rounded-xl mb-6 w-fit border border-white/5">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'notes'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Structured Notes
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'flashcards'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              Flashcards
            </button>
          </div>

          {isLoading ? (
            <div className="text-zinc-500 text-center py-20 animate-pulse">
              Loading study materials...
            </div>
          ) : (
            <div className="min-h-[500px]">
              {activeTab === 'notes' ? (
                <NotesViewer content={studyData?.note?.content} />
              ) : (
                <FlashcardCarousel flashcards={studyData?.flashcards || []} />
              )}
            </div>
          )}
        </div>
      )}
      
      {!selectedDocId && (
        <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-white/5 border-dashed mt-8">
          <BookOpen className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl text-zinc-300 font-medium">Select a Document</h3>
          <p className="text-zinc-500 mt-2">
            Choose a document from the dropdown above to view or generate its study materials.
          </p>
        </div>
      )}
    </div>
  );
};
