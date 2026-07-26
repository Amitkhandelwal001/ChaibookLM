import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import { generateVideoHighlightsFn, Highlight } from '../services/video.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Video, Play, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export const VideoHighlightsPage = () => {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const token = useAuthStore((state) => state.token);

  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const mutation = useMutation({
    mutationFn: (youtubeUrl: string) => generateVideoHighlightsFn(youtubeUrl, token!),
    onSuccess: (data, variables) => {
      setHighlights(data);
      const id = extractVideoId(variables);
      if (id) {
        setVideoId(id);
      }
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    mutation.mutate(url);
  };

  const jumpToTime = (seconds: number) => {
    if (iframeRef.current && videoId) {
      iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?start=${seconds}&autoplay=1`;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Video Highlights</h2>
          <p className="text-muted-foreground mt-1">Extract key moments from any YouTube video instantly.</p>
        </div>
      </div>

      <Card className="border-border/50 bg-card/40 backdrop-blur-md">
        <CardContent className="p-6">
          <form onSubmit={handleGenerate} className="flex gap-4">
            <div className="relative flex-1">
              <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Paste YouTube URL here..."
                className="pl-10 h-12 text-lg bg-background/50"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              className="h-12 px-8" 
              disabled={mutation.isPending || !url}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Generate Highlights'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {mutation.isError && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-4 text-destructive">
            Failed to process video. Please make sure the video has closed captions available.
          </CardContent>
        </Card>
      )}

      {videoId && highlights.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="overflow-hidden border-border/50 shadow-xl bg-black">
              <div className="aspect-video w-full relative">
                <iframe
                  ref={iframeRef}
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              </div>
            </Card>
          </div>

          <Card className="border-border/50 bg-card/40 backdrop-blur-md h-[500px] lg:h-auto flex flex-col">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-xl flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                Key Moments
              </CardTitle>
              <CardDescription>Click a timestamp to jump</CardDescription>
            </CardHeader>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {highlights.map((highlight, index) => (
                  <div key={index} className="space-y-2 group">
                    <div 
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer border border-transparent hover:border-primary/20"
                      onClick={() => jumpToTime(highlight.timestampSeconds)}
                    >
                      <Button variant="secondary" size="sm" className="shrink-0 font-mono text-primary bg-primary/10 hover:bg-primary/20">
                        {highlight.formattedTime}
                      </Button>
                      <div>
                        <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                          {highlight.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {highlight.summary}
                        </p>
                      </div>
                    </div>
                    {index < highlights.length - 1 && <Separator className="bg-border/50" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      )}
    </div>
  );
};
