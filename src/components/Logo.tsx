import React from 'react';

export function Logo({ className = "", size = "normal" }: { className?: string, size?: "normal" | "small" }) {
  const isSmall = size === "small";
  
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className={`relative ${isSmall ? 'w-8 h-8' : 'w-10 h-10'} flex items-center justify-center group`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 rounded-2xl shadow-lg shadow-indigo-500/40 opacity-80 group-hover:opacity-100 transition-opacity" />
        <div className="relative w-full h-full bg-slate-900 border border-white/20 rounded-2xl flex items-center justify-center overflow-hidden">
          <svg className={`${isSmall ? 'w-4 h-4' : 'w-5 h-5'} text-indigo-400 group-hover:scale-110 transition-transform`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
            <path d="M12 2v3" />
          </svg>
        </div>
      </div>
      <span className={`${isSmall ? 'text-base' : 'text-lg'} font-extrabold tracking-tight text-white flex items-center gap-1.5`}>
        Classroom <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Sync</span>
      </span>
    </div>
  );
}
