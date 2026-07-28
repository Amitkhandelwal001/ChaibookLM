import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, MessageSquare, Compass, Calendar, BookOpen, LogOut, FileText, PenTool, Video } from 'lucide-react';

export const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Uploads', href: '/uploads', icon: FileText },
    { name: 'AI Chat', href: '/chat', icon: MessageSquare },
    { name: 'Study Notes', href: '/notes', icon: BookOpen },
    { name: 'Video Highlights', href: '/video', icon: Video },
    { name: 'Explore', href: '/explore', icon: Compass },
    { name: 'Whiteboard', href: '/whiteboard', icon: PenTool },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/30 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground">
            K
          </div>
          <span className="text-xl font-semibold tracking-tight">KitbookLM</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link key={item.name} to={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={`w-full justify-start gap-3 ${isActive ? 'bg-secondary/50 font-medium' : 'text-muted-foreground'}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground mt-2" onClick={logout}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
        
        {/* Mobile Header Placeholder */}
        <header className="h-16 border-b border-border flex items-center px-6 md:hidden">
          <span className="text-lg font-semibold">KitbookLM</span>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 md:p-8 z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
