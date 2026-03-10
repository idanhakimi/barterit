import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Star, Eye } from "lucide-react";
import { motion } from "framer-motion";

// Generate a consistent avatar based on user id/name
const getAvatarUrl = (user) => {
  const seed = user.id || user.full_name || "user";
  const gender = user.gender === "female" ? "women" : "men";
  // Use a simple hash to pick consistent number
  const num = Math.abs(seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 70 + 1;
  return `https://randomuser.me/api/portraits/${gender}/${num}.jpg`;
};

export default function UserCard({ user, onSwipe }) {
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [avatarError, setAvatarError] = React.useState(false);

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    const threshold = 100;
    if (Math.abs(info.offset.x) > threshold) {
      onSwipe(user.id, info.offset.x > 0);
    }
    setDragOffset({ x: 0, y: 0 });
  };

  const cardRotation = dragOffset.x * 0.1;
  const cardOpacity = isDragging ? 0.85 : 1;

  const avatarSrc = user.profile_image && !avatarError
    ? user.profile_image
    : getAvatarUrl(user);

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragStart={() => setIsDragging(true)}
      onDrag={(event, info) => setDragOffset(info.offset)}
      onDragEnd={handleDragEnd}
      animate={{ x: dragOffset.x, y: dragOffset.y, rotate: cardRotation, opacity: cardOpacity }}
      className="relative cursor-grab active:cursor-grabbing"
      whileTap={{ scale: 0.98 }}
    >
      <Card className="rounded-3xl overflow-hidden shadow-xl border border-gray-200 bg-white max-w-sm mx-auto">
        {/* Profile Image */}
        <div className="relative h-80 bg-gradient-to-br from-orange-100 to-teal-100">
          <img
            src={avatarSrc}
            alt={user.full_name}
            className="w-full h-full object-cover"
            onError={() => setAvatarError(true)}
          />

          {/* Status Badges top */}
          <div className="absolute top-3 right-3 flex gap-2">
            {user.verified && (
              <Badge className="bg-green-500 text-white shadow-md text-xs">מאומת ✓</Badge>
            )}
          </div>

          {/* Like/Dislike Overlay */}
          {isDragging && (
            <>
              <motion.div
                animate={{ opacity: dragOffset.x > 50 ? 1 : 0 }}
                className="absolute inset-0 bg-green-500/20 flex items-center justify-center"
              >
                <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-xl">
                  ❤️ לייק!
                </div>
              </motion.div>
              <motion.div
                animate={{ opacity: dragOffset.x < -50 ? 1 : 0 }}
                className="absolute inset-0 bg-red-500/20 flex items-center justify-center"
              >
                <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-xl">
                  👎 לא מתאים
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* User Info - light background, dark text */}
        <div className="p-5 bg-white space-y-3">
          {/* Name + location row */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{user.full_name}</h3>
              <div className="flex items-center gap-1 text-gray-500 text-sm mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{user.location || "ישראל"}{user.age ? ` • גיל ${user.age}` : ""}</span>
              </div>
            </div>

            {/* Rating + Views */}
            <div className="flex flex-col gap-1.5 items-end">
              {user.rating > 0 ? (
                <div className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-lg">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-bold text-yellow-700">{Number(user.rating).toFixed(1)}</span>
                  {user.total_ratings > 0 && (
                    <span className="text-xs text-yellow-600">({user.total_ratings})</span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-lg">
                  <Star className="w-3.5 h-3.5 text-gray-300" />
                  <span className="text-xs text-gray-400">חדש</span>
                </div>
              )}
              {user.profile_views > 0 && (
                <div className="flex items-center gap-1 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-medium text-blue-600">{user.profile_views}</span>
                </div>
              )}
            </div>
          </div>

          {user.bio && (
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{user.bio}</p>
          )}

          {/* Services Offered */}
          {user.services_offered && user.services_offered.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 mb-1.5">מציע:</h4>
              <div className="flex flex-wrap gap-1.5">
                {user.services_offered.slice(0, 3).map((service, i) => (
                  <Badge key={i} className="bg-orange-100 text-orange-700 border border-orange-200 text-xs font-medium">
                    {service}
                  </Badge>
                ))}
                {user.services_offered.length > 3 && (
                  <Badge className="bg-gray-100 text-gray-600 border border-gray-200 text-xs">
                    +{user.services_offered.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Services Wanted */}
          {user.services_wanted && user.services_wanted.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 mb-1.5">מחפש:</h4>
              <div className="flex flex-wrap gap-1.5">
                {user.services_wanted.slice(0, 3).map((service, i) => (
                  <Badge key={i} className="bg-teal-100 text-teal-700 border border-teal-200 text-xs font-medium">
                    {service}
                  </Badge>
                ))}
                {user.services_wanted.length > 3 && (
                  <Badge className="bg-gray-100 text-gray-600 border border-gray-200 text-xs">
                    +{user.services_wanted.length - 3}
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