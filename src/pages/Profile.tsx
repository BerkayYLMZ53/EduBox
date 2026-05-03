import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { motion } from 'motion/react';
import { useUserProfile } from '../hooks/useUserProfile';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Camera, User, BookOpen, GraduationCap, Save, Loader2, Mail, Sparkles, Lightbulb, Target, Rocket, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { getPersonalizedRecommendations } from '../services/geminiService';

export default function Profile() {
  const { profile, loading: profileLoading } = useUserProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [tipsLoading, setTipsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setEmail(profile.email || '');
      setDepartment(profile.department || '');

      setTipsLoading(true);
      getPersonalizedRecommendations(profile.department || 'Genel', profile.successScore || 0)
        .then(tips => {
          setRecommendations(tips);
          setTipsLoading(false);
        });
    }
  }, [profile]);

  if (profileLoading) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    setSaveSuccess(false);
    const userPath = `users/${profile.uid}`;
    try {
      const userRef = doc(db, 'users', profile.uid);
      const updates: any = {
        displayName: displayName.trim() || profile.displayName,
        department: department || profile.department,
      };
      
      if (photoBase64) {
        updates.photoURL = photoBase64;
      }
      
      await updateDoc(userRef, updates);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, userPath);
    } finally {
      setIsSaving(false);
    }
  };

  const DEPARTMENTS = [
    "Bilgisayar Mühendisliği",
    "Endüstriyel Tasarım",
    "İşletme",
    "Psikoloji",
    "Hukuk",
    "Mimarlık",
    "Tıp Fakültesi",
    "İletişim Fakültesi",
    "Mühendislik Fakültesi",
    "Fen-Edebiyat Fakültesi",
    "İktisadi ve İdari Bilimler",
    "Diğer"
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-12 max-w-2xl mx-auto space-y-10"
    >
      {/* Profile Hero Header */}
      <div className="relative p-10 bg-white rounded-[3rem] card-shadow border border-slate-50 overflow-hidden group">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 clip-path-hero" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-slate-200/20 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative z-10 flex items-center justify-between gap-8">
          <div className="space-y-3">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 text-white rounded-full text-[10px] font-black uppercase tracking-widest"
            >
              <User className="w-3 h-3" />
              Hesap Ayarları
            </motion.div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Profilini <span className="text-slate-400">Yönet</span>
            </h1>
            <p className="text-slate-500 font-bold text-sm leading-relaxed">
              Akademik kimliğini ve kişisel tercihlerini buradan düzenleyebilirsin.
            </p>
          </div>
          
          <div className="hidden sm:block">
             <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center shadow-inner">
                <Camera className="w-8 h-8 text-slate-300" />
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] p-10 card-shadow border border-slate-50 space-y-10">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
              {(profile as any)?.photoURL || photoBase64 ? (
                <img 
                  src={photoBase64 || (profile as any)?.photoURL} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User className="w-12 h-12 text-indigo-200" />
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-10 h-10 vibrant-gradient text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>
          <p className="mt-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Fotoğrafı Değiştir</p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
              <User className="w-3 h-3" /> Tam Ad
            </label>
            <input 
              type="text"
              placeholder="Ad Soyad"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
              <Mail className="w-3 h-3" /> E-posta (Değiştirilemez)
            </label>
            <input 
              type="email"
              placeholder="ogrenci@universite.edu.tr"
              value={email}
              readOnly
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none font-bold text-slate-400 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
              <BookOpen className="w-3 h-3" /> Bölüm / Fakülte
            </label>
            <div className="relative group">
              <select 
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-bold appearance-none cursor-pointer"
              >
                <option value="" disabled>Bölümünü Seç</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
             <div className="bg-indigo-50 p-6 rounded-3xl text-center border-2 border-indigo-100">
                <GraduationCap className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <span className="block text-[10px] font-black text-indigo-400 uppercase">Seviye</span>
                <span className="text-2xl font-black text-indigo-600">{profile?.level}</span>
             </div>
             <div className="bg-yellow-50 p-6 rounded-3xl text-center border-2 border-yellow-100">
                <Save className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <span className="block text-[10px] font-black text-yellow-500 uppercase">Skor</span>
                <span className="text-2xl font-black text-yellow-600 font-serif">{profile?.successScore}</span>
             </div>
          </div>

          {/* Level Progress Bar Profile */}
          <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Level {(profile?.level || 0) + 1} İçin İlerleme
                </span>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                  {Math.min(100, Math.floor(((profile?.successScore || 0) % 500) / 500 * 100))}%
                </span>
              </div>
              <div className="h-4 bg-white rounded-full overflow-hidden border border-slate-100 p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((profile?.successScore || 0) % 500) / 500 * 100}%` }}
                    className="h-full vibrant-gradient rounded-full"
                  />
              </div>
              <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest">
                {(profile?.successScore || 0) % 500} / 500 PT
              </p>
          </div>
        </div>

        {/* AI Recommendations Section */}
        <div className="bg-white rounded-[3rem] p-10 card-shadow border border-slate-50 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 leading-tight">Yol Haritana Özel Tavsiyeler</h3>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Yapay Zeka Destekli Gelişim</p>
            </div>
          </div>

          <div className="space-y-4">
            {tipsLoading ? (
              <div className="py-8 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tavsiyeler Hazırlanıyor...</p>
              </div>
            ) : (
              <>
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100 flex gap-4"
                >
                  <Lightbulb className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xs font-black text-blue-700 uppercase tracking-widest mb-1">Akademik İpucu</h4>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{recommendations[0]}</p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100 flex gap-4"
                >
                  <Target className="w-6 h-6 text-emerald-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-1">Motivasyon</h4>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{recommendations[1]}</p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-5 bg-purple-50/50 rounded-3xl border border-purple-100 flex gap-4"
                >
                  <Rocket className="w-6 h-6 text-purple-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xs font-black text-purple-700 uppercase tracking-widest mb-1">Kariyer Adımı</h4>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{recommendations[2]}</p>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            "w-full py-5 vibrant-gradient text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 hover:opacity-90 transition-all",
            isSaving && "opacity-50 cursor-wait",
            saveSuccess && "bg-emerald-500 from-emerald-500 to-emerald-600 shadow-emerald-100"
          )}
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : saveSuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              BAŞARIYLA KAYDEDİLDİ
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              AYARLARI KAYDET
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
