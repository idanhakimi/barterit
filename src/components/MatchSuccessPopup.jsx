import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function MatchSuccessPopup({ 
  isVisible, 
  matchedUser, 
  onClose, 
  onOpenChat,
  isSuperLike = false 
}) {
  if (!isVisible || !matchedUser) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 10 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20 
          }}
        >
          <Card className="glass-card max-w-sm w-full overflow-hidden">
            {/* Header with celebration animation */}
            <div className="relative bg-gradient-to-r from-orange-500 to-teal-500 p-6 text-center text-white">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="text-6xl mb-2"
              >
                {isSuperLike ? "⚡" : "🎉"}
              </motion.div>
              
              <h2 className="text-2xl font-bold mb-2">
                {isSuperLike ? "סופר התאמה!" : "התאמת ברטר בוצעה!"}
              </h2>
              
              <p className="text-white/90">
                {isSuperLike 
                  ? "קיבלתם התאמה מיוחדת מסופר לייק!"
                  : "אתם ו-" + matchedUser.full_name + " אהבתם אחד את השני"
                }
              </p>
              
              {/* Floating hearts animation */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      opacity: 0,
                      scale: 0,
                      x: Math.random() * 300 - 150,
                      y: 100
                    }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      y: -100,
                      rotate: 360
                    }}
                    transition={{ 
                      duration: 3,
                      delay: i * 0.2,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                    className="absolute"
                  >
                    <Heart className="w-4 h-4 text-white fill-current" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* User info */}
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-200 to-teal-200 rounded-full flex items-center justify-center">
                  {matchedUser.profile_image ? (
                    <img 
                      src={matchedUser.profile_image} 
                      alt={matchedUser.full_name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-xl font-bold text-gray-600">
                      {matchedUser.full_name?.charAt(0) || "?"}
                    </span>
                  )}
                </div>
                
                <div>
                  <h3 className="font-bold text-lg">{matchedUser.full_name}</h3>
                  <p className="text-gray-600">{matchedUser.location}</p>
                  {matchedUser.services_offered && matchedUser.services_offered.length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      מציע: {matchedUser.services_offered[0]}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <Link to={createPageUrl("Chat")} className="block">
                  <Button 
                    className="w-full bg-gradient-to-r from-orange-500 to-teal-500 hover:from-orange-600 hover:to-teal-600 text-white text-lg py-6 rounded-xl shadow-lg"
                    onClick={onOpenChat}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    פתח שיחה
                  </Button>
                </Link>
                
                <Button
                  variant="outline"
                  className="w-full py-3 rounded-xl"
                  onClick={onClose}
                >
                  המשך לסווייפ
                </Button>
              </div>

              {/* Tips */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">
                      טיפ להתחלת שיחה
                    </p>
                    <p className="text-xs text-blue-700">
                      תתחילו בשאלה על השירותים שהם מציעים, או ספרו מה אתם מחפשים
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}