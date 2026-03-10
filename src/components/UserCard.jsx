import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Eye } from "lucide-react";

export default function UserCard({ user, onSwipe }) {
  if (!user) return null;

  const initials = user.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <Card className="glass-card overflow-hidden max-w-sm mx-auto">
      {/* Profile Image */}
      <div className="relative h-72 bg-gradient-to-br from-orange-100 to-teal-100 flex items-center justify-center">
        {user.profile_image ? (
          <img
            src={user.profile_image}
            alt={user.full_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-gradient-to-r from-orange-400 to-teal-400 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
            {initials}
          </div>
        )}
      </div>

      <CardContent className="p-4 bg-white text-gray-900">
        {/* Name & Location */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.full_name}</h2>
            {user.location && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                {user.location}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 text-sm">
            {user.rating > 0 && (
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-semibold text-gray-700">{Number(user.rating).toFixed(1)}</span>
              </div>
            )}
            {user.profile_views > 0 && (
              <div className="flex items-center gap-1 text-blue-400 text-xs">
                <Eye className="w-3.5 h-3.5" />
                <span>{user.profile_views}</span>
              </div>
            )}
          </div>
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