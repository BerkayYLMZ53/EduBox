import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Rewards from './pages/Rewards';
import Tasks from './pages/Tasks';
import Community from './pages/Community';
import Login from './pages/Login';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F0F4FF]">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-4xl font-black tracking-tight text-indigo-600"
        >
          EduBox
        </motion.div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F0F4FF] text-slate-800">
        {user && <Navbar />}
        <main className={user ? "pt-16 px-4 md:px-8 max-w-7xl mx-auto" : ""}>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
              <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/rewards" element={user ? <Rewards /> : <Navigate to="/login" />} />
              <Route path="/tasks" element={user ? <Tasks /> : <Navigate to="/login" />} />
              <Route path="/community" element={user ? <Community /> : <Navigate to="/login" />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </BrowserRouter>
  );
}
