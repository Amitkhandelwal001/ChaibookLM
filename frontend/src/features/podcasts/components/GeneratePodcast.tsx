import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDocumentsFn } from '../../uploads/services/upload.api';
import { generatePodcastFn } from '../services/podcast.api';
import { useAuthStore } from '../../../store/authStore';
import { Mic, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const GeneratePodcast = () => {
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: () => fetchDocumentsFn(token!),
    enabled: !!token,
  });

  const mutation = useMutation({
    mutationFn: (docId: string) => generatePodcastFn(docId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcasts'] });
      setSelectedDocId('');
    },
  });

  const handleGenerate = () => {
    if (selectedDocId) {
      mutation.mutate(selectedDocId);
    }
  };

  return (
    <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Select a document to turn into a Podcast
          </label>
          <select
            className="w-full bg-zinc-950/50 border border-white/10 rounded-xl py-3 px-4 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
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
        
        <Button
          onClick={handleGenerate}
          disabled={!selectedDocId || mutation.isPending}
          className="w-full md:w-auto px-8 h-[52px] rounded-xl bg-white text-black hover:bg-zinc-200 font-semibold transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Mic className="mr-2 h-5 w-5" />
              Create Podcast
            </>
          )}
        </Button>
      </div>
      
      {mutation.isPending && (
        <p className="text-sm text-zinc-500 mt-4 animate-pulse">
          Kit is reading your document and recording the audio. This may take a minute...
        </p>
      )}
      {mutation.isError && (
        <p className="text-sm text-red-400 mt-4">
          {(mutation.error as any)?.response?.data?.message || 'Failed to generate podcast. Please try again.'}
        </p>
      )}
    </div>
  );
};
