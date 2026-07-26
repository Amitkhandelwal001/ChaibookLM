import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDocumentsFn } from '../../uploads/services/upload.api';
import { useAuthStore } from '../../../store/authStore';
import { FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentFilterProps {
  selectedId?: string;
  onSelect: (id?: string) => void;
}

export const DocumentFilter: React.FC<DocumentFilterProps> = ({ selectedId, onSelect }) => {
  const token = useAuthStore((state) => state.token);

  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: () => fetchDocumentsFn(token!),
    enabled: !!token,
  });

  return (
    <div className="flex flex-col h-full bg-zinc-950/40 backdrop-blur-md rounded-2xl border border-white/5 p-4 overflow-hidden">
      <h3 className="text-zinc-200 font-medium mb-4 px-2">Chat Context</h3>
      
      <div className="flex-1 overflow-y-auto space-y-2">
        <Button
          variant={!selectedId ? 'secondary' : 'ghost'}
          className="w-full justify-start font-normal text-zinc-300"
          onClick={() => onSelect(undefined)}
        >
          All Knowledge Base
        </Button>

        <div className="my-2 border-t border-white/5" />

        {documents?.data?.map((doc: any) => (
          <Button
            key={doc.id}
            variant={selectedId === doc.id ? 'secondary' : 'ghost'}
            className="w-full justify-start font-normal text-sm text-zinc-400 hover:text-zinc-200"
            onClick={() => onSelect(doc.id)}
          >
            {doc.type === 'IMAGE' ? (
              <ImageIcon className="w-4 h-4 mr-2 opacity-70" />
            ) : (
              <FileText className="w-4 h-4 mr-2 opacity-70" />
            )}
            <span className="truncate">{doc.title}</span>
          </Button>
        ))}

        {documents?.data?.length === 0 && (
          <div className="text-xs text-zinc-500 px-2 py-4 text-center">
            Upload documents to chat with specific files.
          </div>
        )}
      </div>
    </div>
  );
};
