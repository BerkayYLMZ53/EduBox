import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MessageSquare, Bug, Lightbulb, CheckCircle2, Loader2 } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useUserProfile } from '../hooks/useUserProfile';
import { cn } from '../lib/utils';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FeedbackType = 'suggestion' | 'bug' | 'general';

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { profile } = useUserProfile();
  const [type, setType] = useState<FeedbackType>('general');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !auth.currentUser) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: auth.currentUser.uid,
        userName: profile?.displayName || 'Anonim Öğrenci',
        userEmail: auth.currentUser.email,
        type,
        message,
        createdAt: serverTimestamp(),
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setMessage('');
        setType('general');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Geri bildirim gönderilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 md:p-10">
              {isSuccess ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800">Teşekkürler!</h3>
                  <p className="text-slate-500 font-bold">Geri bildirimin başarıyla iletildi. EduBox'ı birlikte geliştiriyoruz.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">Geri Bildirim</h2>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fikirlerin Bizim İçin Değerli</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'general', label: 'Genel', icon: MessageSquare, color: 'indigo' },
                        { id: 'suggestion', label: 'Öneri', icon: Lightbulb, color: 'blue' },
                        { id: 'bug', label: 'Hata', icon: Bug, color: 'rose' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setType(item.id as FeedbackType)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all",
                            type === item.id 
                              ? `border-${item.color}-500 bg-${item.color}-50 text-${item.color}-600`
                              : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200"
                          )}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mesajın</label>
                      <textarea
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="EduBox hakkında ne düşünüyorsun? Yeni bir özellik mi istersin yoksa bir sorun mu fark ettin?"
                        className="w-full p-6 bg-slate-50 rounded-3xl border-2 border-slate-50 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all font-bold text-slate-700 text-sm min-h-[160px] resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !message.trim()}
                      className="w-full flex items-center justify-center gap-2 py-5 vibrant-gradient text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          GÖNDER
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
