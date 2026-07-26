import { useRef, useState } from 'react';
import { Play, Pause, Volume2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PodcastPlayerProps {
  podcast: {
    id: string;
    title: string;
    audioUrl: string;
    createdAt: string;
  };
}

export const PodcastPlayer: React.FC<PodcastPlayerProps> = ({ podcast }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setProgress((current / total) * 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = (Number(e.target.value) / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(Number(e.target.value));
    }
  };

  return (
    <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 transition-all hover:border-primary/30 group">
      <audio
        ref={audioRef}
        src={podcast.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-semibold text-zinc-100 mb-1">{podcast.title}</h3>
          <p className="text-sm text-zinc-500">
            Generated on {new Date(podcast.createdAt).toLocaleDateString()}
          </p>
        </div>
        <a href={podcast.audioUrl} target="_blank" rel="noreferrer">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
            <Download size={20} />
          </Button>
        </a>
      </div>

      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="relative w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-primary transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={togglePlay}
              size="icon"
              className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            >
              {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-1" />}
            </Button>
            <div className="flex items-center gap-2 text-zinc-400">
              <Volume2 size={18} />
            </div>
          </div>
          
          {/* Audio Visualizer Mock */}
          <div className="flex items-end gap-1 h-8 px-4 opacity-50 group-hover:opacity-100 transition-opacity">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 bg-primary/60 rounded-full transition-all duration-300 ${isPlaying ? 'animate-pulse' : ''}`}
                style={{ 
                  height: isPlaying ? `${Math.random() * 100}%` : '20%',
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
