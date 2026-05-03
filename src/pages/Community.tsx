import { useState, useEffect, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Users, Search, MessageSquare, ThumbsUp, Send, FileText, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useUserProfile } from '../hooks/useUserProfile';

interface StudyNote {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  department: string;
  content: string;
  upvotes: number;
  approved: boolean;
  createdAt: any;
}

export default function Community() {
  const { profile } = useUserProfile();
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', department: '', content: '' });

  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyNote));
      setNotes(notesList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile || !newNote.title || !newNote.content) return;

    try {
      await addDoc(collection(db, 'notes'), {
        ...newNote,
        authorId: profile.uid,
        authorName: profile.displayName,
        upvotes: 0,
        approved: true, // Auto-approve for demo
        createdAt: serverTimestamp(),
      });
      setShowAddModal(false);
      setNewNote({ title: '', department: '', content: '' });
      
      // Award points for sharing
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        successScore: increment(30)
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpvote = async (note: StudyNote) => {
    if (!profile || profile.uid === note.authorId) return;
    
    try {
      const noteRef = doc(db, 'notes', note.id);
      await updateDoc(noteRef, {
        upvotes: increment(1)
      });

      // Award points to author
      const authorRef = doc(db, 'users', note.authorId);
      await updateDoc(authorRef, {
        successScore: increment(5)
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-8 space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Öğrenci Topluluğu</h1>
          <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest">YARDIMLAŞMA / PAYLAŞIM / DESTEK</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 vibrant-gradient text-white px-8 py-4 rounded-2xl font-black hover:opacity-90 transition-all shadow-xl shadow-indigo-100"
        >
          <Plus className="w-5 h-5" />
          NOT PAYLAŞ
        </button>
      </header>

      <div className="relative group">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
         <input 
            type="text" 
            placeholder="Ders adı, bölüm veya konu ara..." 
            className="w-full pl-14 pr-8 py-5 bg-white border border-slate-50 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-slate-800 card-shadow placeholder:text-slate-300"
         />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 bg-white/50 animate-pulse rounded-[2rem]" />)
        ) : (
          notes.map((note) => (
            <motion.div
              key={note.id}
              layout
              className="bg-white p-8 rounded-[2.5rem] border border-slate-50 flex flex-col justify-between group card-shadow hover:shadow-indigo-50 transition-all"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                   <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-indigo-500" />
                   </div>
                   <div className="text-right">
                      <span className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest">{note.department || 'GENEL'}</span>
                      <span className="text-[10px] font-bold text-slate-300">{new Date(note.createdAt?.toDate()).toLocaleDateString('tr-TR')}</span>
                   </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{note.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-3 italic leading-relaxed font-medium">
                  "{note.content}"
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-indigo-500 text-xs shadow-sm">
                      {note.authorName[0]}
                   </div>
                   <span className="text-xs font-bold text-slate-400">{note.authorName}</span>
                </div>
                <button 
                  onClick={() => handleUpvote(note)}
                  className="flex items-center gap-2 text-xs font-black px-4 py-2 hover:bg-indigo-50 rounded-xl transition-all group/btn text-slate-400 hover:text-indigo-600"
                >
                  <ThumbsUp className={cn("w-4 h-4 transition-transform", note.upvotes > 0 && "text-indigo-500 fill-indigo-100")} />
                  {note.upvotes || 0}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-[#1a1a1a]/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="relative w-full max-w-xl bg-[#F0F4FF] p-12 rounded-[3.5rem] shadow-2xl border border-white"
           >
              <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tight">Not Paylaşımı</h2>
              <form onSubmit={handleAddNote} className="space-y-6">
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Başlık</label>
                   <input 
                      required
                      value={newNote.title}
                      onChange={e => setNewNote({...newNote, title: e.target.value})}
                      placeholder="Örn: Calculus II Vize Özetleri"
                      className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-bold"
                   />
                 </div>
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Bölüm</label>
                   <input 
                      value={newNote.department}
                      onChange={e => setNewNote({...newNote, department: e.target.value})}
                      placeholder="Örn: Bilgisayar Mühendisliği"
                      className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-bold"
                   />
                 </div>
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Not İçeriği (Yazı veya Link)</label>
                   <textarea 
                      required
                      value={newNote.content}
                      onChange={e => setNewNote({...newNote, content: e.target.value})}
                      rows={4}
                      placeholder="Ders notlarını buraya yazabilir veya Drive linki paylaşabilirsin..."
                      className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none resize-none focus:ring-2 focus:ring-indigo-100 transition-all font-bold"
                   />
                 </div>
                 <button 
                    type="submit"
                    className="w-full py-5 vibrant-gradient text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-indigo-100"
                 >
                    <Send className="w-5 h-5" />
                    PAYLAŞ (+30 PT)
                 </button>
              </form>
           </motion.div>
        </div>
      )}
    </motion.div>
  );
}
