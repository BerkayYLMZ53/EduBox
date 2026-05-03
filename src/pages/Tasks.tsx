import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardCheck, Zap, BookOpen, CheckCircle2, ChevronRight, X, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useUserProfile } from '../hooks/useUserProfile';

export default function Tasks() {
  const { profile } = useUserProfile();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const tasks = [
    { id: '1', title: "Final Haftası Odaklanma Maratonu", category: "Çalışma", points: 100, desc: "Final haftası boyunca günde en az 4 saat kütüphane/çalışma verisi paylaş.", type: "Challenge" },
    { id: '2', title: "E-Kütüphane Hesabı Doğrulama", category: "Sistem", points: 20, desc: "Üniversitenin e-kütüphane sistemine giriş yaparak hesabını bağla.", type: "Verification" },
    { id: '3', title: "Calculus II - Hafta 8 Quiz", category: "Akademik", points: 50, desc: "Diferansiyel denklemler üzerine 10 soruluk kısa testi tamamla.", type: "Quiz" },
    { id: '4', title: "Kampüs Temsilcisi Ol", category: "Topluluk", points: 250, desc: "EduBox'ı kampüsünde tanıtmak için elçi programına katıl.", type: "Ambassador" },
  ];

  const handleVerify = async () => {
    if (!profile) return;
    setIsVerifying(true);
    
    // Simulate verification
    setTimeout(async () => {
      try {
        const userRef = doc(db, 'users', profile.uid);
        await updateDoc(userRef, {
          successScore: increment(selectedTask.points)
        });
        setSelectedTask(null);
        alert(`${selectedTask.points} PT kazanıldı!`);
      } catch (e) {
        console.error(e);
      } finally {
        setIsVerifying(false);
      }
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-8 space-y-12"
    >
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Akademik Görevler</h1>
        <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest">PUAN KAZAN / DOĞRULA / GELİŞ</p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            whileHover={{ y: -5 }}
            onClick={() => setSelectedTask(task)}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-50 card-shadow cursor-pointer group flex flex-col justify-between transition-all hover:shadow-indigo-100"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-bold px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-widest">
                  {task.category}
                </span>
                <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-50 transition-all">
                   <Zap className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors">{task.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{task.desc}</p>
            </div>
            
            <div className="mt-8 flex items-center justify-between">
              <span className="font-black text-indigo-600 text-lg">+{task.points} PT</span>
              <div className="flex items-center gap-2 text-xs font-black text-slate-400 group-hover:text-indigo-500 group-hover:gap-3 transition-all uppercase tracking-widest">
                 GÖREVE BAŞLA <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Task Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => !isVerifying && setSelectedTask(null)}
              className="absolute inset-0 bg-[#1a1a1a]/40 backdrop-blur-sm"
            />
            <motion.div
              layoutId={`modal-${selectedTask.id}`}
              className="relative w-full max-w-lg bg-[#F0F4FF] p-12 rounded-[3.5rem] shadow-2xl overflow-hidden border border-white"
            >
              <button 
                onClick={() => setSelectedTask(null)}
                className="absolute top-8 right-8 p-2 rounded-xl hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>

              <div className="space-y-8">
                <div className="flex items-center gap-3 text-indigo-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase">Akademik Meydan Okuma</span>
                </div>

                <h2 className="text-3xl font-black text-slate-900 leading-tight uppercase tracking-tight">{selectedTask.title}</h2>
                <p className="text-slate-600 font-medium leading-relaxed">{selectedTask.desc}</p>

                <div className="bg-white p-8 rounded-3xl card-shadow flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">ÖDÜL</span>
                        <span className="font-black text-slate-900 text-lg">{selectedTask.points} Başarı Puanı</span>
                      </div>
                   </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className={cn(
                      "w-full py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-xl",
                      isVerifying 
                        ? "bg-slate-100 text-slate-300 cursor-wait shadow-none"
                        : "vibrant-gradient text-white hover:opacity-90 shadow-indigo-100"
                    )}
                  >
                    {isVerifying ? (
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      >
                         <Zap className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <>
                        <ClipboardCheck className="w-6 h-6" />
                        Görevi Paylaş & Tamamla
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-center mt-6 text-slate-400 font-bold uppercase tracking-widest">
                    AI Tabanlı Doğrulama Sistemi Aktif
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
