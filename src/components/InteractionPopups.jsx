import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Zap, MessageCircle, Star, Gift, X } from 'lucide-react';

const popupMessages = [
  {
    id: 'first_like',
    trigger: 'like',
    title: 'לייק ראשון! 💚',
    content: 'מעולה! המשיכו כך למצוא את ההתאמה המושלמת',
    icon: Heart,
    color: 'text-green-500'
  },
  {
    id: 'super_like_sent',
    trigger: 'superlike',
    title: 'סופר לייק נשלח! ⚡',
    content: 'המשתמש יקבל התראה מיוחדת על הסופר לייק שלכם',
    icon: Zap,
    color: 'text-yellow-500'
  },
  {
    id: 'first_match',
    trigger: 'match',
    title: 'התאמה ראשונה! 🎉',
    content: 'כל הכבוד! עכשיו תוכלו להתחיל לשוחח',
    icon: MessageCircle,
    color: 'text-blue-500'
  },
  {
    id: 'profile_complete',
    trigger: 'profile',
    title: 'פרופיל הושלם! ⭐',
    content: 'פרופיל מלא מגדיל את הסיכויים להתאמות',
    icon: Star,
    color: 'text-purple-500'
  },
  {
    id: 'daily_bonus',
    trigger: 'daily',
    title: 'בונוס יומי! 🎁',
    content: 'קיבלתם 3 סופר לייקים נוספים להיום',
    icon: Gift,
    color: 'text-pink-500'
  }
];

export default function InteractionPopups({ trigger, onClose }) {
  const [currentPopup, setCurrentPopup] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (trigger) {
      const popup = popupMessages.find(p => p.trigger === trigger);
      if (popup) {
        setCurrentPopup(popup);
        setShowPopup(true);
        
        // Auto close after 3 seconds
        const timer = setTimeout(() => {
          handleClose();
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [trigger]);

  const handleClose = () => {
    setShowPopup(false);
    setTimeout(() => {
      setCurrentPopup(null);
      if (onClose) onClose();
    }, 300);
  };

  if (!currentPopup) return null;

  const IconComponent = currentPopup.icon;

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            duration: 0.5 
          }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <Card className="glass-card p-4 shadow-2xl border-2 border-white/50 max-w-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                  className={`p-2 rounded-full bg-white/80 ${currentPopup.color}`}
                >
                  <IconComponent className="w-6 h-6" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-right">{currentPopup.title}</h3>
                  <p className="text-sm text-gray-600 text-right">{currentPopup.content}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-6 w-6 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}