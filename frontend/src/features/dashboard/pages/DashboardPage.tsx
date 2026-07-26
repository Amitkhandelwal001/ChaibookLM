import { useAuthStore } from '../../../store/authStore';
import { StorageUsageWidget } from '../components/StorageUsageWidget';
import { RecentActivityWidget } from '../components/RecentActivityWidget';
import { LearningProgressWidget } from '../components/LearningProgressWidget';
import { RecommendationsWidget } from '../components/RecommendationsWidget';
import { WeakTopicsWidget } from '../components/WeakTopicsWidget';

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground mt-1">Here is an overview of your learning progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RecommendationsWidget />
        <StorageUsageWidget />
        <LearningProgressWidget />
        <WeakTopicsWidget />
        <RecentActivityWidget />
      </div>
    </div>
  );
};
