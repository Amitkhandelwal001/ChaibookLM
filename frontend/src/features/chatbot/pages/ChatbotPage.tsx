import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { Send, Bot, User, Sparkles, RotateCcw, Copy, Check } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/chatbot/message';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Simple inline markdown renderer
const renderMarkdown = (text: string) => {
  const lines = text.split('\n');
  const result: JSX.Element[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      result.push(
        <pre key={i} className="bg-zinc-950 border border-white/10 rounded-xl p-4 my-3 overflow-x-auto text-sm font-mono text-emerald-300 relative group">
          {lang && <span className="absolute top-2 right-3 text-xs text-zinc-500">{lang}</span>}
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
    }
    // Heading
    else if (line.startsWith('### ')) {
      result.push(<h3 key={i} className="text-base font-semibold text-white mt-4 mb-1">{line.slice(4)}</h3>);
    } else if (line.startsWith('## ')) {
      result.push(<h2 key={i} className="text-lg font-bold text-white mt-4 mb-1">{line.slice(3)}</h2>);
    } else if (line.startsWith('# ')) {
      result.push(<h1 key={i} className="text-xl font-bold text-white mt-4 mb-2">{line.slice(2)}</h1>);
    }
    // Bullet list
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      result.push(
        <div key={i} className="flex gap-2 my-0.5">
          <span className="text-indigo-400 mt-1.5 text-xs">•</span>
          <span className="text-zinc-200 text-sm leading-relaxed">{inlineFormat(line.slice(2))}</span>
        </div>
      );
    }
    // Numbered list
    else if (/^\d+\. /.test(line)) {
      const num = line.match(/^(\d+)\. /)?.[1];
      result.push(
        <div key={i} className="flex gap-2 my-0.5">
          <span className="text-indigo-400 text-sm font-mono min-w-[18px]">{num}.</span>
          <span className="text-zinc-200 text-sm leading-relaxed">{inlineFormat(line.replace(/^\d+\. /, ''))}</span>
        </div>
      );
    }
    // Blank line
    else if (line.trim() === '') {
      result.push(<div key={i} className="h-2" />);
    }
    // Normal paragraph
    else {
      result.push(
        <p key={i} className="text-zinc-200 text-sm leading-relaxed">
          {inlineFormat(line)}
        </p>
      );
    }
    i++;
  }
  return result;
};

const inlineFormat = (text: string): React.ReactNode => {
  // Bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={idx} className="bg-zinc-800 text-emerald-300 px-1.5 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

const SUGGESTIONS = [
  "Explain quantum computing in simple terms",
  "Write a Python function to sort a list",
  "What are the key principles of machine learning?",
  "Help me understand recursion with an example",
];

export const ChatbotPage = () => {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const { data } = await axios.post(API_URL, { message: trimmed, history }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.data.reply };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '⚠️ Something went wrong. Please try again.' };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">KitbookLM AI</h1>
            <p className="text-xs text-zinc-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              Powered by GPT-4o mini
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-1">
        {messages.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full text-center gap-8 py-10">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/20 flex items-center justify-center">
              <Sparkles className="w-9 h-9 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">What can I help you with?</h2>
              <p className="text-zinc-500 text-sm">Ask me anything — I'm here to help you learn and explore.</p>
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
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-medium
                ${msg.role === 'user'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20'
                  : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                }`}>
                {msg.role === 'user'
                  ? (user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />)
                  : <Bot className="w-4 h-4" />}
              </div>

              {/* Bubble */}
              <div className={`group relative max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`rounded-2xl px-4 py-3 
                  ${msg.role === 'user'
                    ? 'bg-indigo-500/15 border border-indigo-500/20 text-zinc-200 text-sm rounded-tr-sm'
                    : 'bg-zinc-900/60 border border-white/5 rounded-tl-sm'
                  }`}>
                  {msg.role === 'user'
                    ? <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    : <div className="space-y-0.5">{renderMarkdown(msg.content)}</div>
                  }
                </div>

                {/* Copy button for AI messages */}
                {msg.role === 'assistant' && (
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

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
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
      <div className="pt-4 border-t border-white/5">
        <div className="relative flex items-end gap-3 bg-zinc-900/60 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-indigo-500/40 focus-within:bg-zinc-900/80 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message KitbookLM AI..."
            rows={1}
            className="flex-1 bg-transparent text-white text-sm placeholder-zinc-500 resize-none focus:outline-none max-h-40 leading-relaxed"
            style={{ height: 'auto' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
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
        <p className="text-center text-xs text-zinc-600 mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
};
