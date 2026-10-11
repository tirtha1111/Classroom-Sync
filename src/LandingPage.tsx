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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Presentation className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Classroom Sync</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it Works</a>
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleDemoLogin('teacher')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors border border-slate-200 rounded-lg bg-white shadow-sm"
            >
              Teacher Demo
            </button>
            <button 
              onClick={() => handleDemoLogin('student')}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Student Demo
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow pt-32">
        <section className="px-6 pb-24 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 text-wrap-balance leading-[1.1]">
                Never miss what happened <span className="text-indigo-600">in class.</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 max-w-lg leading-relaxed">
                Live classroom work, saved automatically so students can catch up anytime. The digital whiteboard that connects teachers and students instantly.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => handleDemoLogin('student')}
                  className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200/50 group"
                >
                  <GraduationCap className="w-6 h-6" />
                  Continue as Student
                  <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </button>
                <button 
                  onClick={() => handleDemoLogin('teacher')}
                  className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all shadow-sm"
                >
                  <Presentation className="w-6 h-6 text-indigo-600" />
                  Continue as Teacher
                </button>
              </div>

              <div className="mt-10 flex items-center gap-6 text-sm text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  24+ Students Live Now
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  1,200+ Sessions Saved
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-slate-200 border-8 border-white"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-700 flex items-center justify-center">
                <div className="relative w-full h-full p-8">
                  <div className="absolute top-8 left-8 flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    LIVE: PHYSICS XII-A
                  </div>
                  <div className="w-full h-full border-2 border-white/20 rounded-2xl flex items-center justify-center overflow-hidden">
                    <div className="text-white/30 font-mono text-lg text-center leading-loose select-none">
                      E = mc² <br />
                      F = ma <br />
                      λ = h / p
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">MS</div>
                    <div>
                      <p className="text-white font-bold text-sm">Mr. Sharma</p>
                      <p className="text-white/60 text-xs">Electromagnetic Induction</p>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] text-white font-medium">U{i}</div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">+12</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="bg-white py-24 px-6">
          <div className="max-w-7xl mx-auto text-center mb-20">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Designed for the Modern Classroom</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Focus on teaching, we'll handle the notes. Classroom Sync is the ultimate bridge between teaching and learning.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <FeatureCard 
              icon={<Presentation className="w-6 h-6 text-indigo-600" />}
              title="Real-time Whiteboard"
              description="Write, draw, and highlight. Students see every stroke exactly as you make it, with zero lag."
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6 text-indigo-600" />}
              title="Student View Mode"
              description="Students join with one click. They watch the live board but can't edit, keeping the focus on you."
            />
            <FeatureCard 
              icon={<Clock className="w-6 h-6 text-indigo-600" />}
              title="Automatic Archives"
              description="Sessions are saved the moment class ends. Students can review previous lessons anytime, anywhere."
            />
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <Presentation className="text-white w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Classroom Sync</span>
          </div>
          <div className="flex items-center gap-8 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
          <p className="text-sm">© 2026 Classroom Sync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all">
      <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
