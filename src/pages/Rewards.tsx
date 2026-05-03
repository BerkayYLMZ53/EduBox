import { motion } from 'motion/react';
import { Gift, Package, Ticket, ChevronRight, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { useUserProfile } from '../hooks/useUserProfile';

export default function Rewards() {
  const { profile } = useUserProfile();
  const userScore = profile?.successScore || 0;

  const physicalRewards = [
    { title: "Final Survival Kit", points: 500, type: "Box", desc: "Kahve, enerji içeceği, not defteri ve highlighter seti.", image: "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=400&h=400&auto=format&fit=crop" },
    { title: "EduBox Focus Pack", points: 850, type: "Box", desc: "Masa lambası, kablo düzenleyici ve odaklanma kartları.", image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=400&h=400&auto=format&fit=crop" },
  ];

  const digitalRewards = [
    { brand: "Starbucks", title: "%20 İndirim", points: 50, icon: Ticket, code: "STB24" },
    { brand: "Yemeksepeti", title: "50 TL Kupon", points: 120, icon: Ticket, code: "EDUYEMEK" },
    { brand: "Storytel", title: "1 Ay Premium", points: 200, icon: Ticket, code: "EDUSTORY" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-8 space-y-12"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Ödül Mağazası</h1>
          <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest">
            {userScore} MEVCUT BAŞARI PUANI
          </p>
        </div>
      </header>

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
                      disabled={isLocked}
                      className={cn(
                        "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
                        isLocked 
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                          : "vibrant-gradient text-white hover:opacity-90 shadow-indigo-100"
                      )}
                    >
                      {isLocked ? <Lock className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                      {isLocked ? "Yetersiz Puan" : "Kutuyu Al"}
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
                    <button disabled={isLocked} className={cn("text-[10px] font-bold uppercase underline", isLocked ? "text-slate-300" : "text-indigo-500 hover:text-indigo-700")}>
                      ALINABİLİR
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
