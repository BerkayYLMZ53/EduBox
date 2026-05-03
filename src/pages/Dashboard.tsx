import { useUserProfile } from '../hooks/useUserProfile';
import { motion } from 'motion/react';
import { Award, Target, Flame, ChevronRight, Zap, BookOpen, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { useEffect, useState } from 'react';
import { getStudyTip } from '../services/geminiService';

export default function Dashboard() {
  const { profile, loading } = useUserProfile();
  const [tip, setTip] = useState<string>('');

  useEffect(() => {
    if (profile) {
      getStudyTip(profile.department, profile.successScore).then(setTip);
    }
  }, [profile]);

  if (loading) return null;

  const stats = [
    { label: 'BAŞARI SKORU', value: profile?.successScore || 0, icon: Award, color: 'text-amber-500' },
    { label: 'MEVCUT SEVİYE', value: profile?.level || 1, icon: Flame, color: 'text-orange-600' },
    { label: 'AKTİF GÖREVLER', value: 3, icon: Target, color: 'text-blue-500' },
    { label: 'TOPLULUK NOTLARI', value: 12, icon: BookOpen, color: 'text-emerald-500' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="py-8 space-y-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hoş geldin, {profile?.displayName?.split(' ')[0]}! 👋</h1>
          <p className="text-indigo-600 font-semibold text-sm">
            {profile?.department} / SKOR: {profile?.successScore}
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-yellow-900 rounded-full font-bold shadow-sm">
            ⭐ Level {profile?.level}: Bilge
          </div>
        </div>
      </div>

      {/* Gemini Tip */}
      {tip && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="vibrant-gradient p-8 rounded-[2rem] text-white flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-indigo-200 relative overflow-hidden"
        >
          <div className="relative z-10 w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
             <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="relative z-10">
            <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 inline-block">EDUBOT AKILLI İPUCU</span>
            <p className="font-bold text-xl leading-snug">{tip}</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Zap className="w-32 h-32" />
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-50 card-shadow group hover:shadow-indigo-100 transition-all">
            <div className={cn("w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 transition-transform group-hover:scale-110", stat.color.replace('text-', 'bg-').replace('-500', '-100').replace('-600', '-100'))}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</span>
            <span className="text-3xl font-black text-indigo-600 tracking-tight">{stat.value}</span>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
               <div className="bg-indigo-500 h-full" style={{ width: '82%' }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content: Tasks */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-indigo-100">
            <h2 className="text-xl font-bold text-slate-900">Önerilen Görevler</h2>
            <button className="text-xs font-bold text-indigo-600 hover:underline">TÜMÜNÜ GÖR</button>
          </div>

          <div className="space-y-4">
            {[
              { title: "Final Haftası Hazırlık Quiz", points: "+50 PT", type: "Quiz", bg: "bg-blue-50" },
              { title: "Bölüm Notu Paylaşımı (Calculus II)", points: "+30 PT", type: "Note", bg: "bg-purple-50" },
              { title: "E-Kütüphane Kaydı", points: "+20 PT", type: "Verification", bg: "bg-emerald-50" },
            ].map((task, idx) => (
              <div key={idx} className="group flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-50 card-shadow hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", task.bg)}>
                    <Zap className={cn("w-5 h-5", idx === 0 ? "text-blue-600" : "text-slate-600")} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{task.title}</h4>
                    <p className="text-xs text-slate-400 font-bold">{task.type.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-black text-indigo-600">{task.points}</span>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Recent Badges */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-indigo-100">
            <h2 className="text-xl font-bold text-slate-900">Rozetlerin</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             {[
               { name: "Focus Pro", desc: "4 Saat Odak", icon: "🎯", bg: "bg-orange-50" },
               { name: "Yıldız", desc: "5 Paylaşım", icon: "⭐", bg: "bg-yellow-50" },
               { name: "Kuş", desc: "Sabah", icon: "☀️", bg: "bg-blue-50" },
               { name: "Maraton", desc: "7 Gün", icon: "🏃", bg: "bg-pink-50" },
             ].map((badge, idx) => (
               <div key={idx} className={cn("p-4 rounded-3xl text-center border-2 transition-all hover:scale-105", badge.bg, badge.bg.replace('bg-', 'border-').replace('-50', '-100'))}>
                 <div className="text-3xl mb-2">{badge.icon}</div>
                 <h5 className="text-[10px] font-black text-slate-800 tracking-tight">{badge.name.toUpperCase()}</h5>
               </div>
             ))}
          </div>

          <div className="vibrant-gradient text-white p-6 rounded-3xl space-y-4 shadow-xl shadow-indigo-100">
              <h3 className="font-bold text-lg leading-tight uppercase tracking-tight">MacBook Air Çekilişi</h3>
              <p className="text-xs text-white/80 font-medium">5000 PT toplayan öğrencilere özel teknoloji paketi!</p>
              <button className="w-full py-3 bg-white text-indigo-600 text-xs font-black rounded-xl shadow-lg">KATIL</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
