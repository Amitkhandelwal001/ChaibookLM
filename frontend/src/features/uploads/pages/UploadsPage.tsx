import { UploadDropzone } from '../components/UploadDropzone';
import { DocumentList } from '../components/DocumentList';
import { Separator } from '@/components/ui/separator';

export const UploadsPage = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-muted-foreground mt-1">
          Upload PDFs, websites, or YouTube links to add to your AI learning context.
        </p>
      </div>

      <UploadDropzone />
      
      <div className="pt-4">
        <h2 className="text-xl font-semibold tracking-tight mb-4">Your Resources</h2>
        <Separator className="mb-6" />
        <DocumentList />
      </div>
    </div>
  );
};
