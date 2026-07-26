import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDocumentsFn } from '../../uploads/services/upload.api';
import { generateStudyMaterialsFn } from '../services/study.api';
import { useAuthStore } from '../../../store/authStore';
import { BookOpen, Loader2, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GenerateStudyMaterialsProps {
  onDocumentSelect: (id: string) => void;
  selectedDocId: string;
}

const AVAILABLE_SECTIONS = [
  'Summary', 
  'Key Points', 
  'Examples', 
  'Interview Questions', 
  'Flashcards', 
  'Revision Notes', 
  'Cheat Sheet', 
  'Mind Maps'
];

export const GenerateStudyMaterials = ({ onDocumentSelect, selectedDocId }: GenerateStudyMaterialsProps) => {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const [selectedSections, setSelectedSections] = useState<string[]>(AVAILABLE_SECTIONS);

  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: () => fetchDocumentsFn(token!),
    enabled: !!token,
  });

  const mutation = useMutation({
    mutationFn: (docId: string) => generateStudyMaterialsFn(docId, token!, selectedSections),
    onSuccess: (_, docId) => {
      queryClient.invalidateQueries({ queryKey: ['studyData', docId] });
    },
  });

  const handleGenerate = () => {
    if (selectedDocId) {
      mutation.mutate(selectedDocId);
    }
  };

  const toggleSection = (section: string) => {
    setSelectedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 mb-8">
      <div className="flex flex-col gap-6">
        <div className="w-full">
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            1. Select a document to process
          </label>
          <select
            className="w-full bg-zinc-950/50 border border-white/10 rounded-xl py-3 px-4 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={selectedDocId}
            onChange={(e) => onDocumentSelect(e.target.value)}
            disabled={mutation.isPending}
          >
            <option value="">-- Choose a document --</option>
            {documents?.data?.map((doc: any) => (
              <option key={doc.id} value={doc.id}>
                {doc.title}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-zinc-400 mb-3">
            2. Select sections to generate
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AVAILABLE_SECTIONS.map((section) => (
              <label 
                key={section} 
                onClick={() => toggleSection(section)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  selectedSections.includes(section) 
                    ? 'bg-primary/10 border-primary/30 text-white' 
                    : 'bg-zinc-950/50 border-white/5 text-zinc-400 hover:bg-zinc-800/50'
                }`}
              >
                <div className={`w-5 h-5 flex items-center justify-center rounded-md border ${
                  selectedSections.includes(section) ? 'bg-primary border-primary' : 'border-zinc-600'
                }`}>
                  {selectedSections.includes(section) && <CheckSquare className="w-3.5 h-3.5 text-primary-foreground" />}
                </div>
                <span className="text-sm font-medium">{section}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t border-white/5">
          <Button
            onClick={handleGenerate}
            disabled={!selectedDocId || mutation.isPending || selectedSections.length === 0}
            className="w-full md:w-auto px-8 h-[52px] rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Sections...
              </>
            ) : (
              <>
                <BookOpen className="mr-2 h-5 w-5" />
                Extract Knowledge
              </>
            )}
          </Button>
        </div>
      </div>
      
      {mutation.isPending && (
        <p className="text-sm text-zinc-500 mt-4 animate-pulse text-center">
          Kit is reading your document and generating {selectedSections.length} sections. This may take a minute...
        </p>
      )}
      {mutation.isError && (
        <p className="text-sm text-red-400 mt-4 text-center">
          Failed to generate materials. Please try again.
        </p>
      )}
    </div>
  );
};
