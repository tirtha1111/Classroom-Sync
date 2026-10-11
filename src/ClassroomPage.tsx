import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Presentation, 
  X, 
  AlertTriangle,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from './firebase';
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  serverTimestamp, 
  collection, 
  addDoc, 
  deleteDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import Whiteboard, { Stroke } from './components/Whiteboard';
import { cn } from './lib/utils';
import { motion } from 'framer-motion';

export default function ClassroomPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;

    const sessionPath = `sessions/${id}`;

    // Listen to session metadata
    const unsubscribeSession = onSnapshot(doc(db, sessionPath), (doc) => {
      if (doc.exists()) {
        setSession({ id: doc.id, ...doc.data() });
      } else {
        navigate('/');
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, sessionPath);
    });

    // Listen to strokes
    const strokesPath = `sessions/${id}/strokes`;
    const strokesQuery = query(collection(db, strokesPath));
    const unsubscribeStrokes = onSnapshot(strokesQuery, (snapshot) => {
      const remoteStrokes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Stroke));
      setStrokes(remoteStrokes);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, strokesPath);
    });

    return () => {
      unsubscribeSession();
      unsubscribeStrokes();
    };
  }, [id, navigate]);

  const handleAddStroke = async (stroke: Stroke) => {
    if (!id || !user || session?.teacherId !== user.id) return;
    
    const strokesPath = `sessions/${id}/strokes`;
    try {
      await addDoc(collection(db, strokesPath), {
        ...stroke,
        createdBy: user.id,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, strokesPath);
    }
  };

  const handleClear = async () => {
    if (!id || !user || session?.teacherId !== user.id) return;
    
    const strokesPath = `sessions/${id}/strokes`;
    try {
      const snapshot = await getDocs(collection(db, strokesPath));
      const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, strokesPath);
    }
  };

  const handleEndClass = async () => {
    if (!id || !user || session?.teacherId !== user.id) return;

    const sessionPath = `sessions/${id}`;
    try {
      let duration = 45;
      if (session?.startedAt?.toDate) {
        try {
          const startedAt = session.startedAt.toDate();
          const endedAt = new Date();
          duration = Math.max(1, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000));
        } catch (e) {
          // fallback duration
        }
      }

      await updateDoc(doc(db, sessionPath), {
        status: 'completed',
        endedAt: serverTimestamp(),
        duration
      });
      navigate('/teacher');
    } catch (error) {
      console.error('Error ending class:', error);
      handleFirestoreError(error, OperationType.UPDATE, sessionPath);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Entering classroom...</p>
        </div>
      </div>
    );
  }

  const isTeacher = user?.id === session?.teacherId;

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden font-sans">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(isTeacher ? '/teacher' : '/student')}
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Presentation size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">{session?.topic}</h1>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase tracking-wider">
                  ● LIVE
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500">
                {session?.subject} • {session?.className} • {session?.teacherName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
            <Users size={16} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-600">{session?.studentCount || 12} students connected</span>
          </div>

          {isTeacher ? (
            <button 
              onClick={() => setShowEndConfirm(true)}
              className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-100"
            >
              END CLASS
            </button>
          ) : (
            <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm border border-indigo-100">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
              VIEWING LIVE
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow relative overflow-hidden">
        <Whiteboard 
          strokes={strokes} 
          onAddStroke={handleAddStroke} 
          onClear={handleClear}
          readOnly={!isTeacher}
        />
        
        {!isTeacher && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 px-6 py-3 bg-white/90 backdrop-blur-xl border border-indigo-100 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
            <p className="text-sm font-bold text-slate-900">You're viewing the teacher's live board.</p>
          </div>
        )}
      </main>

      {/* Connection Status */}
      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-slate-900 text-white rounded-full text-[10px] font-bold flex items-center gap-2 shadow-2xl">
        <div className="w-2 h-2 bg-emerald-400 rounded-full" />
        CONNECTED
      </div>

      {/* End Class Confirmation */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl"
          >
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-6 mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">End this session?</h2>
            <p className="text-slate-500 text-center mb-8">
              Students will no longer be able to join the live session, and the whiteboard will be archived.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleEndClass}
                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100"
              >
                End Class
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
