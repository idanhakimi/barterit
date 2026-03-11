import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, Heart, MessageCircle, Calendar, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { he } from "date-fns/locale";

const ICONS = {
  new_like: <Heart className="w-4 h-4 text-red-500" />,
  new_message: <MessageCircle className="w-4 h-4 text-blue-500" />,
  meeting_confirmed: <Calendar className="w-4 h-4 text-green-500" />,
  meeting_cancelled: <Calendar className="w-4 h-4 text-red-500" />,
  meeting_reminder: <Bell className="w-4 h-4 text-orange-500" />,
};

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    loadNotifications();

    // Real-time subscription
    const unsub = base44.entities.Notification.subscribe((event) => {
      if (event.data?.user_id === userId && event.type === "create") {
        setNotifications(prev => [event.data, ...prev]);
      }
    });

    return () => unsub();
  }, [userId]);

  // Close on outside click
  useEffect(() => {
    const handle = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const loadNotifications = async () => {
    try {
      const notifs = await base44.entities.Notification.filter({ user_id: userId }, "-created_date", 20);
      setNotifications(notifs);
    } catch (e) {}
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { read: true })));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = async (id) => {
    await base44.entities.Notification.update(id, { read: true });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen && unreadCount > 0) markAllRead(); }}
        className="relative p-2 rounded-xl text-gray-500 hover:text-orange-500 hover:bg-orange-50 transition-colors"
        aria-label="התראות"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute left-0 md:left-auto md:right-0 top-12 w-screen max-w-sm bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
            style={{ maxWidth: 'min(320px, calc(100vw - 1rem))' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-800">התראות</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">אין התראות עדיין</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`flex gap-3 px-4 py-3 border-b last:border-0 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? "bg-orange-50" : ""}`}
                  >
                    <div className="mt-0.5 flex-shrink-0">{ICONS[n.type] || <Bell className="w-4 h-4 text-gray-400" />}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium text-gray-800 ${!n.read ? "font-semibold" : ""}`}>{n.title}</p>
                      {n.body && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(n.created_date), "d MMM, HH:mm", { locale: he })}
                      </p>
                    </div>
                    {!n.read && <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}