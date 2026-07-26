import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NotesViewerProps {
  content: string;
}

export const NotesViewer = ({ content }: NotesViewerProps) => {
  if (!content) {
    return (
      <div className="text-zinc-500 text-center py-20">
        No notes available.
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-8 overflow-y-auto max-h-[600px]">
      <article className="prose prose-invert prose-zinc max-w-none prose-headings:text-primary prose-a:text-primary">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
};
