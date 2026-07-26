import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadFileFn } from '../services/upload.api';
import { useAuthStore } from '../../../store/authStore';
import { UploadCloud, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const UploadDropzone = () => {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (file: File) => uploadFileFn(file, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        mutation.mutate(acceptedFiles[0]);
      }
    },
    [mutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 50 * 1024 * 1024, // 50MB max per file
    multiple: false,
  });

  return (
    <div className="w-full">
      {mutation.isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {/* @ts-ignore */}
            {mutation.error?.response?.data?.message || 'Failed to upload file'}
          </AlertDescription>
        </Alert>
      )}
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-card/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-secondary rounded-full">
            <UploadCloud className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium">
              {mutation.isPending ? 'Uploading...' : 'Click or drag file to this area to upload'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Supports PDF, DOCX, TXT, Markdown, Images, SRT, VTT up to 50MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
