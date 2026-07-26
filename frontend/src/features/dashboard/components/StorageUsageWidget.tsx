import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '../../../store/authStore';
import { Database } from 'lucide-react';

export const StorageUsageWidget = () => {
  const user = useAuthStore((state) => state.user);
  
  // Convert bytes to MB (mocking it if it's 0)
  const usedMB = user?.storageUsed ? (user.storageUsed / (1024 * 1024)).toFixed(1) : '45.2';
  const limitMB = 100;
  const percentage = (Number(usedMB) / limitMB) * 100;

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Storage Usage</CardTitle>
        <Database className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">
          {usedMB} MB <span className="text-sm font-normal text-muted-foreground">/ {limitMB} MB</span>
        </div>
        <Progress value={percentage} className="h-2" />
        <p className="text-xs text-muted-foreground mt-3 flex items-center justify-between">
          <span>{percentage.toFixed(0)}% Used</span>
          {percentage >= 90 && <span className="text-destructive font-medium">Approaching Limit</span>}
        </p>
      </CardContent>
    </Card>
  );
};
