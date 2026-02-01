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
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.5 11c.83 0 1.5-.67 1.5-1.5 0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5c0 .83.67 1.5 1.5 1.5zM6.5 11c.83 0 1.5-.67 1.5-1.5C8 8.67 7.33 8 6.5 8S5 8.67 5 9.5C5 10.33 5.67 11 6.5 11zm8.5 2c-.28 0-.5.22-.5.5s.22.5.5.5h3c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3zm-9 0c-.28 0-.5.22-.5.5s.22.5.5.5h3c.28 0 .5-.22.5-.5s-.22-.5-.5-.5H6zM18 7c-1.15 0-2.14.67-2.61 1.64-.75-.42-1.6-.64-2.51-.64-.85 0-1.67.2-2.39.56-.47-1.03-1.5-1.75-2.69-1.75-1.66 0-3 1.34-3 3 0 .74.29 1.41.76 1.91-.47.5-.76 1.17-.76 1.91 0 1.66 1.34 3 3 3 1.19 0 2.22-.72 2.69-1.75.72.36 1.54.56 2.39.56.91 0 1.76-.22 2.51-.64.47.97 1.46 1.64 2.61 1.64 1.66 0 3-1.34 3-3s-1.34-3-3-3z"/>
          </svg>
        </Button>
      </motion.div>
    </div>
  );
}