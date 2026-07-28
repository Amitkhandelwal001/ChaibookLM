import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDocumentsFn, deleteDocumentFn } from '../services/upload.api';
import { useAuthStore } from '../../../store/authStore';
import { Document } from '../types';
import {
  FileText, FileImage, File, Trash2, Eye, Loader2,
  AlertTriangle, X, Clock, HardDrive
} from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

const getFileIcon = (type: string, title: string) => {
  if (type === 'IMAGE') return <FileImage className="w-6 h-6 text-blue-400" />;
  if (title?.toLowerCase().endsWith('.pdf')) return <FileText className="w-6 h-6 text-red-400" />;
  if (title?.toLowerCase().endsWith('.docx') || title?.toLowerCase().endsWith('.doc'))
    return <FileText className="w-6 h-6 text-blue-500" />;
  return <File className="w-6 h-6 text-indigo-400" />;
};

const getFileBg = (type: string, title: string) => {
  if (type === 'IMAGE') return 'bg-blue-500/10 border-blue-500/20';
  if (title?.toLowerCase().endsWith('.pdf')) return 'bg-red-500/10 border-red-500/20';
  if (title?.toLowerCase().endsWith('.docx')) return 'bg-blue-500/10 border-blue-500/20';
  return 'bg-indigo-500/10 border-indigo-500/20';
};

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// Confirm delete modal
const DeleteModal = ({
  doc,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  doc: Document;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Delete Document?</h3>
          <p className="text-sm text-zinc-400 mt-1">
            "<span className="text-zinc-200">{doc.title}</span>" will be permanently deleted along with all its AI-generated data.
          </p>
        </div>
        <button onClick={onCancel} className="text-zinc-500 hover:text-white ml-auto flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 border border-white/10 hover:bg-zinc-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-400 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

export const DocumentList = () => {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<Document | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['documents'],
    queryFn: () => fetchDocumentsFn(token!),
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocumentFn(id, token!),
    onMutate: (id) => setDeletingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setDeletingId(null);
      setConfirmDelete(null);
    },
    onError: (err) => {
      console.error('Delete failed:', err);
      setDeletingId(null);
      setConfirmDelete(null);
    },
  });

  const handleView = (doc: Document) => {
    // Open the view endpoint in new tab — the backend serves/redirects the file
    const viewUrl = `${API_URL}/upload/view/${doc.id}`;
    // We need to include the auth token — open via a temporary anchor with auth header won't work,
    // so we open the Cloudinary URL directly if available, else show the filename
    if (doc.url && (doc.url.startsWith('http://') || doc.url.startsWith('https://'))) {
      window.open(doc.url, '_blank');
    } else {
      // For local files, open the backend served URL
      // The backend view endpoint handles auth via query param or redirect
      window.open(`${API_URL}/upload/view/${doc.id}?token=${token}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-zinc-900/40 rounded-2xl border border-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-10 text-center text-red-400 bg-red-500/5 rounded-2xl border border-red-500/20">
        Failed to load documents. Please refresh the page.
      </div>
    );
  }

  const documents: Document[] = data?.data || [];

  if (documents.length === 0) {
    return (
      <div className="py-16 text-center bg-zinc-900/20 rounded-2xl border border-dashed border-white/10">
        <File className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
        <p className="text-zinc-400 font-medium">No files uploaded yet</p>
        <p className="text-zinc-600 text-sm mt-1">Upload a file above to get started</p>
      </div>
    );
  }

  return (
    <>
      {confirmDelete && (
        <DeleteModal
          doc={confirmDelete}
          onConfirm={() => deleteMutation.mutate(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
          isDeleting={deletingId === confirmDelete.id}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="group relative flex flex-col gap-3 p-4 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-white/10 hover:bg-zinc-900/70 transition-all duration-200"
          >
            {/* Top row: icon + filename */}
            <div className="flex items-start gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${getFileBg(doc.type, doc.title)}`}>
                {getFileIcon(doc.type, doc.title)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white truncate leading-tight">{doc.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 text-xs text-zinc-500">
                    <HardDrive className="w-3 h-3" />
                    {formatSize(doc.size)}
                  </span>
                  <span className="text-zinc-700">·</span>
                  <span className="flex items-center gap-1 text-xs text-zinc-500">
                    <Clock className="w-3 h-3" />
                    {formatDate(doc.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom row: always-visible action buttons */}
            <div className="flex gap-2 pt-2 border-t border-white/5">
              <button
                onClick={() => handleView(doc)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 bg-zinc-800/60 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                View
              </button>
              <button
                onClick={() => setConfirmDelete(doc)}
                disabled={deletingId === doc.id}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 bg-red-400/5 hover:bg-red-400/15 border border-red-400/10 hover:border-red-400/30 transition-colors disabled:opacity-50"
              >
                {deletingId === doc.id
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Trash2 className="w-3.5 h-3.5" />
                }
                {deletingId === doc.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
