import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const mockProgress = [
  { course: 'Advanced React Patterns', progress: 78 },
  { course: 'System Design Interview', progress: 45 },
  { course: 'GraphQL Masterclass', progress: 92 },
];

export const LearningProgressWidget = () => {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Learning Progress</CardTitle>
        <Target className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-5 mt-2">
          {mockProgress.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium truncate pr-4">{item.course}</span>
                <span className="text-muted-foreground">{item.progress}%</span>
              </div>
              <Progress value={item.progress} className="h-1.5" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
