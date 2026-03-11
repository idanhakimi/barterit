import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Eye } from "lucide-react";

// Generic silhouette placeholder (gray SVG avatar)
const PLACEHOLDER_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23d1d5db'/%3E%3Ccircle cx='100' cy='72' r='38' fill='%239ca3af'/%3E%3Cellipse cx='100' cy='180' rx='65' ry='55' fill='%239ca3af'/%3E%3C/svg%3E";

export default function UserCard({ user, onSwipe }) {
  if (!user) return null;

  const profileImage = user.profile_image || PLACEHOLDER_AVATAR;

  return (
    <Card className="glass-card overflow-hidden max-w-sm mx-auto">
      {/* Profile Image - taller on mobile */}
      <div className="relative h-64 sm:h-72 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <img
          src={profileImage}
          alt={user.full_name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = PLACEHOLDER_AVATAR; }}
        />
      </div>

      <CardContent className="p-3 sm:p-4 bg-white text-gray-900">
        {/* Name row with rating & views */}
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-xl font-bold text-gray-900">{user.full_name}</h2>
          <div className="flex items-center gap-2 text-sm flex-shrink-0">
            {user.rating > 0 && (
              <div className="flex items-center gap-0.5 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-semibold text-gray-700">{Number(user.rating).toFixed(1)}</span>
              </div>
            )}
            {user.profile_views > 0 && (
              <div className="flex items-center gap-0.5 text-blue-400 text-xs">
                <Eye className="w-3.5 h-3.5" />
                <span>{user.profile_views}</span>
              </div>
            )}
          </div>
        </div>

        {/* Location + Age */}
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
          {user.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{user.location}</span>
            </div>
          )}
          {user.age && (
            <span className="text-gray-500">גיל {user.age}</span>
          )}
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{user.bio}</p>
        )}

        {/* Services Offered */}
        {user.services_offered?.length > 0 && (
          <div className="mb-2">
            <p className="text-xs font-semibold text-gray-500 mb-1">מציע/ה:</p>
            <div className="flex flex-wrap gap-1">
              {user.services_offered.slice(0, 3).map((s, i) => (
                <Badge key={i} className="bg-orange-100 text-orange-700 border-orange-200 text-xs">{s}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Services Wanted */}
        {user.services_wanted?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">מחפש/ת:</p>
            <div className="flex flex-wrap gap-1">
              {user.services_wanted.slice(0, 3).map((s, i) => (
                <Badge key={i} className="bg-teal-100 text-teal-700 border-teal-200 text-xs">{s}</Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}