import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardCheck, Zap, BookOpen, CheckCircle2, ChevronRight, X, Star, Save, Bell, PartyPopper } from 'lucide-react';
import { cn } from '../lib/utils';
import { doc, updateDoc, increment, collection, query, where, onSnapshot, setDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useUserProfile } from '../hooks/useUserProfile';
import confetti from 'canvas-confetti';

export default function Tasks() {
  const { profile } = useUserProfile();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [userTasks, setUserTasks] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  const tasks = [
    { 
      id: '1', 
      title: "Final Haftası Odaklanma Maratonu", 
      category: "Çalışma", 
      points: 100, 
      desc: "Final haftası boyunca günde en az 4 saat kütüphane/çalışma verisi paylaş.", 
      type: "Challenge",
      subtasks: ["İlk 4 saatlik oturumu tamamla", "Kütüphane konumunu doğrula", "Çalışma masası fotoğrafı yükle"]
    },
    { 
      id: '2', 
      title: "E-Kütüphane Hesabı Doğrulama", 
      category: "Sistem", 
      points: 20, 
      desc: "Üniversitenin e-kütüphane sistemine giriş yaparak hesabını bağla.", 
      type: "Verification",
      subtasks: ["Kütüphane ID girişi", "E-posta aktivasyonu"]
    },
    { 
      id: '3', 
      title: "Calculus II - Hafta 8 Quiz", 
      category: "Akademik", 
      points: 50, 
      desc: "Diferansiyel denklemler üzerine 10 soruluk kısa testi tamamla.", 
      type: "Quiz",
      subtasks: ["Konu özetini oku", "Örnek soruları çöz", "Final testini tamamla"]
    },
    { 
      id: '4', 
      title: "Kampüs Temsilcisi Ol", 
      category: "Topluluk", 
      points: 250, 
      desc: "EduBox'ı kampüsünde tanıtmak için elçi programına katıl.", 
      type: "Ambassador",
      subtasks: ["Başvuru formunu doldur", "Mülakat randevusu al", "İlk etkinliğini planla"]
    },
  ];

  const [completedSubtasks, setCompletedSubtasks] = useState<string[]>([]);
  const [taskNotes, setTaskNotes] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  // Fetch in-progress and completed tasks
  useEffect(() => {
    if (!profile?.uid) return;

    const q = query(
      collection(db, 'user_tasks'),
      where('userId', '==', profile.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskMap: Record<string, any> = {};
      snapshot.forEach(doc => {
        taskMap[doc.data().taskId] = { id: doc.id, ...doc.data() };
      });
      setUserTasks(taskMap);
    });

    return () => unsubscribe();
  }, [profile?.uid]);

  // Load progress when task is selected
  useEffect(() => {
    if (selectedTask && userTasks[selectedTask.id]) {
      setCompletedSubtasks(userTasks[selectedTask.id].subtasks || []);
      setTaskNotes(userTasks[selectedTask.id].notes || "");
    } else {
      setCompletedSubtasks([]);
      setTaskNotes("");
    }
  }, [selectedTask, userTasks]);

  const saveProgress = async (newSubtasks?: string[], newNotes?: string) => {
    if (!profile || !selectedTask) return;
    setIsSaving(true);
    try {
      const taskId = `${profile.uid}_${selectedTask.id}`;
      const taskRef = doc(db, 'user_tasks', taskId);
      
      await setDoc(taskRef, {
        userId: profile.uid,
        taskId: selectedTask.id,
        status: userTasks[selectedTask.id]?.status || 'in_progress',
        subtasks: newSubtasks ?? completedSubtasks,
        notes: newNotes ?? taskNotes,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.error("Progress save failed", e);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSubtask = async (text: string) => {
    const nextSubtasks = completedSubtasks.includes(text) 
      ? completedSubtasks.filter(t => t !== text) 
      : [...completedSubtasks, text];
    
    setCompletedSubtasks(nextSubtasks);
    await saveProgress(nextSubtasks);
  };

  const handleVerify = async () => {
    if (!profile || !selectedTask) return;
    setIsVerifying(true);
    
    try {
      // 1. Update user profile score
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        successScore: increment(selectedTask.points)
      });

      // 2. Mark task as completed in user_tasks
      const taskId = `${profile.uid}_${selectedTask.id}`;
      const taskRef = doc(db, 'user_tasks', taskId);
      await updateDoc(taskRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        subtasks: completedSubtasks,
        notes: taskNotes
      });

      // 3. Check for level up
      const currentScore = profile.successScore || 0;
      const newScore = currentScore + selectedTask.points;
      const currentLevel = profile.level || 1;
      const newLevel = Math.floor(newScore / 500) + 1;

      if (newLevel > currentLevel) {
        await updateDoc(userRef, { level: newLevel });
        await addDoc(collection(db, 'notifications'), {
          userId: profile.uid,
          title: "Seviye Atladın! 🎉",
          message: `Tebrikler, artık LVL ${newLevel} oldun! Yeni ödüllerin kilidini açtın.`,
          type: 'badge',
          read: false,
          createdAt: serverTimestamp()
        });
      }

      // 4. Create task notification
      await addDoc(collection(db, 'notifications'), {
        userId: profile.uid,
        title: "Görev Tamamlandı!",
        message: `${selectedTask.title} görevini başarıyla bitirdin ve ${selectedTask.points} PT kazandın.`,
        type: 'task',
        read: false,
        createdAt: serverTimestamp()
      });

      setEarnedPoints(selectedTask.points);
      setSelectedTask(null);
      setShowSuccessOverlay(true);
      
      // Trigger confetti
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ec4899']
      });

    } catch (e) {
      console.error(e);
      alert("Görev tamamlanırken bir hata oluştu.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-8 space-y-12"
    >
      {/* Tasks Hero Header */}
      <div className="relative p-10 md:p-12 bg-white rounded-[3rem] card-shadow border border-slate-50 overflow-hidden group">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/50 clip-path-hero" />
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest"
            >
              <ClipboardCheck className="w-3 h-3" />
              Yeteneklerini Kanıtla
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Akademik <span className="text-blue-600">Görevler</span>
            </h1>
            <p className="text-slate-500 font-bold max-w-md leading-relaxed">
              Bölümüne özel hazırlanan görevleri tamamla, bilgilerini tazele ve büyük ödüllere giden yolda başarı puanlarını katla.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-100">
              <Star className="w-8 h-8 text-blue-500 fill-blue-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            whileHover={{ y: -5 }}
            onClick={() => setSelectedTask(task)}
            className={cn(
              "bg-white p-8 rounded-[2.5rem] border border-slate-50 card-shadow cursor-pointer group flex flex-col justify-between transition-all hover:shadow-indigo-100",
              userTasks[task.id]?.status === 'completed' && "opacity-60 grayscale-[0.5]"
            )}
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className={cn(
                  "text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest",
                  userTasks[task.id]?.status === 'completed' ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                )}>
                  {userTasks[task.id]?.status === 'completed' ? "TAMAMLANDI" : task.category}
                </span>
                <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-50 transition-all">
                   {userTasks[task.id]?.status === 'completed' ? (
                     <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                   ) : (
                     <Zap className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                   )}
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors">{task.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{task.desc}</p>
              
              <div className="mt-4 flex gap-1">
                {task.subtasks.map((sub, i) => {
                  const isCompleted = userTasks[task.id]?.status === 'completed' || userTasks[task.id]?.subtasks?.includes(sub);
                  return (
                    <div 
                      key={i} 
                      className={cn(
                        "h-1 flex-1 rounded-full transition-all",
                        isCompleted ? "bg-emerald-400" : "bg-slate-100"
                      )} 
                    />
                  );
                })}
              </div>
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => !isVerifying && setSelectedTask(null)}
              className="absolute inset-0 bg-[#1a1a1a]/40 backdrop-blur-sm"
            />
            <motion.div
              layoutId={`modal-${selectedTask.id}`}
              className="relative w-full max-w-lg bg-[#F0F4FF] p-8 md:p-12 rounded-[3.5rem] shadow-2xl overflow-hidden border border-white my-8"
            >
              <button 
                onClick={() => setSelectedTask(null)}
                className="absolute top-8 right-8 p-2 rounded-xl hover:bg-slate-200 transition-colors"
                disabled={isVerifying}
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>

              <div className="space-y-8">
                <div className="flex items-center gap-3 text-indigo-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase">Akademik Meydan Okuma</span>
                </div>

                <div>
                  <h2 className="text-3xl font-black text-slate-900 leading-tight uppercase tracking-tight mb-2">{selectedTask.title}</h2>
                  <p className="text-slate-600 font-medium leading-relaxed">{selectedTask.desc}</p>
                </div>

                {/* Subtasks and Notes Layout */}
                <div className="grid gap-8">
                  {/* Subtasks Section */}
                  <div className="bg-white/60 p-6 rounded-[2.5rem] border border-white/50 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                      </div>
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Alt Görevler</h4>
                    </div>
                    
                    <div className="space-y-3">
                      {selectedTask.subtasks.map((sub: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => toggleSubtask(sub)}
                          className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group",
                            completedSubtasks.includes(sub) 
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                              : "bg-white border-slate-100 text-slate-600 hover:border-indigo-200"
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors",
                            completedSubtasks.includes(sub) ? "border-indigo-400 bg-indigo-500" : "border-slate-100 bg-slate-50"
                          )}>
                            {completedSubtasks.includes(sub) && <CheckCircle2 className="w-4 h-4 text-white fill-current" />}
                          </div>
                          <span className="font-bold text-sm tracking-tight">{sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="bg-white/60 p-6 rounded-[2.5rem] border border-white/50 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-blue-500" />
                        </div>
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Çalışma Notları</h4>
                      </div>
                      {isSaving && <span className="text-[10px] font-black text-indigo-500 animate-pulse bg-indigo-50 px-2 py-1 rounded-lg">KAYDEDİLİYOR...</span>}
                    </div>
                    
                    <div className="relative group/notes">
                      <textarea 
                        value={taskNotes}
                        onChange={(e) => setTaskNotes(e.target.value)}
                        onBlur={() => saveProgress()}
                        placeholder="Görevle ilgili notlarını, önemli noktaları veya çözümlerini buraya ekle..."
                        className="w-full p-6 bg-white rounded-3xl border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-700 text-sm min-h-[140px] resize-none shadow-sm"
                      />
                      <button 
                        onClick={() => saveProgress()}
                        className="absolute bottom-4 right-4 p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-md transform hover:scale-110 active:scale-95"
                        title="Notu Kaydet"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl card-shadow flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">ÖDÜL</span>
                        <span className="font-black text-slate-900 text-lg">{selectedTask.points} Başarı Puanı</span>
                      </div>
                   </div>
                   
                   {userTasks[selectedTask.id]?.status !== 'completed' && (
                     <button
                       onClick={async () => {
                         try {
                           await addDoc(collection(db, 'notifications'), {
                             userId: profile?.uid,
                             title: "Görev Hatırlatması ⏰",
                             message: `"${selectedTask.title}" görevini tamamlamayı unutma! Henüz ${selectedTask.subtasks.length - completedSubtasks.length} alt görevin var.`,
                             type: 'task',
                             read: false,
                             createdAt: serverTimestamp()
                           });
                           alert("Hatırlatıcı oluşturuldu! Bildirim kutunu kontrol et.");
                         } catch (e) {
                           console.error(e);
                         }
                       }}
                       className="flex flex-col items-center gap-1 group/remind"
                     >
                       <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover/remind:bg-indigo-50 group-hover/remind:border-indigo-100 transition-all">
                         <Bell className="w-5 h-5 text-slate-400 group-hover/remind:text-indigo-500" />
                       </div>
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest group-hover/remind:text-indigo-600">Beni Hatırlat</span>
                     </button>
                   )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    disabled={isVerifying || (completedSubtasks.length < selectedTask.subtasks.length && selectedTask.id !== '4')}
                    className={cn(
                      "w-full py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-xl",
                      isVerifying || (completedSubtasks.length < selectedTask.subtasks.length && selectedTask.id !== '4')
                        ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
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
                        {completedSubtasks.length < selectedTask.subtasks.length && selectedTask.id !== '4' 
                          ? `${selectedTask.subtasks.length - completedSubtasks.length} Görev Kaldı`
                          : "Görevi Tamamla"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && selectedTask && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white p-8 rounded-[2.5rem] shadow-2xl border border-indigo-50"
            >
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto">
                  <Star className="w-10 h-10 text-indigo-500 fill-indigo-500" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Hazır mısın?</h3>
                  <p className="text-sm text-slate-500 font-bold leading-relaxed px-4">
                    Bu görevi tamamlayarak <span className="text-indigo-600">+{selectedTask.points} PT</span> kazanacaksın. Onaylıyor musun?
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      handleVerify();
                    }}
                    className="w-full py-4 vibrant-gradient text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:opacity-90 transition-opacity"
                  >
                    Evet, Tamamla
                  </button>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black hover:bg-slate-100 transition-colors"
                  >
                    Vazgeç
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Celebration Overlay */}
      <AnimatePresence>
        {showSuccessOverlay && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessOverlay(false)}
              className="absolute inset-0 bg-indigo-600/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
              className="relative text-center space-y-8"
            >
              <div className="relative inline-block">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-32 h-32 bg-white rounded-[3rem] flex items-center justify-center shadow-2xl relative z-10"
                >
                  <PartyPopper className="w-16 h-16 text-indigo-600" />
                </motion.div>
                <div className="absolute -inset-4 bg-white/20 rounded-[3.5rem] blur-2xl animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-5xl font-black text-white tracking-tight">HARİKA İŞ!</h2>
                <p className="text-indigo-100 font-bold text-xl uppercase tracking-widest">Görevi Başarıyla Tamamladın</p>
              </div>

              <div className="inline-block px-8 py-4 bg-white rounded-2xl shadow-xl">
                 <span className="text-3xl font-black text-indigo-600">+{earnedPoints} PT</span>
              </div>

              <div>
                <button
                  onClick={() => setShowSuccessOverlay(false)}
                  className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all transform hover:scale-105 active:scale-95"
                >
                  DEVAM ET
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
