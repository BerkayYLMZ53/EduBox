import { Link, useLocation } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { LayoutDashboard, Gift, ClipboardCheck, Users, LogOut, Package2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { name: 'Panel', path: '/', icon: LayoutDashboard },
    { name: 'Ödüller', path: '/rewards', icon: Gift },
    { name: 'Görevler', path: '/tasks', icon: ClipboardCheck },
    { name: 'Topluluk', path: '/community', icon: Users },
  ];

  return (
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

      <button
        onClick={() => signOut(auth)}
        className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-red-500 px-4 py-2 rounded-xl transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Çıkış</span>
      </button>
    </nav>
  );
}
