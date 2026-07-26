import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { sendChatMessage } from '../services/chat.api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, User, Bot, Loader2, GitBranch, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  role: 'USER' | 'AI';
  content: string;
  parentId: string | null;
  createdAt: string;
}

interface ChatWindowProps {
  documentId?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ documentId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [currentLeafId, setCurrentLeafId] = useState<string | null>(null);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const token = useAuthStore((state) => state.token);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Compute the active branch (path from root to currentLeafId)
  const activeBranch = useMemo(() => {
    if (!currentLeafId || messages.length === 0) return [];
    
    const branch: Message[] = [];
    let currentId: string | null = currentLeafId;
    
    while (currentId) {
      const msg = messages.find(m => m.id === currentId);
      if (!msg) break;
      branch.unshift(msg);
      currentId = msg.parentId;
    }
    
    return branch;
  }, [messages, currentLeafId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeBranch, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || !token) return;

    const userTempId = `temp-${Date.now()}`;
    const userMessage: Message = { 
      id: userTempId, 
      role: 'USER', 
      content: input,
      parentId: currentLeafId,
      createdAt: new Date().toISOString()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setCurrentLeafId(userTempId);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(
        userMessage.content, 
        token, 
        documentId, 
        chatId || undefined, 
        currentLeafId || undefined
      );
      
      const { userMessage: dbUserMsg, aiMessage: dbAiMsg, chatId: newChatId } = response.data;
      
      setChatId(newChatId);
      
      setMessages((prev) => {
        // Replace temp user message with real one from DB, and add AI message
        const filtered = prev.filter(m => m.id !== userTempId);
        return [...filtered, dbUserMsg, dbAiMsg];
      });
      setCurrentLeafId(dbAiMsg.id);

    } catch (error) {
      console.error('Failed to send message', error);
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: 'AI',
        content: '**Error:** Failed to get response from server. Please try again.',
        parentId: userTempId,
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMessage]);
      setCurrentLeafId(errorMessage.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Helper to find the deepest leaf node from a given starting point
  const findDeepestLeaf = (startId: string) => {
    let current = startId;
    while (true) {
      const children = messages.filter(m => m.parentId === current).sort((a,b) => a.createdAt.localeCompare(b.createdAt));
      if (children.length === 0) break;
      current = children[children.length - 1].id;
    }
    return current;
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative">
      
      {/* Branching Hint overlay */}
      {messages.length > 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-primary/20 border border-primary/30 text-primary px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 backdrop-blur-md z-10 shadow-lg">
          <GitBranch size={14} />
          Branching Active
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 pt-16">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
            <Bot size={48} className="text-zinc-700" />
            <p>Hello! I'm KitbookLM. Ask me anything about your documents.</p>
          </div>
        )}

        {activeBranch.map((msg) => {
          // Find if this message has multiple branches originating from its parent
          // Actually, we want to show branching for THIS message's children
          const children = messages.filter(m => m.parentId === msg.id).sort((a,b) => a.createdAt.localeCompare(b.createdAt));
          
          // Find which child is in the current active branch
          const activeChildIndex = children.findIndex(c => activeBranch.some(ab => ab.id === c.id));

          return (
            <div key={msg.id} className="flex flex-col gap-2">
              <div className={`flex items-start gap-4 ${msg.role === 'USER' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'USER' ? 'bg-primary/20 text-primary' : 'bg-zinc-800 text-zinc-400'}`}>
                  {msg.role === 'USER' ? <User size={16} /> : <Bot size={16} />}
                </div>
                
                <div className={`flex flex-col gap-1 ${msg.role === 'USER' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                  <div
                    className={`rounded-2xl px-5 py-4 ${
                      msg.role === 'USER'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-zinc-900/60 text-zinc-200 border border-white/5'
                    }`}
                  >
                    <div className={`prose prose-sm dark:prose-invert max-w-none ${msg.role === 'USER' ? 'text-primary-foreground' : ''}`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                  
                  {/* Branch Navigation UI */}
                  {children.length > 1 && activeChildIndex !== -1 && (
                    <div className="flex items-center gap-3 mt-1 bg-zinc-900/50 rounded-full px-3 py-1 border border-white/5">
                      <button 
                        disabled={activeChildIndex === 0}
                        onClick={() => setCurrentLeafId(findDeepestLeaf(children[activeChildIndex - 1].id))}
                        className="text-zinc-500 hover:text-white disabled:opacity-30 transition-colors"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="text-xs text-zinc-400 font-medium">
                        {activeChildIndex + 1} / {children.length}
                      </span>
                      <button 
                        disabled={activeChildIndex === children.length - 1}
                        onClick={() => setCurrentLeafId(findDeepestLeaf(children[activeChildIndex + 1].id))}
                        className="text-zinc-500 hover:text-white disabled:opacity-30 transition-colors"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-zinc-800 text-zinc-400">
              <Bot size={16} />
            </div>
            <div className="bg-zinc-900/60 rounded-2xl px-5 py-4 border border-white/5 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              <span className="text-zinc-400 text-sm">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 bg-zinc-950/80 border-t border-white/5">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeBranch.length > 0 ? "Ask a follow up to continue this branch..." : "Ask a question about your documents..."}
            className="w-full bg-zinc-900/50 border border-white/10 rounded-full py-4 pl-6 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-zinc-200 placeholder-zinc-500"
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 rounded-full w-10 h-10 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
