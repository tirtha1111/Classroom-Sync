import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  History, 
  ChevronLeft,
  Calendar,
  Clock,
  User,
  BookOpen
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from './firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import Whiteboard, { Stroke } from './components/Whiteboard';
import { format } from 'date-fns';

export default function SessionViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchSession() {
      const sessionPath = `sessions/${id}`;
      try {
        const sessionDoc = await getDoc(doc(db, sessionPath));
        if (sessionDoc.exists()) {
          setSession({ id: sessionDoc.id, ...sessionDoc.data() });
          
          const strokesPath = `sessions/${id}/strokes`;
          const strokesQuery = query(
            collection(db, strokesPath),
            orderBy('createdAt', 'asc')
          );
          const strokesSnapshot = await getDocs(strokesQuery);
          setStrokes(strokesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Stroke)));
        } else {
          navigate('/');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, sessionPath);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
              <History size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{session?.topic}</h1>
              <p className="text-xs font-medium text-slate-500">
                {session?.subject} • {session?.className} • Archived Session
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 text-slate-400">
          <InfoItem icon={<User size={14} />} label={session?.teacherName} />
          <InfoItem icon={<Calendar size={14} />} label={session?.startedAt ? format(session.startedAt.toDate(), 'MMM d, yyyy') : ''} />
          <InfoItem icon={<Clock size={14} />} label={`${session?.duration || 45} min`} />
        </div>
      </header>

      <main className="flex-grow relative overflow-hidden">
        <Whiteboard 
          strokes={strokes} 
          onAddStroke={() => {}} 
          onClear={() => {}}
          readOnly={true}
        />
        
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 px-6 py-3 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl flex items-center gap-3">
          <History className="text-slate-400" size={18} />
          <p className="text-sm font-bold text-slate-900">Archived: This session is view-only.</p>
        </div>
      </main>
    </div>
  );
}

function InfoItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
      {icon}
      {label}
    </div>
  );
}
