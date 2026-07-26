import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { ChatWindow } from '../components/ChatWindow';
import { DocumentFilter } from '../components/DocumentFilter';

export const ChatsPage = () => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | undefined>(undefined);

  return (
    <div className="flex h-[calc(100vh-2rem)] p-4 gap-4">
      {/* Left sidebar: Document filter */}
      <div className="w-64 flex-shrink-0">
        <DocumentFilter selectedId={selectedDocumentId} onSelect={setSelectedDocumentId} />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-primary" />
            AI Chat
            {selectedDocumentId && (
              <span className="text-sm font-normal text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                Focused on 1 document
              </span>
            )}
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            {selectedDocumentId
              ? 'Chatting with a specific document.'
              : 'Chatting with your entire knowledge base.'}
          </p>
        </div>

        <div className="flex-1 min-h-0">
          <ChatWindow documentId={selectedDocumentId} />
        </div>
      </div>
    </div>
  );
};
