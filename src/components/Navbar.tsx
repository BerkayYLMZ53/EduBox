import { Link, useLocation } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { LayoutDashboard, Gift, ClipboardCheck, Users, LogOut, Package2, User, Bell, Check, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { useUserProfile } from '../hooks/useUserProfile';
import { useNotifications } from '../hooks/useNotifications';
import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import FeedbackModal from './FeedbackModal';

export default function Navbar() {
  const location = useLocation();
  const { profile } = useUserProfile();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { name: 'Panel', path: '/', icon: LayoutDashboard },
    { name: 'Ödüller', path: '/rewards', icon: Gift },
    { name: 'Görevler', path: '/tasks', icon: ClipboardCheck },
    { name: 'Topluluk', path: '/community', icon: Users },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-indigo-100 px-4 md:px-8 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 vibrant-gradient rounded-lg flex items-center justify-center shadow-md">
            <Package2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-indigo-600">EduBox</span>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2",
                  isActive 
                    ? "bg-indigo-50 text-indigo-700" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {/* Feedback */}
          <button 
            onClick={() => setShowFeedback(true)}
            className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all"
            title="Geri Bildirim Gönder"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-indigo-50 overflow-hidden z-[100]"
              >
                <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest px-2">Bildirimler</h4>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] font-bold text-indigo-600 hover:underline"
                    >
                      Hepsini Oku
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Bell className="w-6 h-6 text-slate-200" />
                      </div>
                      <p className="text-xs font-bold text-slate-400">Henüz bildirim yok.</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={cn(
                          "p-4 border-b border-slate-50 last:border-0 cursor-pointer transition-colors",
                          n.read ? "bg-white opacity-60" : "bg-indigo-50/30 hover:bg-indigo-50/50"
                        )}
                      >
                        <div className="flex gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            n.type === 'badge' ? "bg-yellow-100 text-yellow-600" :
                            n.type === 'community' ? "bg-emerald-100 text-emerald-600" : "bg-indigo-100 text-indigo-600"
                          )}>
                            {n.type === 'badge' ? <Gift className="w-4 h-4" /> :
                             n.type === 'community' ? <Users className="w-4 h-4" /> : <ClipboardCheck className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{n.title}</p>
                            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{n.message}</p>
                            <p className="text-[10px] font-bold text-slate-300 mt-2 uppercase">Yeni</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link 
          to="/profile"
          className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-indigo-100 transition-all"
        >
          {(profile as any)?.photoURL || auth.currentUser?.photoURL ? (
             <img src={(profile as any)?.photoURL || auth.currentUser?.photoURL!} className="w-full h-full object-cover" alt="Profile" />
          ) : (
             <User className="w-5 h-5 text-slate-400" />
          )}
        </Link>
          <button
            onClick={() => signOut(auth)}
            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-red-500 px-4 py-2 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </nav>

      <FeedbackModal 
        isOpen={showFeedback} 
        onClose={() => setShowFeedback(false)} 
      />
    </>
  );
}
