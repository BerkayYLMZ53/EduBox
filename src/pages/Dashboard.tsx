import { useUserProfile } from '../hooks/useUserProfile';
import { motion } from 'motion/react';
import { Award, Target, Flame, ChevronRight, Zap, BookOpen, Sparkles, Gift } from 'lucide-react';
import { cn } from '../lib/utils';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStudyTip } from '../services/geminiService';
import { useNotifications } from '../hooks/useNotifications';

export default function Dashboard() {
  const { profile, loading } = useUserProfile();
  const { notifications } = useNotifications();
  const [tip, setTip] = useState<string>('');

  const recentBadges = notifications
    .filter(n => n.type === 'badge')
    .slice(0, 4);

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
      {/* Header with Visual Backdrop */}
      <div className="relative p-10 md:p-12 bg-white rounded-[3rem] card-shadow border border-slate-50 overflow-hidden group">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-50/50 clip-path-hero" />
        <div className="absolute top-10 right-10 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest"
            >
              <Sparkles className="w-3 h-3" />
              Sana Özel EduBox
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Selam, <span className="text-indigo-600">{profile?.displayName?.split(' ')[0]}</span>! 👋
            </h1>
            <p className="text-slate-500 font-bold max-w-md leading-relaxed">
              Bugün öğrenmek için harika bir gün. <span className="text-indigo-600 font-black">{profile?.department}</span> yolculuğunda yeni başarılar seni bekliyor.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3 text-sm font-medium">
            <div className="relative group/level">
              <div className="absolute -inset-1 bg-yellow-400 rounded-2xl blur opacity-25 group-hover/level:opacity-50 transition-opacity" />
              <div className="relative flex items-center gap-2 px-6 py-4 bg-yellow-400 text-yellow-900 rounded-2xl font-black shadow-lg shadow-yellow-100">
                < Award className="w-6 h-6" />
                <div className="text-left leading-none">
                  <p className="text-[10px] opacity-70 uppercase tracking-widest mb-1">Mevcut Seviye</p>
                  <p className="text-lg">Bilge (Lvl {profile?.level})</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gemini Tip with Glassmorphism */}
      {tip && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group cursor-default"
        >
          <div className="absolute -inset-1 vibrant-gradient rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition-opacity" />
          <div className="relative glass-card p-8 md:p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 overflow-hidden">
            <div className="relative z-10 w-20 h-20 bg-white rounded-3xl flex items-center justify-center shrink-0 shadow-xl animate-float">
               <Sparkles className="w-10 h-10 text-indigo-500" />
               <div className="absolute -top-2 -right-2 w-6 h-6 vibrant-gradient rounded-full flex items-center justify-center border-2 border-white">
                  <Zap className="w-3 h-3 text-white fill-white" />
               </div>
            </div>
            
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[9px] font-black uppercase tracking-widest">EDUBOT AKILLI ASİSTAN</span>
                <div className="flex gap-1">
                  {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-indigo-300 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
                </div>
              </div>
              <p className="font-bold text-2xl text-slate-800 leading-snug tracking-tight">"{tip}"</p>
            </div>

            <div className="absolute right-0 top-0 h-full w-32 bg-indigo-500/5 clip-path-hero pointer-events-none" />
          </div>
        </motion.div>
      )}

      {/* Stats Grid with Dynamic Visuals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx} 
            whileHover={{ y: -5 }}
            className="group bg-white p-8 rounded-[2.5rem] border border-slate-50 card-shadow hover:shadow-2xl hover:shadow-indigo-100 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
              <stat.icon className="w-24 h-24 rotate-12" />
            </div>
            
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all group-hover:rotate-6 shadow-lg shadow-current/10", 
              stat.color.replace('text-', 'bg-').replace('-500', '-50').replace('-600', '-50')
            )}>
              <stat.icon className={cn("w-7 h-7", stat.color)} />
            </div>
            <div className="space-y-1">
              <span className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</span>
                {stat.label === 'BAŞARI SKORU' && <span className="text-sm font-black text-indigo-500">PT</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Level Progress Section */}
      <div className="bg-white p-10 rounded-[3.5rem] card-shadow border border-slate-50 space-y-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles className="w-24 h-24 text-indigo-600" />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
          <div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Seviye İlerleyişi</p>
            <h3 className="text-4xl font-black text-slate-900 leading-none">LVL {profile?.level} <span className="text-indigo-200 ml-2">→</span> LVL {(profile?.level || 0) + 1}</h3>
          </div>
          <div className="text-left md:text-right">
            <p className="text-[12px] font-black text-slate-900 uppercase tracking-widest mb-1">
              {Math.min(500, (profile?.successScore || 0) % 500)} / 500 PT
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {(500 - ((profile?.successScore || 0) % 500))} PUAN KALDI
            </p>
          </div>
        </div>
        
        <div className="relative h-6 bg-slate-100 rounded-2xl overflow-hidden p-1 border border-slate-50">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${((profile?.successScore || 0) % 500) / 500 * 100}%` }}
             transition={{ duration: 1.5, type: 'spring' }}
             className="h-full vibrant-gradient rounded-xl relative shadow-inner"
           >
             <div className="absolute inset-0 bg-white/20 animate-pulse" />
           </motion.div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content: Tasks */}
        <div className="md:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Günün Keşifleri</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Sana Özel Önerilen Görevler</p>
            </div>
            <Link to="/tasks" className="text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-100 transition-colors">
              Hepsini Gör
            </Link>
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
            <h2 className="text-xl font-bold text-slate-900">Son Başarımların</h2>
          </div>
          
          {recentBadges.length > 0 ? (
            <motion.div 
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              className="grid grid-cols-1 gap-4"
            >
              {recentBadges.map((badge, idx) => (
                <motion.div 
                  key={badge.id} 
                  variants={{
                    hidden: { opacity: 0, x: 20 },
                    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
                  }}
                  className="p-4 bg-white rounded-3xl border border-slate-100 flex items-center gap-4 group hover:border-indigo-200 transition-all cursor-default"
                >
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Gift className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <h5 className="text-xs font-black text-slate-800 leading-tight mb-0.5">{badge.title}</h5>
                    <p className="text-[10px] font-bold text-slate-400">{new Date(badge.createdAt?.toDate?.() || Date.now()).toLocaleDateString('tr-TR')}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Henüz Rozet Kazanmadın</p>
            </div>
          )}

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
