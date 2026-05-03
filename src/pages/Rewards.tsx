import { motion } from 'motion/react';
import { Gift, Package, Ticket, ChevronRight, Lock, Loader2, GraduationCap } from 'lucide-react';
import { cn } from '../lib/utils';
import { useUserProfile } from '../hooks/useUserProfile';
import { db } from '../lib/firebase';
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';

export default function Rewards() {
  const { profile } = useUserProfile();
  const [isClaiming, setIsClaiming] = useState<string | null>(null);
  const userScore = profile?.successScore || 0;

  const physicalRewards = [
    { title: "Final Survival Kit", points: 500, type: "Box", desc: "Kahve, enerji içeceği, not defteri ve highlighter seti.", image: "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=400&h=400&auto=format&fit=crop" },
    { title: "EduBox Focus Pack", points: 850, type: "Box", desc: "Masa lambası, kablo düzenleyici ve odaklanma kartları.", image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=400&h=400&auto=format&fit=crop" },
    { title: "Tech Pro Bundle", points: 1500, type: "Box", desc: "Kablosuz mouse, mousepad ve HD web kamerası seti.", image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=400&h=400&auto=format&fit=crop" },
    { title: "Premium Backpack", points: 1200, type: "Box", desc: "Su geçirmez, laptop bölmeli ergonomik çalışma çantası.", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&h=400&auto=format&fit=crop" },
    { title: "EduBox Coffee Mug", points: 300, type: "Item", desc: "Özel tasarım seramik kupa ve altlığı.", image: "https://images.unsplash.com/photo-1517256011107-b02ced7336ed?q=80&w=400&h=400&auto=format&fit=crop" },
  ];

  const digitalRewards = [
    { brand: "Starbucks", title: "%20 İndirim", points: 50, icon: Ticket, code: "STB24" },
    { brand: "Yemeksepeti", title: "50 TL Kupon", points: 120, icon: Ticket, code: "EDUYEMEK" },
    { brand: "Storytel", title: "1 Ay Premium", points: 200, icon: Ticket, code: "EDUSTORY" },
    { brand: "Udemy", title: "%50 İndirim Çeki", points: 150, icon: Ticket, code: "UDEMY50" },
    { brand: "Amazon", title: "100 TL Bakiye", points: 250, icon: Ticket, code: "AMZ100" },
    { brand: "Spotify", title: "3 Ay Premium", points: 350, icon: Ticket, code: "SPOTI3M" },
  ];

  const academicRewards = [
    { brand: "Mentörlük", title: "30 Dakika Kariyer Danışmanlığı", points: 600, icon: GraduationCap },
    { brand: "CV Hazırlama", title: "Profesyonel CV İnceleme", points: 450, icon: Package },
    { brand: "Kütüphane", title: "VIP Çalışma Odası Rezervasyonu", points: 200, icon: Lock },
    { brand: "Yazılım", title: "Premium IDE Lisansı (6 Ay)", points: 900, icon: Ticket },
  ];

  const handleClaimReward = async (reward: any) => {
    if (!profile) return;
    if (userScore < reward.points) return;

    setIsClaiming(reward.title);
    try {
      // 1. Send Email Notification via Express Backend
      await fetch('/api/notifications/reward-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: profile.email,
          userName: profile.displayName,
          rewardTitle: reward.title,
          successScore: profile.successScore
        })
      });

      // 2. Update User Points
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        successScore: increment(-reward.points)
      });

      // 3. Record the Claim in Firestore
      await addDoc(collection(db, 'reward_claims'), {
        userId: profile.uid,
        userName: profile.displayName,
        userEmail: profile.email,
        rewardTitle: reward.title,
        pointsDeducted: reward.points,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // 4. Create a local notification for the user
      await addDoc(collection(db, 'notifications'), {
        userId: profile.uid,
        title: "Ödül Talebi Alındı! 🎁",
        message: `${reward.title} talebin yöneticilere iletildi. Puanın güncellendi.`,
        type: 'badge',
        read: false,
        createdAt: serverTimestamp()
      });

      alert("Ödül talebin başarıyla alındı ve yöneticiye e-posta gönderildi!");
    } catch (error) {
      console.error(error);
      alert("Hata: Ödül talebi işlenemedi.");
    } finally {
      setIsClaiming(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-8 space-y-12"
    >
      {/* Rewards Hero Header */}
      <div className="relative p-10 md:p-12 bg-white rounded-[3rem] card-shadow border border-slate-50 overflow-hidden group">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-50/50 clip-path-hero" />
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest"
            >
              <Gift className="w-3 h-3" />
              Puanlarını Ödüle Dönüştür
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Ödül <span className="text-emerald-600">Mağazası</span>
            </h1>
            <p className="text-slate-500 font-bold max-w-md leading-relaxed">
              Zorlu çalışmalarının karşılığını alma vakti geldi. Başarı puanlarınla fiziksel veya dijital ödülleri hemen talep edebilirsin.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
             <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl text-right">
                <span className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Mevcut Bakiyen</span>
                <div className="flex items-baseline gap-1">
                   <span className="text-4xl font-black text-emerald-700 tracking-tighter">{userScore}</span>
                   <span className="text-sm font-black text-emerald-600">PT</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Featured Box Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-indigo-100">
          <Package className="w-5 h-5 text-indigo-500" />
          <h2 className="text-xl font-bold text-slate-900">Fiziksel Kutular</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {physicalRewards.map((box, idx) => {
            const isLocked = userScore < box.points;
            return (
              <div key={idx} className="group reward-card relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-50 transition-all card-shadow">
                 <div className="aspect-video overflow-hidden">
                    <img src={box.image} alt={box.title} className={cn("w-full h-full object-cover transition-transform duration-500 group-hover:scale-105", isLocked && "grayscale")} />
                 </div>
                 <div className="p-10">
                    <div className="flex justify-between items-start mb-6">
                       <div>
                          <h3 className="text-2xl font-bold text-slate-900 mb-2">{box.title}</h3>
                          <p className="text-sm text-slate-500 leading-relaxed">{box.desc}</p>
                       </div>
                       <div className="text-right">
                          <span className="block font-black text-indigo-600 text-lg">{box.points} PT</span>
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Gerekli</span>
                       </div>
                    </div>
                    
                    <button 
                      disabled={isLocked || !!isClaiming}
                      onClick={() => handleClaimReward(box)}
                      className={cn(
                        "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
                        isLocked 
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                          : "vibrant-gradient text-white hover:opacity-90 shadow-indigo-100"
                      )}
                    >
                      {isClaiming === box.title ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        isLocked ? <Lock className="w-4 h-4" /> : <Gift className="w-4 h-4" />
                      )}
                      {isClaiming === box.title ? "İşleniyor..." : (isLocked ? "Yetersiz Puan" : "Kutuyu Al")}
                    </button>
                 </div>
                 {isLocked && (
                   <div className="absolute top-6 right-6 bg-slate-900/80 text-white text-[10px] font-bold px-4 py-1.5 rounded-full backdrop-blur-sm tracking-widest uppercase">
                      KİLİTLİ
                   </div>
                 )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Digital Rewards */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-indigo-100">
          <Ticket className="w-5 h-5 text-indigo-500" />
          <h2 className="text-xl font-bold text-slate-900">Dijital Avantajlar</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {digitalRewards.map((reward, idx) => {
             const isLocked = userScore < reward.points;
             return (
               <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-50 card-shadow flex items-center justify-between group hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                     <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", isLocked ? "bg-slate-100" : "bg-indigo-50")}>
                        <reward.icon className={cn("w-6 h-6", isLocked ? "text-slate-400" : "text-indigo-600")} />
                     </div>
                     <div>
                        <h4 className="font-black text-xs uppercase text-slate-400 tracking-tight">{reward.brand}</h4>
                        <p className="font-bold text-sm text-slate-800">{reward.title}</p>
                     </div>
                  </div>
                  <div className="text-right">
                    <span className={cn("block font-black text-sm", isLocked ? "text-slate-200" : "text-indigo-600")}>{reward.points} PT</span>
                    <button 
                      onClick={() => handleClaimReward(reward)}
                      disabled={isLocked || !!isClaiming} 
                      className={cn("text-[10px] font-bold uppercase underline", isLocked ? "text-slate-300" : "text-indigo-500 hover:text-indigo-700")}
                    >
                      {isClaiming === reward.title ? "..." : "AL"}
                    </button>
                  </div>
               </div>
             );
          })}
        </div>
      </section>

      {/* Academic Rewards */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-indigo-100">
          <GraduationCap className="w-5 h-5 text-indigo-500" />
          <h2 className="text-xl font-bold text-slate-900">Akademik Ayrıcalıklar</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {academicRewards.map((reward, idx) => {
             const isLocked = userScore < reward.points;
             return (
               <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-50 card-shadow flex items-center justify-between group hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                     <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", isLocked ? "bg-slate-100" : "bg-indigo-50")}>
                        <reward.icon className={cn("w-6 h-6", isLocked ? "text-slate-400" : "text-indigo-600")} />
                     </div>
                     <div>
                        <h4 className="font-black text-xs uppercase text-slate-400 tracking-tight">{reward.brand}</h4>
                        <p className="font-bold text-sm text-slate-800">{reward.title}</p>
                     </div>
                  </div>
                  <div className="text-right">
                    <span className={cn("block font-black text-sm", isLocked ? "text-slate-200" : "text-indigo-600")}>{reward.points} PT</span>
                    <button 
                      onClick={() => handleClaimReward(reward)}
                      disabled={isLocked || !!isClaiming} 
                      className={cn("text-[10px] font-bold uppercase underline", isLocked ? "text-slate-300" : "text-indigo-500 hover:text-indigo-700")}
                    >
                      {isClaiming === reward.title ? "..." : "AL"}
                    </button>
                  </div>
               </div>
             );
          })}
        </div>
      </section>

      <div className="vibrant-gradient text-white p-12 rounded-[3.5rem] text-center space-y-6 shadow-2xl shadow-indigo-200 relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h2 className="text-4xl font-black leading-tight uppercase tracking-tight">Yeterli puanın yok mu?</h2>
            <p className="text-white/80 max-w-lg mx-auto font-medium">Not paylaş, quizleri tamamla veya topluluğa katkıda bulunarak puanlarını anında artırabilirsin.</p>
            <button className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-xl mt-4">
              HEMEN PUAN KAZAN
            </button>
          </div>
          <div className="absolute -left-10 -bottom-10 opacity-10">
             <Gift className="w-64 h-64" />
          </div>
      </div>
    </motion.div>
  );
}
