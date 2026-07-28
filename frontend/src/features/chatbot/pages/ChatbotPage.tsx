import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import {
  Send, Bot, User, Sparkles, RotateCcw, Copy, Check,
  Plus, Trash2, MessageSquare, ChevronLeft, Loader2, Menu, X
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/chatbot';

interface DBMessage {
  id: string;
  role: 'USER' | 'AI';
  content: string;
  chatId: string;
  createdAt: string;
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: { content: string; role: string }[];
}

// ─── Inline Markdown Renderer ───────────────────────────────────────────────
const inlineFormat = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={idx} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={idx} className="bg-zinc-800 text-emerald-300 px-1.5 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
    return part;
  });
};

const renderMarkdown = (text: string) => {
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) { code.push(lines[i]); i++; }
      result.push(
        <pre key={i} className="bg-zinc-950 border border-white/10 rounded-xl p-4 my-2 overflow-x-auto text-sm font-mono text-emerald-300 relative">
          {lang && <span className="absolute top-2 right-3 text-xs text-zinc-500">{lang}</span>}
          <code>{code.join('\n')}</code>
        </pre>
      );
    } else if (line.startsWith('### ')) {
      result.push(<h3 key={i} className="text-base font-semibold text-white mt-3 mb-1">{line.slice(4)}</h3>);
    } else if (line.startsWith('## ')) {
      result.push(<h2 key={i} className="text-lg font-bold text-white mt-3 mb-1">{line.slice(3)}</h2>);
    } else if (line.startsWith('# ')) {
      result.push(<h1 key={i} className="text-xl font-bold text-white mt-3 mb-2">{line.slice(2)}</h1>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      result.push(<div key={i} className="flex gap-2 my-0.5"><span className="text-indigo-400 mt-1.5 text-xs">•</span><span className="text-zinc-200 text-sm leading-relaxed">{inlineFormat(line.slice(2))}</span></div>);
    } else if (/^\d+\. /.test(line)) {
      const num = line.match(/^(\d+)\. /)?.[1];
      result.push(<div key={i} className="flex gap-2 my-0.5"><span className="text-indigo-400 text-sm font-mono min-w-[18px]">{num}.</span><span className="text-zinc-200 text-sm leading-relaxed">{inlineFormat(line.replace(/^\d+\. /, ''))}</span></div>);
    } else if (line.trim() === '') {
      result.push(<div key={i} className="h-1.5" />);
    } else {
      result.push(<p key={i} className="text-zinc-200 text-sm leading-relaxed">{inlineFormat(line)}</p>);
    }
    i++;
  }
  return result;
};

// ─── Suggestion Prompts ───────────────────────────────────────────────────────
const SUGGESTIONS = [
  "Explain quantum computing simply",
  "Write a Python function to sort a list",
  "What are key machine learning principles?",
  "Help me understand recursion with an example",
];

