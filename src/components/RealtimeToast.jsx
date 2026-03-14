import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Bell, X } from "lucide-react";

const ICONS = {
  new_like: <Heart className="w-5 h-5 text-red-500" />,
  new_match: <Heart className="w-5 h-5 text-pink-500 fill-current" />,
  new_message: <MessageCircle className="w-5 h-5 text-blue-500" />,
  meeting_confirmed: <Bell className="w-5 h-5 text-green-500" />,
  meeting_cancelled: <Bell className="w-5 h-5 text-red-500" />,
  meeting_reminder: <Bell className="w-5 h-5 text-orange-500" />,
};

export default function RealtimeToast({ userId }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const unsub = base44.entities.Notification.subscribe((event) => {
      if (event.data?.user_id === userId && event.type === "create") {
        const notif = event.data;
        const id = notif.id || Date.now();
        setToasts(prev => [...prev, { ...notif, toastId: id }]);
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.toastId !== id));
        }, 5000);
      }
    });

    return () => unsub();
  }, [userId]);

  const dismiss = (toastId) => {
    setToasts(prev => prev.filter(t => t.toastId !== toastId));
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none w-full px-4" style={{ maxWidth: 400 }}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.toastId}
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="pointer-events-auto w-full bg-white rounded-2xl shadow-2xl border border-gray-100 px-4 py-3 flex items-center gap-3"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
              {ICONS[toast.type] || <Bell className="w-5 h-5 text-orange-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{toast.title}</p>
              {toast.body && <p className="text-xs text-gray-500 truncate">{toast.body}</p>}
            </div>
            <button
              onClick={() => dismiss(toast.toastId)}
              className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}