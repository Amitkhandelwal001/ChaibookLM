import { useQuery } from '@tanstack/react-query';
import { fetchPodcastsFn } from '../services/podcast.api';
import { useAuthStore } from '../../../store/authStore';
import { GeneratePodcast } from '../components/GeneratePodcast';
import { PodcastPlayer } from '../components/PodcastPlayer';
import { Headphones } from 'lucide-react';

export const PodcastsPage = () => {
  const token = useAuthStore((state) => state.token);

  const { data: podcasts, isLoading } = useQuery({
    queryKey: ['podcasts'],
    queryFn: () => fetchPodcastsFn(token!),
    enabled: !!token,
  });

  return (
    <div className="p-8 max-w-6xl mx-auto h-[calc(100vh-2rem)] overflow-y-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Headphones className="w-8 h-8 text-primary" />
          AI Podcasts
        </h1>
        <p className="text-zinc-400 mt-2 text-lg">
          Turn your dense study materials into engaging audio summaries.
        </p>
      </div>

      <GeneratePodcast />

      <div>
        <h2 className="text-2xl font-semibold text-white mb-6">Your Library</h2>
        
        {isLoading ? (
          <div className="text-zinc-500">Loading your podcasts...</div>
        ) : podcasts && podcasts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {podcasts.map((podcast: any) => (
              <PodcastPlayer key={podcast.id} podcast={podcast} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-white/5 border-dashed">
            <Headphones className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl text-zinc-300 font-medium">No podcasts yet</h3>
            <p className="text-zinc-500 mt-2">
              Select a document above to generate your first AI podcast!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
