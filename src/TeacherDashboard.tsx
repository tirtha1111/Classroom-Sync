import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Presentation, 
  History, 
  User as UserIcon, 
  LogOut, 
  Plus, 
  ChevronRight,
  BookOpen,
  Users as UsersIcon,
  Search,
  ArrowRight
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { useNavigate } from 'react-router-dom';
import { cn } from './lib/utils';
import { format } from 'date-fns';
import { nanoid } from 'nanoid';

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recentClasses, setRecentClasses] = useState<any[]>([]);
  const [stats, setStats] = useState({ today: 3, students: 24, total: 18 });

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
        
        // Filter by teacher and sort in JS to avoid composite index errors
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

      await addDoc(collection(db, path), sessionData);
      navigate(`/classroom/${sessionId}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Presentation className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">Classroom Sync</span>
        </div>

        <nav className="flex-grow px-4 py-4 space-y-1">
          <SidebarLink icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <SidebarLink icon={<BookOpen size={20} />} label="My Classes" />
          <SidebarLink icon={<Presentation size={20} />} label="Start Class" />
          <SidebarLink icon={<History size={20} />} label="Previous Sessions" onClick={() => navigate('/previous-classes')} />
          <SidebarLink icon={<UserIcon size={20} />} label="Profile" />
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 p-2 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-2 p-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-8 lg:p-12">
        <div className="max-w-5xl mx-auto">
          <header className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900">Good afternoon, Teacher</h1>
            <p className="text-slate-500">Ready for your next session?</p>
          </header>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Start Class Card */}
            <section className="lg:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Plus className="text-indigo-600" />
                  Start a Class
                </h2>
                
                <form onSubmit={handleStartClass} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Class</label>
                      <select 
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      >
                        <option>X - A</option>
                        <option>XI - A</option>
                        <option>XII - A</option>
                        <option>XII - B</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Subject</label>
                      <select 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      >
                        <option>Physics</option>
                        <option>Chemistry</option>
                        <option>Mathematics</option>
                        <option>Biology</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Topic</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Electromagnetic Induction"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200/50 flex items-center justify-center gap-2 group"
                  >
                    START CLASS
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Recent Sessions</h2>
                  <button onClick={() => navigate('/previous-classes')} className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All</button>
                </div>

                <div className="space-y-4">
                  {recentClasses.length > 0 ? recentClasses.map((session: any) => (
                    <div key={session.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                          <History size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{session.subject} — {session.className}</p>
                          <p className="text-sm text-slate-500">{session.topic}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">
                          {session.startedAt?.toDate ? format(session.startedAt.toDate(), 'MMM d, h:mm a') : 'Just now'}
                        </p>
                        <p className={cn("text-xs font-bold capitalize", session.status === 'live' ? "text-emerald-600" : "text-slate-400")}>
                          {session.status}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400 italic">No previous sessions found.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Stats Sidebar */}
            <section className="space-y-8">
              <div className="grid gap-4">
                <StatCard label="Classes Today" value={stats.today} icon={<BookOpen size={20} className="text-blue-600" />} color="bg-blue-50" />
                <StatCard label="Students Connected" value={stats.students} icon={<UsersIcon size={20} className="text-emerald-600" />} color="bg-emerald-50" />
                <StatCard label="Previous Sessions" value={stats.total} icon={<History size={20} className="text-indigo-600" />} color="bg-indigo-50" />
              </div>

              <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-xl shadow-indigo-100">
                <h3 className="font-bold mb-2">Did you know?</h3>
                <p className="text-sm text-indigo-100 leading-relaxed">
                  Sessions are automatically shared with your students in XII-A. They can rewatch any stroke!
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
        active 
          ? "bg-indigo-50 text-indigo-700 shadow-sm" 
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", color)}>
        {icon}
      </div>
    </div>
  );
}
