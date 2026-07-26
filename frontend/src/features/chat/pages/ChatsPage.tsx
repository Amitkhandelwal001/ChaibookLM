import { useState } from 'react';
import { ChatWindow } from '../components/ChatWindow';
import { DocumentFilter } from '../components/DocumentFilter';

export const ChatsPage = () => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | undefined>();

  return (
    <div className="p-8 h-[calc(100vh-2rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">Chat with Knowledge</h1>
        <p className="text-zinc-400 mt-2">
          Ask questions and get answers based on your uploaded documents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100%-6rem)]">
        {/* Document Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1 h-full">
          <DocumentFilter
            selectedId={selectedDocumentId}
            onSelect={setSelectedDocumentId}
          />
        </div>

        {/* Main Chat Window */}
        <div className="col-span-1 lg:col-span-3 h-full">
          <ChatWindow documentId={selectedDocumentId} />
        </div>
      </div>
    </div>
  );
};
