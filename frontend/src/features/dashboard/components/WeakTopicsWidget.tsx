import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const mockTopics = [
  { topic: 'React Context Optimization', count: 3 },
  { topic: 'Database Indexing', count: 5 },
  { topic: 'JWT Refresh Flow', count: 2 },
];

export const WeakTopicsWidget = () => {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Weak Topics</CardTitle>
        <AlertTriangle className="w-4 h-4 text-orange-500" />
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-4">
          Based on your recent quizzes and chats, we recommend reviewing these topics:
        </p>
        <div className="flex flex-wrap gap-2">
          {mockTopics.map((item, index) => (
            <Badge key={index} variant="outline" className="border-orange-500/30 bg-orange-500/10 text-orange-500">
              {item.topic} <span className="ml-1.5 opacity-70">({item.count} errors)</span>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
