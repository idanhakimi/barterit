import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import SuperLikeManager from "./SuperLikeManager";

export default function SwipeButtons({ onLike, onDislike, onSuperLike, disabled, currentUser }) {
  return (
    <div className="flex justify-center items-center gap-4 py-6">
      <motion.div whileTap={{ scale: 0.9 }}>
        <Button
          size="lg"
          variant="outline"
          className="w-14 h-14 rounded-full border-2 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600 shadow-lg"
          onClick={onDislike}
          disabled={disabled}
        >
          <X className="w-6 h-6" />
        </Button>
      </motion.div>

      <motion.div whileTap={{ scale: 0.9 }}>
        <SuperLikeManager 
          onSuperLike={onSuperLike}
          disabled={disabled}
          targetUserId={currentUser?.id}
        />
      </motion.div>

      <motion.div whileTap={{ scale: 0.9 }}>
        <Button
          size="lg"
          className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-teal-500 hover:from-orange-600 hover:to-teal-600 text-white shadow-xl transform hover:scale-105 transition-all duration-200"
          onClick={onLike}
          disabled={disabled}
        >
          <Heart className="w-7 h-7 fill-current" />
        </Button>
      </motion.div>
    </div>
  );
}