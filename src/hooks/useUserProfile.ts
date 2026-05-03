import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  department: string;
  successScore: number;
  level: number;
  photoURL?: string;
  createdAt: string;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'users', user.uid);
    
    // Use onSnapshot for real-time updates to success score
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        // Initialize profile
        const initialProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Öğrenci',
          department: 'Henüz seçilmedi',
          successScore: 0,
          level: 1,
          createdAt: new Date().toISOString(),
        };
        setDoc(docRef, initialProfile);
        setProfile(initialProfile);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching profile", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { profile, loading };
}
