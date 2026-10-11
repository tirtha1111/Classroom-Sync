import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Presentation, 
  History, 
  User as UserIcon, 
  LogOut, 
  Plus, 
  BookOpen,
  Users as UsersIcon,
  ArrowRight
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { collection, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { useNavigate } from 'react-router-dom';
import { cn } from './lib/utils';
import { format } from 'date-fns';
import { nanoid } from 'nanoid';
import { Logo } from './components/Logo';

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recentClasses, setRecentClasses] = useState<any[]>([]);
  const [stats, setStats] = useState({ today: 3, students: 24, total: 18 });
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Form state
  const [className, setClassName] = useState('XII - A');
  const [subject, setSubject] = useState('Physics');
  const [topic, setTopic] = useState('');

  useEffect(() => {
    async function fetchClasses() {
      if (!user) return;
      const path = 'sessions';
      try {
        const snapshot = await getDocs(collection(db, path));
        const allSessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        
        const teacherSessions = allSessions
          .filter(s => s.teacherId === user.id)
          .sort((a, b) => {
            const timeA = a.startedAt?.toMillis ? a.startedAt.toMillis() : 0;
            const timeB = b.startedAt?.toMillis ? b.startedAt.toMillis() : 0;
            return timeB - timeA;
          })
          .slice(0, 5);

        setRecentClasses(teacherSessions);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      } finally {
        setLoading(false);
      }
    }
    fetchClasses();
  }, [user]);

  const handleStartClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !user) return;

    const path = 'sessions';
    try {
      const sessionId = nanoid();
      const sessionData = {
        id: sessionId,
        className,
        subject,
        topic,
        teacherId: user.id,
        teacherName: user.name,
        status: 'live',
        startedAt: serverTimestamp(),
        studentCount: 0
      };

      const sessionRef = doc(db, path, sessionId);
      await setDoc(sessionRef, sessionData);
      navigate(`/classroom/${sessionId}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white text-slate-100 flex flex-col">
      {/* Futuristic Floating Glassy Navbar */}
      <header className="sticky top-6 mx-6 z-50 bg-slate-900/70 backdrop-blur-2xl border border-white/10 px-8 py-4 rounded-2xl shadow-2xl shadow-indigo-500/10 flex items-center justify-between max-w-7xl lg:mx-auto w-full">
        <Logo />

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button onClick={() => navigate('/teacher')} className="hover:text-white transition-colors">Dashboard</button>
          <button onClick={() => navigate('/previous-classes')} className="hover:text-white transition-colors">Previous Sessions</button>
          <button onClick={() => setShowProfileModal(true)} className="hover:text-white transition-colors">Profile</button>
        </nav>

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

      {/* Main Content */}
      <main className="flex-grow p-8 lg:p-12 max-w-7xl mx-auto w-full">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold text-white">Good afternoon, Teacher</h1>
          <p className="text-slate-400">Ready for your next session?</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Start Class Card */}
          <section className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl shadow-indigo-500/10">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Plus className="text-indigo-400" />
                Start a Class
              </h2>
              
              <form onSubmit={handleStartClass} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300">Class</label>
                    <select 
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="w-full p-3.5 bg-slate-950 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option className="bg-slate-900">X - A</option>
                      <option className="bg-slate-900">XI - A</option>
                      <option className="bg-slate-900">XII - A</option>
                      <option className="bg-slate-900">XII - B</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300">Subject</label>
                    <select 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full p-3.5 bg-slate-950 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option className="bg-slate-900">Physics</option>
                      <option className="bg-slate-900">Chemistry</option>
                      <option className="bg-slate-900">Mathematics</option>
                      <option className="bg-slate-900">Biology</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300">Topic</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Electromagnetic Induction"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full p-3.5 bg-slate-950 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold text-lg hover:from-indigo-500 hover:to-violet-500 transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 group"
                >
                  START CLASS
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl shadow-indigo-500/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Sessions</h2>
                <button onClick={() => navigate('/previous-classes')} className="text-sm font-bold text-indigo-400 hover:text-indigo-300">View All</button>
              </div>

              <div className="space-y-4">
                {recentClasses.length > 0 ? recentClasses.map((session: any) => (
                  <div key={session.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                        <History size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-white">{session.subject} — {session.className}</p>
                        <p className="text-sm text-slate-400">{session.topic}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">
                        {session.startedAt?.toDate ? format(session.startedAt.toDate(), 'MMM d, h:mm a') : 'Just now'}
                      </p>
                      <p className={cn("text-xs font-bold capitalize", session.status === 'live' ? "text-emerald-400 animate-pulse" : "text-slate-500")}>
                        {session.status}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500 italic">No previous sessions found.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Stats Sidebar */}
          <section className="space-y-8">
            <div className="grid gap-4">
              <StatCard label="Classes Today" value={stats.today} icon={<BookOpen size={20} className="text-blue-400" />} color="bg-blue-500/15 border-blue-500/30" />
              <StatCard label="Students Connected" value={stats.students} icon={<UsersIcon size={20} className="text-emerald-400" />} color="bg-emerald-500/15 border-emerald-500/30" />
              <StatCard label="Previous Sessions" value={stats.total} icon={<History size={20} className="text-indigo-400" />} color="bg-indigo-500/15 border-indigo-500/30" />
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-3xl text-white shadow-2xl shadow-indigo-600/30">
              <h3 className="text-xl font-bold mb-2">Did you know?</h3>
              <p className="text-sm text-indigo-100 leading-relaxed">
                Sessions are automatically shared with your students in XII-A. They can rewatch any stroke!
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-white/10 w-full max-w-md p-8 rounded-3xl shadow-2xl relative text-slate-100"
          >
            <button 
              onClick={() => setShowProfileModal(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-full bg-white/5"
            >
              ✕
            </button>
            <div className="w-16 h-16 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-300 text-2xl font-bold mb-6 mx-auto">
              {user?.name.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold text-white text-center mb-1">{user?.name}</h2>
            <p className="text-sm text-slate-400 text-center mb-6 capitalize">{user?.role} Account</p>
            
            <div className="space-y-4 bg-slate-950 p-6 rounded-2xl border border-white/5 mb-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-sm font-semibold text-white">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Role / Permissions</p>
                <p className="text-sm font-semibold text-white capitalize">{user?.role} (Full Access)</p>
              </div>
            </div>

            <button 
              onClick={() => setShowProfileModal(false)}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-600/30"
            >
              Close Profile
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-400 mb-1">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
      <div className={cn("w-14 h-14 rounded-2xl border flex items-center justify-center", color)}>
        {icon}
      </div>
    </div>
  );
}
