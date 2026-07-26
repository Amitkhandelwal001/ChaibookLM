import { useState, useEffect } from 'react';
import { Tldraw, Editor, getSnapshot, loadSnapshot, createTLStore } from 'tldraw';
import 'tldraw/tldraw.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWhiteboardsFn, fetchWhiteboardByIdFn, saveWhiteboardFn } from '../services/whiteboard.api';
import { useAuthStore } from '../../../store/authStore';
import { Button } from '@/components/ui/button';
import { Save, Plus, Loader2, LayoutDashboard } from 'lucide-react';

export const WhiteboardPage = () => {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [boardTitle, setBoardTitle] = useState('Untitled Whiteboard');
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const { data: whiteboards } = useQuery({
    queryKey: ['whiteboards'],
    queryFn: () => fetchWhiteboardsFn(token!),
    enabled: !!token,
  });

  const { data: activeBoard, isLoading: isBoardLoading } = useQuery({
    queryKey: ['whiteboard', activeBoardId],
    queryFn: () => fetchWhiteboardByIdFn(activeBoardId!, token!),
    enabled: !!token && !!activeBoardId,
  });

  const saveMutation = useMutation({
    mutationFn: (data: { title: string, content: any, id?: string }) => 
      saveWhiteboardFn(data.title, data.content, token!, data.id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['whiteboards'] });
      if (!activeBoardId) setActiveBoardId(data.id);
    }
  });

  // Load snapshot when active board changes
  useEffect(() => {
    if (editor && activeBoard?.data) {
      loadSnapshot(editor.store, activeBoard.data);
      setBoardTitle(activeBoard.title);
    }
  }, [editor, activeBoard]);

  const handleSave = () => {
    if (!editor) return;
    const snapshot = getSnapshot(editor.store);
    saveMutation.mutate({
      title: boardTitle,
      content: snapshot,
      id: activeBoardId || undefined
    });
  };

  const handleNewBoard = () => {
    setActiveBoardId(null);
    setBoardTitle('Untitled Whiteboard');
    if (editor) {
      const defaultStore = createTLStore();
      loadSnapshot(editor.store, getSnapshot(defaultStore));
    }
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col bg-zinc-950 text-white rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Toolbar */}
      <div className="h-16 border-b border-white/5 bg-zinc-900/50 flex items-center justify-between px-6 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <LayoutDashboard className="text-primary w-6 h-6" />
          <input 
            type="text" 
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            className="bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg font-semibold px-2 py-1 rounded"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            className="bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={activeBoardId || ''}
            onChange={(e) => setActiveBoardId(e.target.value || null)}
          >
            <option value="">-- Recent Whiteboards --</option>
            {whiteboards?.map((wb: any) => (
              <option key={wb.id} value={wb.id}>{wb.title}</option>
            ))}
          </select>
          
          <Button variant="secondary" onClick={handleNewBoard} className="gap-2">
            <Plus size={16} /> New
          </Button>
          
          <Button onClick={handleSave} disabled={saveMutation.isPending} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            {saveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save State
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        {isBoardLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 z-50">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-zinc-400">Loading Whiteboard...</p>
          </div>
        ) : null}
        
        {/* tldraw automatically takes full width/height of relative parent */}
        <Tldraw onMount={(editor) => setEditor(editor)} />
      </div>
    </div>
  );
};
