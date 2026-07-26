import { useQuery } from '@tanstack/react-query';
import { fetchDocumentsFn } from '../services/upload.api';
import { useAuthStore } from '../../../store/authStore';
import { FileText, FileImage, File } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const DocumentList = () => {
  const token = useAuthStore((state) => state.token);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['documents'],
    queryFn: () => fetchDocumentsFn(token!),
    enabled: !!token,
  });

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">Loading your files...</div>;
  if (isError) return <div className="py-8 text-center text-destructive">Error loading files.</div>;

  const documents = data?.data || [];

  if (documents.length === 0) {
    return (
      <div className="py-12 text-center border border-dashed rounded-xl border-border bg-card/20">
        <p className="text-muted-foreground">No files uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <Card key={doc.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-colors">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              {doc.type === 'IMAGE' ? <FileImage className="w-6 h-6" /> : doc.type === 'PDF' ? <FileText className="w-6 h-6" /> : <File className="w-6 h-6" />}
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="text-sm font-medium truncate">{doc.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {(doc.size / 1024 / 1024).toFixed(2)} MB • {new Date(doc.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
