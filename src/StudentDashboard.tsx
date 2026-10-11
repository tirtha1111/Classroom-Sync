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
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { useNavigate } from 'react-router-dom';
import { cn } from './lib/utils';
import { format } from 'date-fns';
import { Logo } from './components/Logo';

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

    const unsubscribeLive = onSnapshot(collection(db, path), (snapshot) => {
      const allSessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      const live = allSessions.filter(s => s.status === 'live');
      setLiveClasses(live);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    async function fetchRecent() {
      try {
        const snapshot = await getDocs(collection(db, path));
        const allSessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        const recent = allSessions
          .filter(s => s.status === 'completed')
          .sort((a, b) => {
            const timeA = a.startedAt?.toMillis ? a.startedAt.toMillis() : 0;
            const timeB = b.startedAt?.toMillis ? b.startedAt.toMillis() : 0;
            return timeB - timeA;
          });
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
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white text-slate-100">
      {/* Futuristic Floating Glassy Navbar */}
      <header className="sticky top-6 mx-6 z-50 bg-slate-900/70 backdrop-blur-2xl border border-white/10 px-8 py-4 rounded-2xl shadow-2xl shadow-indigo-500/10 flex items-center justify-between max-w-7xl lg:mx-auto">
        <Logo />

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
            <div className="w-7 h-7 bg-indigo-500/30 rounded-lg flex items-center justify-center text-xs text-indigo-300 font-bold">
              {user?.name.charAt(0)}
            </div>
            <span className="text-xs font-bold text-slate-200">{user?.name}</span>
          </div>
          <button 
            onClick={logout}
            className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-12">
          <h1 className="text-3xl font-extrabold text-white mb-2">Good morning, {user?.name.split(' ')[0]}</h1>
          <p className="text-slate-400">Ready to catch up on your studies?</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-12">
            {/* Live Now Section */}
            <section>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                Live Now
              </h2>
              
              {liveClasses.length > 0 ? (
                <div className="grid gap-6">
                  {liveClasses.map(session => (
                    <motion.div 
                      key={session.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-indigo-500/30 shadow-2xl shadow-indigo-500/10 flex flex-col sm:flex-row items-center justify-between gap-6"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                          <Play size={28} fill="currentColor" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-indigo-500/30">
                              {session.subject}
                            </span>
                            <span className="text-slate-500 text-xs">•</span>
                            <span className="text-slate-400 text-xs font-medium">{session.className}</span>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-1">{session.topic}</h3>
                          <p className="text-sm text-slate-400 flex items-center gap-1.5">
                            Teacher: <span className="text-slate-200 font-semibold">{session.teacherName}</span>
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => navigate(`/classroom/${session.id}`)}
                        className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                      >
                        JOIN CLASS
                        <ChevronRight size={18} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-950 p-12 rounded-3xl border border-white/10 border-dashed text-center">
                  <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">No live classes at the moment.</p>
                </div>
              )}
            </section>

            {/* Recent Classes Section */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-white">Recent Sessions</h2>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search subject or topic..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-64 transition-all"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {filteredClasses.length > 0 ? filteredClasses.map(session => (
                  <div 
                    key={session.id}
                    onClick={() => navigate(`/session/${session.id}`)}
                    className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors border border-white/5">
                        <History size={20} />
                      </div>
                      <span className="text-xs font-bold text-slate-500">{session.className}</span>
                    </div>
                    <h3 className="font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{session.topic}</h3>
                    <p className="text-sm text-indigo-400 font-bold mb-4">{session.subject}</p>
                    
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {session.startedAt?.toDate ? format(session.startedAt.toDate(), 'MMM d, yyyy') : 'Recently'}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock size={12} />
                        {session.duration || '45'} min
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-12 text-center bg-slate-900 rounded-3xl border border-white/10">
                    <p className="text-slate-500 italic">No previous sessions found matching your search.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-600/30">
              <h3 className="text-xl font-bold mb-4 leading-tight">Sync up with your classmates</h3>
              <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                Missed a note during Physics? Don't worry, Classroom Sync has it archived exactly as it appeared on the board.
              </p>
              <button className="w-full py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-sm font-bold transition-all border border-white/20">
                Learn how it works
              </button>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
              <h3 className="font-bold text-white mb-4">Top Subjects</h3>
              <div className="space-y-3">
                <SubjectBadge label="Physics" count={12} color="bg-blue-500/15 text-blue-300 border-blue-500/30" />
                <SubjectBadge label="Mathematics" count={8} color="bg-indigo-500/15 text-indigo-300 border-indigo-500/30" />
                <SubjectBadge label="Chemistry" count={15} color="bg-emerald-500/15 text-emerald-300 border-emerald-500/30" />
                <SubjectBadge label="Biology" count={4} color="bg-amber-500/15 text-amber-300 border-amber-500/30" />
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
      <span className={cn("px-3 py-1.5 rounded-xl text-xs font-bold border", color)}>{label}</span>
      <span className="text-xs font-bold text-slate-500">{count} sessions</span>
    </div>
  );
}
