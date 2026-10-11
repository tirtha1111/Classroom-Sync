import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Presentation, Users, Clock, ArrowRight } from 'lucide-react';
import { useAuth, UserRole } from './contexts/AuthContext';
import { cn } from './lib/utils';

export default function LandingPage() {
  const { loginAsDemo } = useAuth();

  const handleDemoLogin = (role: UserRole) => {
    loginAsDemo(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white text-slate-100">
      {/* Futuristic Floating Glassy Navbar */}
      <header className="fixed top-6 left-6 right-6 z-50 bg-white/10 backdrop-blur-2xl border border-white/20 px-8 py-4 rounded-2xl shadow-2xl shadow-indigo-500/10 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Presentation className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Classroom Sync</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">Technology</a>
        </nav>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleDemoLogin('teacher')}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors border border-white/10 rounded-xl bg-white/5 hover:bg-white/10"
          >
            Teacher Demo
          </button>
          <button 
            onClick={() => handleDemoLogin('student')}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-500/30"
          >
            Student Demo
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow pt-40">
        <section className="px-6 pb-24 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-6 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                Next-Gen EdTech Collaborative Whiteboard
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 text-wrap-balance leading-[1.1]">
                Never miss what happened <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">in class.</span>
              </h1>
              <p className="text-lg text-slate-400 mb-10 max-w-lg leading-relaxed">
                Live classroom work, saved automatically with real-time vector synchronization so students can catch up anytime, anywhere.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => handleDemoLogin('student')}
                  className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold text-lg hover:from-indigo-500 hover:to-violet-500 transition-all shadow-xl shadow-indigo-600/30 group"
                >
                  <GraduationCap className="w-6 h-6" />
                  Continue as Student
                  <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </button>
                <button 
                  onClick={() => handleDemoLogin('teacher')}
                  className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-md"
                >
                  <Presentation className="w-6 h-6 text-indigo-400" />
                  Continue as Teacher
                </button>
              </div>

              <div className="mt-12 flex items-center gap-8 text-sm text-slate-400 font-medium">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                  24+ Students Live Now
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                  1,200+ Sessions Saved
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 flex items-center justify-center">
                <div className="relative w-full h-full p-8">
                  <div className="absolute top-8 left-8 flex items-center gap-2 px-3 py-1.5 bg-red-500/20 backdrop-blur-md rounded-full text-red-300 text-xs font-bold border border-red-500/30">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    LIVE: PHYSICS XII-A
                  </div>
                  <div className="w-full h-full border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden bg-black/40 backdrop-blur-sm">
                    <div className="text-indigo-300/40 font-mono text-xl text-center leading-loose select-none">
                      E = mc² <br />
                      F = ma <br />
                      ∇ × B = μ₀J + μ₀ε₀(∂E/∂t)
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">MS</div>
                    <div>
                      <p className="text-white font-bold text-sm">Mr. Sharma</p>
                      <p className="text-slate-400 text-xs">Electromagnetic Induction</p>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-indigo-900 flex items-center justify-center text-[10px] text-white font-medium">U{i}</div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-violet-600 flex items-center justify-center text-[10px] text-white font-bold">+12</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="bg-slate-900/50 backdrop-blur-xl py-24 px-6 border-t border-white/10">
          <div className="max-w-7xl mx-auto text-center mb-20">
            <h2 className="text-3xl font-bold text-white mb-4">Designed for the Modern Classroom</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Focus on teaching, we'll handle the notes. Classroom Sync bridges the gap between live teaching and asynchronous study.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <FeatureCard 
              icon={<Presentation className="w-6 h-6 text-indigo-400" />}
              title="Real-time Whiteboard"
              description="Write, draw, and highlight. Students see every stroke in real-time with high-performance vector synchronization."
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6 text-indigo-400" />}
              title="Student View Mode"
              description="Students join instantly in view-only mode, keeping full focus on the teacher's active board presentation."
            />
            <FeatureCard 
              icon={<Clock className="w-6 h-6 text-indigo-400" />}
              title="Automatic Archives"
              description="Sessions are saved securely the moment class ends. Students can review previous lessons anytime."
            />
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 text-slate-500 py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Presentation className="text-white w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Classroom Sync</span>
          </div>
          <p className="text-sm">© 2026 Classroom Sync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all backdrop-blur-md shadow-xl group">
      <div className="w-12 h-12 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">{description}</p>
    </div>
  );
}