// ─── Time formatter ────────────────────────────────────────────────────────────
const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ─── Main Component ────────────────────────────────────────────────────────────
export const ChatbotPage = () => {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat list
  const { data: chatsData, isLoading: chatsLoading } = useQuery({
    queryKey: ['chatbot-chats'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/chats`, { headers: { Authorization: `Bearer ${token}` } });
      return data.data as ChatSession[];
    },
    enabled: !!token,
  });

  const chats = chatsData || [];

  // Load selected chat messages
  const loadChat = async (chatId: string) => {
    setActiveChatId(chatId);
    setMessages([]);
    try {
      const { data } = await axios.get(`${API_URL}/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(data.data.messages);
    } catch {
      setMessages([]);
    }
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const deleteChatMutation = useMutation({
    mutationFn: async (chatId: string) => {
      await axios.delete(`${API_URL}/chats/${chatId}`, { headers: { Authorization: `Bearer ${token}` } });
    },
    onSuccess: (_, chatId) => {
      queryClient.invalidateQueries({ queryKey: ['chatbot-chats'] });
      if (activeChatId === chatId) {
        setActiveChatId(null);
        setMessages([]);
      }
    },
  });

  const startNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setInput('');
    inputRef.current?.focus();
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const tempUserMsg: DBMessage = {
      id: `temp-${Date.now()}`,
      role: 'USER',
      content: trimmed,
      chatId: activeChatId || '',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await axios.post(
        `${API_URL}/message`,
        { message: trimmed, chatId: activeChatId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { chatId, userMessage, aiMessage } = data.data;

      // Update messages with real DB records
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        userMessage,
        aiMessage,
      ]);
      setActiveChatId(chatId);
      queryClient.invalidateQueries({ queryKey: ['chatbot-chats'] });
    } catch (err: any) {
      const errMsg: DBMessage = {
        id: `err-${Date.now()}`,
        role: 'AI',
        content: '⚠️ Something went wrong. Please try again.',
        chatId: activeChatId || '',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex h-[calc(100vh-80px)] -m-6 md:-m-8 overflow-hidden">

      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} flex-shrink-0 transition-all duration-300 overflow-hidden bg-zinc-950/60 border-r border-white/5 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <span className="text-sm font-semibold text-zinc-300">Conversations</span>
          <button
            onClick={startNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium transition-colors border border-indigo-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
          {chatsLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-zinc-900/40 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : chats.length === 0 ? (
            <div className="py-8 text-center text-zinc-600 text-xs px-4">
              No conversations yet.<br />Start a new chat below!
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => loadChat(chat.id)}
                className={`group w-full text-left px-3 py-3 rounded-xl cursor-pointer transition-all flex items-start gap-2
                  ${activeChatId === chat.id
                    ? 'bg-indigo-500/10 border border-indigo-500/20'
                    : 'hover:bg-zinc-800/50 border border-transparent'
                  }`}
              >
                <MessageSquare className={`w-4 h-4 flex-shrink-0 mt-0.5 ${activeChatId === chat.id ? 'text-indigo-400' : 'text-zinc-600'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${activeChatId === chat.id ? 'text-white' : 'text-zinc-300'}`}>
                    {chat.title}
                  </p>
                  <p className="text-xs text-zinc-600 mt-0.5">{timeAgo(chat.updatedAt)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteChatMutation.mutate(chat.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-red-400 flex-shrink-0 p-0.5"
                >
                  {deleteChatMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Chat Area ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-zinc-950/30 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-white">KitbookLM AI</h1>
            <p className="text-xs text-zinc-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              GPT-4o mini · {activeChatId ? 'Conversation saved' : 'New conversation'}
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={startNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              New
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-8 py-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/20 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">What can I help you with?</h2>
                <p className="text-zinc-500 text-sm">Your conversations are saved automatically.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-left p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all text-sm text-zinc-400 hover:text-zinc-200 group"
                  >
                    <span className="text-indigo-400 mr-2 group-hover:text-indigo-300">→</span>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'USER' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-semibold
                  ${msg.role === 'USER'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                  }`}>
                  {msg.role === 'USER' ? (user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />) : <Bot className="w-4 h-4" />}
                </div>

                <div className={`group relative max-w-[80%] flex flex-col ${msg.role === 'USER' ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-2xl px-4 py-3
                    ${msg.role === 'USER'
                      ? 'bg-indigo-500/15 border border-indigo-500/20 rounded-tr-sm'
                      : 'bg-zinc-900/60 border border-white/5 rounded-tl-sm'
                    }`}>
                    {msg.role === 'USER'
                      ? <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      : <div className="space-y-0.5">{renderMarkdown(msg.content)}</div>
                    }
                  </div>

                  {msg.role === 'AI' && (
                    <button
                      onClick={() => copyMessage(msg.id, msg.content)}
                      className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedId === msg.id ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-zinc-900/60 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center h-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 md:px-8 pb-4 pt-3 border-t border-white/5 flex-shrink-0">
          <div className="relative flex items-end gap-3 bg-zinc-900/60 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-indigo-500/40 focus-within:bg-zinc-900/80 transition-all max-w-4xl mx-auto">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message KitbookLM AI..."
              rows={1}
              className="flex-1 bg-transparent text-white text-sm placeholder-zinc-500 resize-none focus:outline-none max-h-40 leading-relaxed"
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = 'auto';
                t.style.height = `${t.scrollHeight}px`;
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95"
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          <p className="text-center text-xs text-zinc-600 mt-2">Enter to send · Shift+Enter for new line · Conversations auto-saved</p>
        </div>
      </div>
    </div>
  );
};
