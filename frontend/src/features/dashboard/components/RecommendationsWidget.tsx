import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const RecommendationsWidget = () => {
  return (
    <Card className="bg-gradient-to-br from-primary/10 via-card/50 to-card/50 border-primary/20 backdrop-blur-sm col-span-1 md:col-span-2 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles className="w-24 h-24" />
      </div>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          AI Study Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <h3 className="text-lg font-semibold mt-2 mb-1">Time to review your Weak Topics!</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-[80%]">
          I've generated a personalized 15-minute quiz focusing on Database Indexing and React Context Optimization.
        </p>
        <Button size="sm" className="gap-2">
          Start Quiz <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
