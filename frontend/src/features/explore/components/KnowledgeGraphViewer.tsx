import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchKnowledgeGraphFn } from '../services/explore.api';
import { useAuthStore } from '../../../store/authStore';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { Loader2 } from 'lucide-react';

export const KnowledgeGraphViewer = () => {
  const token = useAuthStore((state) => state.token);
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const { data: graphData, isLoading } = useQuery({
    queryKey: ['knowledgeGraph'],
    queryFn: () => fetchKnowledgeGraphFn(token!),
    enabled: !!token,
  });

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    }

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        Generating your Knowledge Graph...
      </div>
    );
  }

  if (!graphData || !graphData.nodes || graphData.nodes.length <= 1) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 text-center px-4">
        <p>Not enough data to construct a graph.</p>
        <p className="text-sm mt-2">Upload more documents to see connections!</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative rounded-2xl overflow-hidden border border-white/5 bg-zinc-950">
      <div className="absolute top-4 left-4 z-10 bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-xl p-4 pointer-events-none">
        <h3 className="text-sm font-semibold text-white mb-2">Graph Legend</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#ef4444]"></span> PDF Documents</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#3b82f6]"></span> Image Documents</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#10b981]"></span> YouTube / Web</div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10"><span className="w-4 h-4 rounded-full bg-[#a855f7]"></span> Global Knowledge Base</div>
        </div>
      </div>

      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel="name"
        nodeColor="color"
        nodeRelSize={1}
        linkColor={() => 'rgba(255,255,255,0.1)'}
        linkWidth={1}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        d3VelocityDecay={0.3}
        onNodeClick={(node) => {
          // Center on clicked node
          if (fgRef.current && node.x !== undefined && node.y !== undefined) {
            fgRef.current.centerAt(node.x, node.y, 1000);
            fgRef.current.zoom(2, 2000);
          }
        }}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name as string;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          
          // Draw Node Circle
          ctx.beginPath();
          ctx.arc(node.x || 0, node.y || 0, (node.val as number) / 3, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color as string;
          ctx.fill();

          // Draw Label
          if (globalScale > 1) { // Only show text when zoomed in
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillText(label, node.x || 0, (node.y || 0) + (node.val as number) / 2 + fontSize);
          }
        }}
      />
    </div>
  );
};
