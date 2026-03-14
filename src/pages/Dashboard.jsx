import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import UserCard from "../components/UserCard";
import SwipeButtons from "../components/SwipeButtons";
import MatchSuccessPopup from "../components/MatchSuccessPopup";
import FirstTimeTooltips from "../components/FirstTimeTooltips";
import InteractionPopups from "../components/InteractionPopups";

// Helper function to calculate distance
const getDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null || isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return Infinity;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Helper function to get region
const getRegion = (location) => {
    const north = ["חיפה", "קריות", "נהריה", "עכו", "צפת", "טבריה", "כרמיאל", "גולן", "גליל"];
    const south = ["באר שבע", "אשדוד", "אשקלון", "אילת", "דימונה", "נתיבות", "שדרות", "נגב"];
    if (north.some(city => location?.includes(city))) return "צפון";
    if (south.some(city => location?.includes(city))) return "דרום";
    return "מרכז"; // Default to center if not explicitly North or South
};

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [newMatchInfo, setNewMatchInfo] = useState({ user: null, isSuperLike: false });
  const [locationError, setLocationError] = useState(false);
  const [showFirstTime, setShowFirstTime] = useState(false);
  const [interactionTrigger, setInteractionTrigger] = useState(null);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
        try {
            const user = await base44.auth.me();
            setCurrentUser(user);
            
            // Check if first time user
            const isFirstTime = !localStorage.getItem('barter4u_first_time_completed');
            if (isFirstTime) {
              setShowFirstTime(true);
            }

            // Check if profile is incomplete and send daily reminder notification
            const isProfileIncomplete = !user.bio || !user.services_offered?.length || !user.services_wanted?.length || !user.location;
            if (isProfileIncomplete) {
              const lastReminderKey = `barter4u_profile_reminder_${user.id}`;
              const lastReminder = localStorage.getItem(lastReminderKey);
              const now = Date.now();
              const oneDayMs = 24 * 60 * 60 * 1000;
              if (!lastReminder || now - parseInt(lastReminder) > oneDayMs) {
                localStorage.setItem(lastReminderKey, String(now));
                // In-app notification
                base44.entities.Notification.create({
                  user_id: user.id,
                  type: 'new_like',
                  title: '📝 השלם את הפרופיל שלך',
                  body: 'פרופיל מלא מגדיל פי 5 את הסיכוי לקבל התאמות! לחץ כאן להשלמה.',
                  from_user_id: user.id,
                  related_id: user.id,
                });
                // Email reminder
                base44.integrations.Core.SendEmail({
                  to: user.email,
                  subject: '⚡ השלם את הפרופיל שלך ב-BARTER4U',
                  body: `שלום ${user.full_name || ''},\n\nשמנו לב שהפרופיל שלך עדיין לא הושלם.\nפרופיל מלא מגדיל פי 5 את הסיכוי לקבל התאמות מצוינות!\n\nלחץ כאן להשלמת הפרופיל: https://barter4u.base44.app/Profile\n\nצוות BARTER4U 🚀`
                }).catch(() => {});
              }
            }
            
            loadData(user);
        } catch (error) {
            window.location.href = createPageUrl('Home');
        }
    };
    checkAuthAndLoad();
  }, []);
  
  const loadData = async (user) => {
    setIsLoading(true);
    try {
      await fetchPotentialMatches(user);
    } catch (error) {
      console.error("Error loading data:", error);
      setIsLoading(false);
    }
  };

  const fetchPotentialMatches = async (user) => {
    try {
      const [allUsers, myBlockedUsers, usersWhoBlockedMe, matchesAsUser1, matchesAsUser2] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Block.filter({ blocker_id: user.id }),
        base44.entities.Block.filter({ blocked_id: user.id }),
        base44.entities.Match.filter({ user1_id: user.id }),
        base44.entities.Match.filter({ user2_id: user.id }),
      ]);
      const blockedIds = new Set([
          ...myBlockedUsers.map(b => b.blocked_id),
          ...usersWhoBlockedMe.map(b => b.blocker_id)
      ]);
      const previousMatches = [...matchesAsUser1, ...matchesAsUser2];

      // Users I already liked
      const likedOrChatIds = new Set(
        matchesAsUser1
          .filter(m => m.user1_liked === true)
          .map(m => m.user2_id)
      );
      // Users who are already matched with me (in any direction)
      const matchedIds = new Set(
        previousMatches
          .filter(m => m.status === 'matched')
          .map(m => m.user1_id === user.id ? m.user2_id : m.user1_id)
      );

      // 48-hour seen tracking (stored in localStorage)
      const seenKey = `barter4u_seen_${user.id}`;
      let seenData = {};
      try { seenData = JSON.parse(localStorage.getItem(seenKey) || '{}'); } catch {}
      const now = Date.now();
      const hours48 = 48 * 60 * 60 * 1000;
      // Clean expired entries
      Object.keys(seenData).forEach(k => { if (now - seenData[k] > hours48) delete seenData[k]; });

      let filteredUsers = allUsers.filter(u => {
        if (u.id === user.id) return false;
        if (blockedIds.has(u.id)) return false;
        if (matchedIds.has(u.id)) return false;
        // Must have at least 1 service offered and 1 wanted
        if (!u.services_offered || u.services_offered.length === 0) return false;
        if (!u.services_wanted || u.services_wanted.length === 0) return false;
        // Skip if seen in last 48h, unless I liked them or have open chat
        if (seenData[u.id] && !likedOrChatIds.has(u.id)) return false;
        return true;
      });
      
      // Smart matching: prioritize users whose offerings match current user's wants
      const usersWithScores = filteredUsers.map(u => {
        let score = 0;
        
        // Check if their offerings match my wants
        const theirOfferings = u.services_offered || [];
        const myWants = user.services_wanted || [];
        const offerMatchCount = theirOfferings.filter(s => myWants.includes(s)).length;
        score += offerMatchCount * 3;
        
        // Check if my offerings match their wants
        const myOfferings = user.services_offered || [];
        const theirWants = u.services_wanted || [];
        const wantMatchCount = myOfferings.filter(s => theirWants.includes(s)).length;
        score += wantMatchCount * 3;
        
        // Bonus for mutual match (perfect barter)
        if (offerMatchCount > 0 && wantMatchCount > 0) {
          score += 10;
        }
        
        // Add some randomness
        score += Math.random() * 2;
        
        return { ...u, matchScore: score };
      });
      
      // Sort by match score descending
      filteredUsers = usersWithScores.sort((a, b) => b.matchScore - a.matchScore);

      setPotentialMatches(filteredUsers);
      setCurrentCardIndex(0);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching potential matches:", error);
      setPotentialMatches([]);
      setIsLoading(false);
    }
  };

  const handleSwipe = async (targetUserId, liked, isSuperLike = false) => {
    if (!currentUser) return;

    // Mark as seen in 48h tracker
    const seenKey = `barter4u_seen_${currentUser.id}`;
    let seenData = {};
    try { seenData = JSON.parse(localStorage.getItem(seenKey) || '{}'); } catch {}
    seenData[targetUserId] = Date.now();
    localStorage.setItem(seenKey, JSON.stringify(seenData));
    
    // Trigger interaction popup
    if (liked) {
      setInteractionTrigger(isSuperLike ? 'superlike' : 'like');
    } else {
      setInteractionTrigger('dislike');
    }
    
    try {
        if (liked) {
          // Check all existing match records between the two users (in any direction)
          const [mySwipes, theirSwipes] = await Promise.all([
            base44.entities.Match.filter({ user1_id: currentUser.id, user2_id: targetUserId }),
            base44.entities.Match.filter({ user1_id: targetUserId, user2_id: currentUser.id }),
          ]);

          const myExistingSwipe = mySwipes[0] || null;
          const theirExistingSwipe = theirSwipes[0] || null;

          if (theirExistingSwipe && theirExistingSwipe.user1_liked) {
            // They liked me first - update their record to mark mutual match
            await base44.entities.Match.update(theirExistingSwipe.id, {
                status: 'matched',
                user2_liked: true,
                matched_at: new Date().toISOString()
            });
            const matchedUser = potentialMatches.find(u => u.id === targetUserId);
            setNewMatchInfo({ user: matchedUser, isSuperLike });
            setShowMatchPopup(true);
            setInteractionTrigger('match');
            // Notify both users about the mutual match
            await Promise.all([
              base44.entities.Notification.create({
                user_id: targetUserId,
                type: 'new_like',
                title: '🎉 התאמה הדדית!',
                body: `${currentUser.full_name} אישר/ה את הברטר שלכם. התחילו לשוחח!`,
                from_user_id: currentUser.id,
                related_id: theirExistingSwipe.id,
              }),
              base44.entities.Notification.create({
                user_id: currentUser.id,
                type: 'new_like',
                title: '🎉 התאמה הדדית!',
                body: `${matchedUser?.full_name} גם אוהב/ת אותך! זה מאץ'!`,
                from_user_id: targetUserId,
                related_id: theirExistingSwipe.id,
              }),
            ]);
          } else if (myExistingSwipe) {
            // I already have a record - update it (still one-sided)
            await base44.entities.Match.update(myExistingSwipe.id, {
              user1_liked: true,
              status: 'pending',
            });
          } else {
            // No existing record - create new one-sided like (pending)
            const newMatch = await base44.entities.Match.create({
                user1_id: currentUser.id,
                user2_id: targetUserId,
                user1_liked: true,
                user2_liked: false,
                status: 'pending',
            });
            // Notify the target user about the new like
            await base44.entities.Notification.create({
              user_id: targetUserId,
              type: 'new_like',
              title: '💌 מישהו רוצה לעשות איתך ברטר!',
              body: `${currentUser.full_name} שלח/ה לך בקשת ברטר`,
              from_user_id: currentUser.id,
              related_id: newMatch.id,
            });
          }
        }
        // Dislike: just skip (don't create a record, 48h seen already handles re-showing)
    } catch (error) {
        console.error("Error handling swipe:", error);
    }

    setCurrentCardIndex(prev => prev + 1);
  };

  const handleLike = () => {
    if (currentCardIndex < potentialMatches.length) {
      handleSwipe(potentialMatches[currentCardIndex].id, true);
    }
  };

  const handleDislike = () => {
    if (currentCardIndex < potentialMatches.length) {
      handleSwipe(potentialMatches[currentCardIndex].id, false);
    }
  };

  const handleSuperLike = (targetUserId) => {
    if (currentCardIndex < potentialMatches.length) {
      handleSwipe(targetUserId, true, true);
    }
  };

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
        <div className="text-center">
          <motion.div 
            className="w-16 h-16 bg-gradient-to-r from-orange-500 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-gray-300">טוען התאמות חדשות...</p>
        </div>
      </div>
    );
  }

  const currentCard = potentialMatches[currentCardIndex];
  const hasMoreCards = currentCardIndex < potentialMatches.length;

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
      {/* First Time Tooltips */}
      {showFirstTime && (
        <FirstTimeTooltips onComplete={() => {
          setShowFirstTime(false);
          localStorage.setItem('barter4u_first_time_completed', 'true');
        }} />
      )}

      {/* Interaction Popups */}
      <InteractionPopups 
        trigger={interactionTrigger} 
        onClose={() => setInteractionTrigger(null)} 
      />

      {/* Header Stats */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">שלום {currentUser?.full_name || "משתמש"}!</h1>
            <p className="text-gray-400">בואו נמצא לכם התאמות מושלמות</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => loadData(currentUser)} // Pass currentUser to loadData on refresh
            className="rounded-full"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="relative">
          {hasMoreCards ? (
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCardIndex}
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <UserCard 
                    user={currentCard} 
                    onSwipe={handleSwipe}
                  />
                </motion.div>
              </AnimatePresence>

              <SwipeButtons
                onLike={handleLike}
                onDislike={handleDislike}
                disabled={!hasMoreCards}
              />

              {/* Progress indicator */}
              <div className="flex justify-center">
                <div className="bg-gray-700/80 border border-gray-600 rounded-full px-4 py-2 text-sm text-gray-300">
                  {currentCardIndex + 1} מתוך {potentialMatches.length}
                </div>
              </div>
            </div>
          ) : (
            <Card className="glass-card p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-200 to-teal-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-100">זה הכל לעכשיו!</h3>
              <p className="text-gray-400 mb-6">
                בדקתם את כל הפרופילים הזמינים.
                נוסיף עוד כשיהיו משתמשים חדשים!
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => loadData(currentUser)} // Pass currentUser to loadData on refresh
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  בדוק שוב
                </Button>
                <Link to={createPageUrl("Search")}>
                  <Button className="bg-gradient-to-r from-orange-500 to-teal-500 text-white">
                    חיפוש מתקדם
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>

      <MatchSuccessPopup 
          isVisible={showMatchPopup}
          matchedUser={newMatchInfo.user}
          isSuperLike={newMatchInfo.isSuperLike}
          onClose={() => setShowMatchPopup(false)}
          onOpenChat={() => {
              setShowMatchPopup(false);
              // You might want to navigate to chat page here, e.g.:
              // navigate(createPageUrl("Chat", { userId: newMatchInfo.user.id }));
          }}
      />
    </div>
  );
}