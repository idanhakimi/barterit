import React, { useState, useEffect } from "react";
import { User, SuperLike } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Clock } from "lucide-react";
import { format } from "date-fns";

export default function SuperLikeManager({ onSuperLike, disabled, targetUserId }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [canSuperLike, setCanSuperLike] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSuperLikeAvailability();
  }, []);

  const checkSuperLikeAvailability = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      // Check if user already used super like today
      const today = format(new Date(), "yyyy-MM-dd");
      const todaySuperLikes = await SuperLike.filter({
        sender_id: user.id,
        date: today
      });
      
      setCanSuperLike(todaySuperLikes.length === 0);
      
    } catch (error) {
      console.error("Error checking super like availability:", error);
    }
    setIsLoading(false);
  };

  const handleSuperLike = async () => {
    if (!canSuperLike || !currentUser || !targetUserId) return;
    
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      
      await SuperLike.create({
        sender_id: currentUser.id,
        receiver_id: targetUserId,
        date: today,
        used: true
      });
      
      setCanSuperLike(false);
      onSuperLike(targetUserId);
      
    } catch (error) {
      console.error("Error sending super like:", error);
    }
  };

  if (isLoading) {
    return (
      <Button
        size="lg"
        variant="outline"
        disabled
        className="w-12 h-12 rounded-full border-2 border-yellow-200 text-yellow-500"
      >
        <Clock className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        size="lg"
        variant="outline"
        className={`w-12 h-12 rounded-full border-2 transition-all duration-200 ${
          canSuperLike && targetUserId
            ? "border-yellow-300 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-700 shadow-lg hover:shadow-yellow-200"
            : "border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
        }`}
        onClick={handleSuperLike}
        disabled={disabled || !canSuperLike || !targetUserId}
      >
        <Zap className={`w-5 h-5 ${canSuperLike ? "fill-current" : ""}`} />
      </Button>
      
      {!canSuperLike && (
        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1">
          יומי
        </Badge>
      )}
      
      {canSuperLike && targetUserId && (
        <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-1">
          זמין
        </Badge>
      )}
    </div>
  );
}