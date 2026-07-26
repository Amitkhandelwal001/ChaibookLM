import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, FileText, MessageSquare, Mic } from 'lucide-react';

const mockActivities = [
  { id: 1, type: 'upload', title: 'React Performance Guide.pdf', time: '2 hours ago', icon: FileText, color: 'text-blue-500' },
  { id: 2, type: 'chat', title: 'Discussing React Hooks', time: '5 hours ago', icon: MessageSquare, color: 'text-green-500' },
  { id: 3, type: 'podcast', title: 'Intro to System Design', time: 'Yesterday', icon: Mic, color: 'text-purple-500' },
  { id: 4, type: 'upload', title: 'MERN Stack Architecture.png', time: 'Yesterday', icon: FileText, color: 'text-blue-500' },
];

export const RecentActivityWidget = () => {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 col-span-1 md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Recent Activity</CardTitle>
        <Activity className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-2">
          {mockActivities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-center gap-4">
                <div className={`p-2 rounded-md bg-secondary ${activity.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
