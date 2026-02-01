import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Star, User } from "lucide-react";
import { motion } from "framer-motion";

export default function UserCard({ user, onSwipe }) {
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    const threshold = 100;
    
    if (Math.abs(info.offset.x) > threshold) {
      const liked = info.offset.x > 0;
      onSwipe(user.id, liked);
    }
    
    setDragOffset({ x: 0, y: 0 });
  };

  const cardRotation = dragOffset.x * 0.1;
  const cardOpacity = isDragging ? 0.8 : 1;

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragStart={() => setIsDragging(true)}
      onDrag={(event, info) => setDragOffset(info.offset)}
      onDragEnd={handleDragEnd}
      animate={{ 
        x: dragOffset.x, 
        y: dragOffset.y, 
        rotate: cardRotation,
        opacity: cardOpacity 
      }}
      className="relative cursor-grab active:cursor-grabbing"
      whileTap={{ scale: 0.95 }}
    >
      <Card className="glass-card rounded-3xl overflow-hidden shadow-xl border-2 border-white/50 max-w-sm mx-auto">
        {/* Profile Image */}
        <div className="relative h-80 bg-gradient-to-br from-orange-200 to-teal-200">
          {user.profile_image ? (
            <img 
              src={user.profile_image} 
              alt={user.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-20 h-20 text-white/70" />
            </div>
          )}
          
          {/* Status Badges */}
          <div className="absolute top-4 right-4 flex gap-2">
            {user.verified && (
              <Badge className="bg-green-500 text-white shadow-lg">
                מאומת ✓
              </Badge>
            )}
            {user.rating > 0 && (
              <Badge className="bg-yellow-500 text-white shadow-lg flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                {user.rating.toFixed(1)}
              </Badge>
            )}
          </div>

          {/* Like/Dislike Indicators */}
          {isDragging && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: dragOffset.x > 50 ? 1 : 0,
                  scale: dragOffset.x > 50 ? 1.2 : 1
                }}
                className="absolute inset-0 bg-green-500/20 flex items-center justify-center"
              >
                <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg">
                  אוהב! ❤️
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: dragOffset.x < -50 ? 1 : 0,
                  scale: dragOffset.x < -50 ? 1.2 : 1
                }}
                className="absolute inset-0 bg-red-500/20 flex items-center justify-center"
              >
                <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg">
                  לא מתאים 👎
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* User Info */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-100">{user.full_name}</h3>
              <div className="flex items-center gap-2 text-gray-300 text-sm mt-1">
                <MapPin className="w-4 h-4" />
                {user.location} {user.age && `• גיל ${user.age}`}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              {user.rating > 0 && (
                <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-lg">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-sm font-semibold text-yellow-400">
                    {user.rating.toFixed(1)}
                  </span>
                </div>
              )}
              {user.profile_views > 0 && (
                <div className="flex items-center gap-1 bg-blue-500/20 px-2 py-1 rounded-lg">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-sm font-semibold text-blue-400">
                    {user.profile_views}
                  </span>
                </div>
              )}
            </div>
          </div>

          {user.bio && (
            <p className="text-gray-300 text-sm leading-relaxed">{user.bio}</p>
          )}

          {/* Services Offered */}
          {user.services_offered && user.services_offered.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-300 mb-2">מציע:</h4>
              <div className="flex flex-wrap gap-2">
                {user.services_offered.slice(0, 3).map((service, index) => (
                  <Badge key={index} className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                    {service}
                  </Badge>
                ))}
                {user.services_offered.length > 3 && (
                  <Badge className="bg-gray-700/50 text-gray-400 border-gray-600">
                    +{user.services_offered.length - 3} נוספים
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Services Wanted */}
          {user.services_wanted && user.services_wanted.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-300 mb-2">מחפש:</h4>
              <div className="flex flex-wrap gap-2">
                {user.services_wanted.slice(0, 3).map((service, index) => (
                  <Badge key={index} className="bg-teal-500/20 text-teal-400 border-teal-500/30">
                    {service}
                  </Badge>
                ))}
                {user.services_wanted.length > 3 && (
                  <Badge className="bg-gray-700/50 text-gray-400 border-gray-600">
                    +{user.services_wanted.length - 3} נוספים
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}