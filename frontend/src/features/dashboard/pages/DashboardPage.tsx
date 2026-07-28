import { useAuthStore } from '../../../store/authStore';
import { useNavigate } from 'react-router-dom';
import {
  Upload, BookOpen, Video, Compass, PenTool, Calendar, MessageSquare,
  ArrowRight
} from 'lucide-react';

const FEATURES = [
  {
    icon: Upload,
    label: 'Uploads',
    description: 'Add PDFs, docs & files to your knowledge base',
    href: '/uploads',
    color: 'from-blue-500/20 to-blue-600/10',
    iconColor: 'text-blue-400',
    border: 'border-blue-500/20 hover:border-blue-500/40',
  },
  {
    icon: MessageSquare,
    label: 'AI Chat',
    description: 'Ask anything and get instant AI answers',
    href: '/chat',
    color: 'from-indigo-500/20 to-purple-600/10',
    iconColor: 'text-indigo-400',
    border: 'border-indigo-500/20 hover:border-indigo-500/40',
  },
  {
    icon: BookOpen,
    label: 'Study Notes',
    description: 'Generate notes & flashcards from your documents',
    href: '/notes',
    color: 'from-violet-500/20 to-violet-600/10',
    iconColor: 'text-violet-400',
    border: 'border-violet-500/20 hover:border-violet-500/40',
  },
  {
    icon: Video,
    label: 'Video Highlights',
    description: 'Extract key moments from educational videos',
    href: '/video',
    color: 'from-rose-500/20 to-rose-600/10',
    iconColor: 'text-rose-400',
    border: 'border-rose-500/20 hover:border-rose-500/40',
  },
  {
    icon: Compass,
    label: 'Explore',
    description: 'Discover curated learning resources',
    href: '/explore',
    color: 'from-amber-500/20 to-amber-600/10',
    iconColor: 'text-amber-400',
    border: 'border-amber-500/20 hover:border-amber-500/40',
  },
  {
    icon: PenTool,
    label: 'Whiteboard',
    description: 'Sketch ideas and diagrams freely',
    href: '/whiteboard',
    color: 'from-emerald-500/20 to-emerald-600/10',
    iconColor: 'text-emerald-400',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
  },
  {
    icon: Calendar,
    label: 'Calendar',
    description: 'Track your study schedule and activities',
    href: '/calendar',
    color: 'from-cyan-500/20 to-cyan-600/10',
    iconColor: 'text-cyan-400',
    border: 'border-cyan-500/20 hover:border-cyan-500/40',
  },
];

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const firstName = user?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Hero greeting */}
      <div className="relative pt-4">
        {/* Glow backdrop */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-40 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative text-center py-12">
          {/* Avatar initial */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-5 shadow-lg shadow-indigo-500/20">
            {firstName.charAt(0).toUpperCase()}
          </div>

          <h1 className="text-4xl font-bold text-white tracking-tight">
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{firstName}</span>! 👋
          </h1>
          <p className="text-zinc-500 mt-3 text-lg max-w-md mx-auto">
            Ready to learn something new today? Pick a tool to get started.
          </p>

          {/* Quick action */}
          <button
            onClick={() => navigate('/chat')}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            Start chatting with AI
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feature grid */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-5">Your Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.label}
                onClick={() => navigate(feature.href)}
                className={`group text-left p-5 rounded-2xl border bg-gradient-to-br ${feature.color} ${feature.border} transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20`}
              >
                <div className={`w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center mb-4 ${feature.iconColor} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{feature.label}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{feature.description}</p>
                <div className={`mt-3 text-xs ${feature.iconColor} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                  Open <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
