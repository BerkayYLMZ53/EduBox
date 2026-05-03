import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { motion } from 'motion/react';
import { Package2, GraduationCap, TrendingUp, Users } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Login() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-center p-12 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full -ml-32 -mb-32"></div>
        
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="max-w-md relative z-10"
        >
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 vibrant-gradient rounded-2xl shadow-lg flex items-center justify-center">
              <Package2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase">EduBox</span>
          </div>
          <h1 className="text-5xl font-black leading-[1.1] mb-8 uppercase tracking-tight">
            Akademik başarını <span className="text-indigo-400">somut ödüllere</span> dönüştür.
          </h1>
          <p className="text-slate-400 text-lg mb-12 font-medium leading-relaxed">
            EduBox, transkriptlerin ötesine geçer. Seviye atla, rozetler kazan ve hedeflerine ulaştığında kapına gelen sürprizlerle ödüllendiril.
          </p>

          <div className="space-y-10">
            {[
              { icon: GraduationCap, title: "Doğrulanmış Başarı", desc: "Performansını başarı skoruna dönüştür.", color: "text-indigo-400" },
              { icon: TrendingUp, title: "Akıllı Takip", desc: "Bölümüne özel gelişimini izle.", color: "text-purple-400" },
              { icon: Users, title: "Öğrenci Topluluğu", desc: "Yardımlaşma ekosistemine katıl.", color: "text-blue-400" }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-5">
                <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5", item.color)}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{item.title}</h3>
                  <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-center p-8 bg-[#F0F4FF]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center bg-white p-10 rounded-[3rem] shadow-2xl shadow-indigo-100"
        >
          <div className="md:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 vibrant-gradient rounded-xl shadow-lg flex items-center justify-center">
              <Package2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase">EduBox</span>
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Hoş Geldin</h2>
          <p className="text-slate-400 mb-10 font-bold text-sm tracking-wide">Öğrenci e-postan ile giriş yaparak hemen başla.</p>

          <button
            onClick={handleLogin}
            className="w-full py-5 bg-white border-2 border-slate-50 rounded-2xl flex items-center justify-center gap-3 font-black text-sm text-slate-800 hover:bg-slate-50 transition-all shadow-md group"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
            GOOGLE İLE GİRİŞ YAP
          </button>

          <p className="mt-8 text-[11px] text-slate-300 font-bold uppercase tracking-widest leading-relaxed">
            Giriş yaparak kullanım koşullarını kabul etmiş olursun.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
