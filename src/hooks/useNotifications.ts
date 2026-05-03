import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'task' | 'badge' | 'community';
  read: boolean;
  createdAt: any;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Notification[] = [];
      let unread = 0;
      snapshot.forEach((doc) => {
        const data = doc.data() as Notification;
        msgs.push({ ...data, id: doc.id });
        if (!data.read) unread++;
      });
      setNotifications(msgs);
      setUnreadCount(unread);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const docRef = doc(db, 'notifications', id);
      await updateDoc(docRef, { read: true });
    } catch (e) {
      console.error("Mark as read failed", e);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    for (const n of unreadNotifications) {
      await markAsRead(n.id);
    }
  };

  return { notifications, loading, unreadCount, markAsRead, markAllAsRead };
}
