import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  History, 
  Search, 
  Play, 
  Clock, 
  ChevronRight,
  LogOut,
  Calendar,
  BookOpen
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { useNavigate } from 'react-router-dom';
import { cn } from './lib/utils';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [recentClasses, setRecentClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;

    const path = 'sessions';

    // Listen for live classes
    const liveQuery = query(
      collection(db, path),
      where('status', '==', 'live'),
      where('className', '==', 'XII - A') // Hardcoded for demo
    );

    const unsubscribeLive = onSnapshot(liveQuery, (snapshot) => {
      const live = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLiveClasses(live);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    // Fetch recent classes
    async function fetchRecent() {
      try {
        const recentQuery = query(
          collection(db, path),
          where('status', '==', 'completed'),
          where('className', '==', 'XII - A'),
          orderBy('startedAt', 'desc')
        );
        const snapshot = await getDocs(recentQuery);
        const recent = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentClasses(recent);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      } finally {
        setLoading(false);
      }
    }

    fetchRecent();
    return () => unsubscribeLive();
  }, [user]);

  const filteredClasses = recentClasses.filter(c => 
    c.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">Classroom Sync</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] text-indigo-700 font-bold">
                {user?.name.charAt(0)}
              </div>
              <span className="text-xs font-bold text-slate-700">{user?.name}</span>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Good morning, {user?.name.split(' ')[0]}</h1>
          <p className="text-slate-500">Ready to catch up on your studies?</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-12">
            {/* Live Now Section */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Live Now
              </h2>
              
              {liveClasses.length > 0 ? (
                <div className="grid gap-6">
                  {liveClasses.map(session => (
                    <motion.div 
                      key={session.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group bg-white p-6 rounded-2xl border-2 border-indigo-600 shadow-xl shadow-indigo-100/50 flex flex-col sm:flex-row items-center justify-between gap-6"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                          <Play size={32} fill="currentColor" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold uppercase tracking-wider">
                              {session.subject}
                            </span>
                            <span className="text-slate-400 text-xs">•</span>
                            <span className="text-slate-500 text-xs font-medium">{session.className}</span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mb-1">{session.topic}</h3>
                          <p className="text-sm text-slate-500 flex items-center gap-1.5">
                            Teacher: <span className="text-slate-700 font-semibold">{session.teacherName}</span>
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => navigate(`/classroom/${session.id}`)}
                        className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 shadow-indigo-100 flex items-center justify-center gap-2"
                      >
                        JOIN CLASS
                        <ChevronRight size={18} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-10 rounded-2xl border border-slate-200 border-dashed text-center">
                  <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No live classes at the moment.</p>
                </div>
              )}
            </section>

            {/* Recent Classes Section */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900">Recent Sessions</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search subject or topic..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full sm:w-64 transition-all"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {filteredClasses.length > 0 ? filteredClasses.map(session => (
                  <div 
                    key={session.id}
                    onClick={() => navigate(`/session/${session.id}`)}
                    className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <History size={20} />
                      </div>
                      <span className="text-xs font-bold text-slate-400">{session.className}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{session.topic}</h3>
                    <p className="text-sm text-indigo-600 font-bold mb-4">{session.subject}</p>
                    
                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {format(session.startedAt.toDate(), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock size={12} />
                        {session.duration || '45'} min
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-100">
                    <p className="text-slate-400 italic">No previous sessions found matching your search.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <div className="bg-indigo-600 rounded-2xl p-8 text-white shadow-2xl shadow-indigo-200">
              <h3 className="text-xl font-bold mb-4 leading-tight">Sync up with your classmates</h3>
              <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                Missed a note during Physics? Don't worry, Classroom Sync has it archived exactly as it appeared on the board.
              </p>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-sm font-bold transition-all">
                Learn how it works
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Top Subjects</h3>
              <div className="space-y-3">
                <SubjectBadge label="Physics" count={12} color="bg-blue-50 text-blue-700" />
                <SubjectBadge label="Mathematics" count={8} color="bg-indigo-50 text-indigo-700" />
                <SubjectBadge label="Chemistry" count={15} color="bg-emerald-50 text-emerald-700" />
                <SubjectBadge label="Biology" count={4} color="bg-amber-50 text-amber-700" />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function SubjectBadge({ label, count, color }: { label: string, count: number, color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn("px-3 py-1.5 rounded-lg text-xs font-bold", color)}>{label}</span>
      <span className="text-xs font-bold text-slate-400">{count} sessions</span>
    </div>
  );
}
