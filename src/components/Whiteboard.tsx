import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Line, Text as KonvaText } from 'react-konva';
import { 
  Square, 
  Circle, 
  Type, 
  Eraser, 
  PenTool, 
  Undo, 
  Redo, 
  Trash2, 
  Highlighter,
  ChevronDown
} from 'lucide-react';
import { nanoid } from 'nanoid';
import { cn } from '../lib/utils';

export type Tool = 'pen' | 'highlighter' | 'eraser' | 'text' | 'select';

export interface Stroke {
  id: string;
  type: Tool;
  points: number[];
  color: string;
  strokeWidth: number;
  opacity: number;
  text?: string;
  x?: number;
  y?: number;
}

interface WhiteboardProps {
  strokes: Stroke[];
  onAddStroke: (stroke: Stroke) => void;
  onClear: () => void;
  readOnly?: boolean;
}

const COLORS = [
  '#000000', // Black
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#6366f1', // Indigo
];

const STROKE_WIDTHS = [2, 4, 8, 12];

export default function Whiteboard({ strokes, onAddStroke, onClear, readOnly = false }: WhiteboardProps) {
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState(COLORS[0]);
  const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTHS[1]);
  const isDrawing = useRef(false);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight - 100 });

  useEffect(() => {
    const handleResize = () => {
      setStageSize({ width: window.innerWidth, height: window.innerHeight - 100 });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: any) => {
    if (readOnly || tool === 'select') return;
    
    const pos = e.target.getStage().getPointerPosition();
    isDrawing.current = true;

    if (tool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        onAddStroke({
          id: nanoid(),
          type: 'text',
          points: [],
          color,
          strokeWidth: 1,
          opacity: 1,
          text,
          x: pos.x,
          y: pos.y
        });
      }
      isDrawing.current = false;
      return;
    }

    setCurrentStroke({
      id: nanoid(),
      type: tool,
      points: [pos.x, pos.y],
      color: tool === 'eraser' ? '#ffffff' : color,
      strokeWidth: tool === 'eraser' ? 20 : strokeWidth,
      opacity: tool === 'highlighter' ? 0.35 : 1,
    });
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current || !currentStroke || readOnly) return;

    const pos = e.target.getStage().getPointerPosition();
    setCurrentStroke({
      ...currentStroke,
      points: [...currentStroke.points, pos.x, pos.y],
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing.current || !currentStroke || readOnly) return;
    isDrawing.current = false;
    onAddStroke(currentStroke);
    setCurrentStroke(null);
  };

  return (
    <div className="relative w-full h-full bg-white overflow-hidden touch-none">
      {/* Toolbar */}
      {!readOnly && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 p-4 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-1 border-r border-slate-100 pr-4">
            <ToolButton active={tool === 'pen'} onClick={() => setTool('pen')} icon={<PenTool size={20} />} label="Pen" />
            <ToolButton active={tool === 'highlighter'} onClick={() => setTool('highlighter')} icon={<Highlighter size={20} />} label="Highlighter" />
            <ToolButton active={tool === 'eraser'} onClick={() => setTool('eraser')} icon={<Eraser size={20} />} label="Eraser" />
            <ToolButton active={tool === 'text'} onClick={() => setTool('text')} icon={<Type size={20} />} label="Text" />
          </div>

          <div className="flex items-center gap-2 border-r border-slate-100 pr-4">
            {COLORS.map(c => (
              <button 
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-transform",
                  color === c ? "border-slate-900 scale-125" : "border-transparent hover:scale-110"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 border-r border-slate-100 pr-4">
            {STROKE_WIDTHS.map(w => (
              <button 
                key={w}
                onClick={() => setStrokeWidth(w)}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 transition-colors",
                  strokeWidth === w ? "bg-slate-100 text-indigo-600" : "text-slate-400"
                )}
              >
                <div style={{ width: w + 2, height: w + 2 }} className="bg-current rounded-full" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <ToolButton onClick={onClear} icon={<Trash2 size={20} />} label="Clear" />
          </div>
        </div>
      )}

      {/* Canvas */}
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        className="bg-white"
      >
        <Layer>
          {strokes.map((stroke) => (
            stroke.type === 'text' ? (
              <KonvaText
                key={stroke.id}
                x={stroke.x}
                y={stroke.y}
                text={stroke.text}
                fontSize={24}
                fontStyle="bold"
                fill={stroke.color}
              />
            ) : (
              <Line
                key={stroke.id}
                points={stroke.points}
                stroke={stroke.color}
                strokeWidth={stroke.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                opacity={stroke.opacity}
                globalCompositeOperation={
                  stroke.type === 'eraser' ? 'destination-out' : 'source-over'
                }
              />
            )
          ))}
          {currentStroke && (
            <Line
              points={currentStroke.points}
              stroke={currentStroke.color}
              strokeWidth={currentStroke.strokeWidth}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              opacity={currentStroke.opacity}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}

function ToolButton({ active = false, onClick, icon, label }: { active?: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all group",
        active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-50"
      )}
      title={label}
    >
      {icon}
    </button>
  );
}
