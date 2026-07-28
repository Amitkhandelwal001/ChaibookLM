import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadFileFn } from '../services/upload.api';
import { useAuthStore } from '../../../store/authStore';
import { UploadCloud, CheckCircle2, XCircle, FileText, FileImage, File } from 'lucide-react';

const getFileIcon = (mimeType: string) => {
  if (mimeType?.startsWith('image/')) return <FileImage className="w-6 h-6 text-blue-400" />;
  if (mimeType === 'application/pdf') return <FileText className="w-6 h-6 text-red-400" />;
  return <File className="w-6 h-6 text-indigo-400" />;
};

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

export const UploadDropzone = () => {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: (file: File) => uploadFileFn(file, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setTimeout(() => setSelectedFile(null), 2000);
    },
    onError: () => {
      setTimeout(() => setSelectedFile(null), 3000);
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        mutation.mutate(file);
      }
    },
    [mutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 50 * 1024 * 1024,
    multiple: false,
    disabled: mutation.isPending,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
          ${mutation.isPending ? 'cursor-not-allowed opacity-80' : ''}
          ${isDragActive
            ? 'border-indigo-500 bg-indigo-500/5 scale-[1.01]'
            : mutation.isSuccess
            ? 'border-emerald-500/50 bg-emerald-500/5'
            : mutation.isError
            ? 'border-red-500/50 bg-red-500/5'
            : 'border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 bg-zinc-900/30'
          }`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center gap-4">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
            ${mutation.isSuccess ? 'bg-emerald-500/20' : mutation.isError ? 'bg-red-500/20' : 'bg-indigo-500/10'}`}>
            {mutation.isSuccess
              ? <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              : mutation.isError
              ? <XCircle className="w-7 h-7 text-red-400" />
              : <UploadCloud className={`w-7 h-7 ${isDragActive ? 'text-indigo-400 animate-bounce' : 'text-indigo-400'}`} />
            }
          </div>

          {/* File preview while uploading */}
          {selectedFile && mutation.isPending && (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-zinc-800/60 rounded-xl border border-white/10">
              {getFileIcon(selectedFile.type)}
              <div className="text-left">
                <p className="text-sm font-medium text-white truncate max-w-[200px]">{selectedFile.name}</p>
                <p className="text-xs text-zinc-500">{formatSize(selectedFile.size)}</p>
              </div>
            </div>
          )}

          {/* Main text */}
          <div>
            {mutation.isPending ? (
              <>
                <p className="text-base font-semibold text-white">Uploading & processing...</p>
                <p className="text-sm text-zinc-500 mt-1">Extracting text and building your knowledge base</p>
                {/* Progress bar */}
                <div className="mt-3 w-48 h-1.5 bg-zinc-800 rounded-full overflow-hidden mx-auto">
                  <div className="h-full bg-indigo-500 rounded-full animate-pulse w-2/3" />
                </div>
              </>
            ) : mutation.isSuccess ? (
              <>
                <p className="text-base font-semibold text-emerald-400">Upload complete!</p>
                <p className="text-sm text-zinc-500 mt-1">Your file has been added to your knowledge base</p>
              </>
            ) : mutation.isError ? (
              <>
                <p className="text-base font-semibold text-red-400">Upload failed</p>
                <p className="text-sm text-zinc-500 mt-1">
                  {(mutation.error as any)?.response?.data?.message || 'Please try again'}
                </p>
              </>
            ) : (
              <>
                <p className="text-base font-semibold text-white">
                  {isDragActive ? 'Drop your file here' : 'Click or drag a file to upload'}
                </p>
                <p className="text-sm text-zinc-500 mt-1">
                  PDF, DOCX, TXT, Markdown, Images up to 50MB
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
