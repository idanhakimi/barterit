
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Match } from "@/entities/Match";
import { Block } from "@/entities/Block";
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

// Helper function to get region (keeping for potential future use)
const getRegion = (location) => {
    const north = ["חיפה", "קריות", "נהריה", "עכו", "צפת", "טבריה", "כרמיאל", "גולן", "גליל"];
    const south = ["באר שבע", "אשדוד", "אשקלון", "אילת", "דימונה", "נתיבות", "שדרות", "נגב"];
    if (north.some(city => location?.includes(city))) return "צפון";
    if (south.some(city => location?.includes(city))) return "דרום";
    return "מרכז";
};

// City distance approximation - rough distances between major Israeli cities (kept for potential future use, currently unused)
const getCityDistance = (city1, city2) => {
    if (!city1 || !city2) return Infinity;

    // Normalize city names (e.g., trim whitespace, convert to lowercase for robust comparison)
    const normalizedCity1 = city1.trim().toLowerCase();
    const normalizedCity2 = city2.trim().toLowerCase();

    // Same city = 0 distance
    if (normalizedCity1 === normalizedCity2) return 0;

    // Define major cities with approximate distances (keys are normalized)
    const cityDistances = {
        "תל אביב": { "חיפה": 95, "באר שבע": 115, "ירושלים": 65, "נתניה": 30, "פתח תקווה": 15, "רחובות": 25, "רמת גן": 8, "בני ברק": 10, "הוד השרון": 20, "הרצליה": 15 },
        "ירושלים": { "תל אביב": 65, "חיפה": 158, "באר שבע": 83, "בית שמש": 20, "מעלה אדומים": 10 },
        "חיפה": { "תל אביב": 95, "ירושלים": 158, "נהריה": 35, "עכו": 25, "קריות": 15, "טבריה": 65 },
        "באר שבע": { "תל אביב": 115, "ירושלים": 83, "אשדוד": 50, "אשקלון": 40, "אילת": 240 },
        "נתניה": { "תל אביב": 30, "חיפה": 65, "הרצליה": 15, "כפר סבא": 20 },
        "אשדוד": { "תל אביב": 40, "באר שבע": 50, "אשקלון": 20, "ירושלים": 75 },
        "פתח תקווה": { "תל אביב": 15, "רמת גן": 10, "בני ברק": 8, "הוד השרון": 12 },
        "רמת גן": { "תל אביב": 8, "פתח תקווה": 10, "בני ברק": 5, "גבעתיים": 3 }
    };

    // Check if we have direct distance data (using normalized keys)
    if (cityDistances[normalizedCity1] && cityDistances[normalizedCity1][normalizedCity2]) {
        return cityDistances[normalizedCity1][normalizedCity2];
    }
    if (cityDistances[normalizedCity2] && cityDistances[normalizedCity2][normalizedCity1]) {
        return cityDistances[normalizedCity2][normalizedCity1];
    }

    // If no direct data, use regional approximation
    const region1 = getRegion(city1);
    const region2 = getRegion(city2);

    if (region1 === region2) {
        return 25; // Same region - reasonable default distance
    } else {
        // Different regions
        const regionDistances = {
            "צפון-מרכז": 100,
            "מרכז-דרום": 80,
            "צפון-דרום": 180
        };
        // Ensure consistent key order for region pair
        const key = [region1, region2].sort().join("-");
        return regionDistances[key] || 120; // Default if regions don't match explicit pairs
    }
};

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [newMatchInfo, setNewMatchInfo] = useState({ user: null, isSuperLike: false });
  const [showFirstTime, setShowFirstTime] = useState(false);
  const [interactionTrigger, setInteractionTrigger] = useState(null);
  const [showProfileImagePopup, setShowProfileImagePopup] = useState(false);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
        try {
            const user = await User.me();
            setCurrentUser(user);

            // Check if first time user
            const isFirstTime = !localStorage.getItem('barter4u_first_time_completed');
            if (isFirstTime) {
              setShowFirstTime(true);
            }

            // Check if user needs profile image reminder
            const hasShownImageReminder = localStorage.getItem(`profile_image_reminder_shown_${user.id}`);
            if (!user.profile_image && !hasShownImageReminder) {
              // Show popup after a short delay to not overwhelm user
              setTimeout(() => {
                setShowProfileImagePopup(true);
              }, 2000);
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
      const allUsers = await User.list();
      const myBlockedUsers = await Block.filter({ blocker_id: user.id });
      const usersWhoBlockedMe = await Block.filter({ blocked_id: user.id });
      const blockedIds = new Set([
          ...myBlockedUsers.map(b => b.blocked_id),
          ...usersWhoBlockedMe.map(b => b.blocker_id)
      ]);

      const previousMatches = await Match.filter({ $or: [{ user1_id: user.id }, { user2_id: user.id }] });
      const matchedIds = new Set(previousMatches.map(m => m.user1_id === user.id ? m.user2_id : m.user1_id));

      // Show ALL users except blocked and already matched - no distance or service filtering
      let filteredUsers = allUsers.filter(u =>
        u.id !== user.id &&
        !blockedIds.has(u.id) &&
        !matchedIds.has(u.id)
      );

      // Shuffle the array to provide variety in the order users are shown
      filteredUsers = filteredUsers.sort(() => Math.random() - 0.5);

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

    // Trigger interaction popup
    if (liked) {
      setInteractionTrigger(isSuperLike ? 'superlike' : 'like');
    } else {
      setInteractionTrigger('dislike');
    }

    try {
        // Check if the target user has already liked the current user
        const existingMatch = await Match.filter({
            user1_id: targetUserId,
            user2_id: currentUser.id,
            user1_liked: true // They liked me already
        });

        if (liked && existingMatch.length > 0) { // It's a mutual match!
            const match = existingMatch[0];
            await Match.update(match.id, {
                status: 'matched',
                user2_liked: true, // currentUser liked them back
                matched_at: new Date().toISOString()
            });
            const matchedUser = potentialMatches.find(u => u.id === targetUserId);
            setNewMatchInfo({ user: matchedUser, isSuperLike });
            setShowMatchPopup(true);
            setInteractionTrigger('match'); // Trigger match popup
        } else {
            // Create a new match entry (or update if I already swiped on them)
            const myExistingSwipe = await Match.filter({
                user1_id: currentUser.id,
                user2_id: targetUserId,
            });

            if (myExistingSwipe.length > 0) {
                // If I already swiped on them (e.g., changed my mind from dislike to like)
                await Match.update(myExistingSwipe[0].id, {
                    user1_liked: liked,
                    status: liked ? 'pending' : 'rejected' // If I like, it's pending. If I dislike, it's rejected by me.
                });
            } else {
                // First time I swipe on them
                await Match.create({
                    user1_id: currentUser.id,
                    user2_id: targetUserId,
                    user1_liked: liked,
                    status: liked ? 'pending' : 'rejected'
                });
            }
        }
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

  const handleProfileImageReminderClose = () => {
    setShowProfileImagePopup(false);
    if (currentUser) {
      localStorage.setItem(`profile_image_reminder_shown_${currentUser.id}`, 'true');
    }
  };

  const handleGoToProfile = () => {
    setShowProfileImagePopup(false);
    if (currentUser) {
      localStorage.setItem(`profile_image_reminder_shown_${currentUser.id}`, 'true');
    }
    window.location.href = createPageUrl('Profile');
  };

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 bg-gradient-to-r from-orange-500 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-gray-600">טוען התאמות חדשות...</p>
        </div>
      </div>
    );
  }

  const currentCard = potentialMatches[currentCardIndex];
  const hasMoreCards = currentCardIndex < potentialMatches.length;

  return (
    <div className="min-h-screen pb-20">
      {/* Profile Image Reminder Popup */}
      <AnimatePresence>
        {showProfileImagePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  🌟 הוסיפו תמונת פרופיל!
                </h3>

                <div className="space-y-3 text-gray-600 mb-6">
                  <p className="text-lg font-semibold text-orange-600">
                    תמונת פרופיל מגדילה את ההתאמות פי 5! 📈
                  </p>
                  <div className="text-sm space-y-2">
                    <p>✅ משדרת אמינות ורצינות</p>
                    <p>✅ מעוררת עניין ומושכת יותר לייקים</p>
                    <p>✅ עוזרת לאנשים להכיר אתכם</p>
                    <p>✅ מגדילה משמעותית את הסיכוי להתאמות</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleGoToProfile}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-teal-500 text-white font-bold py-3 rounded-xl hover:from-orange-600 hover:to-teal-600"
                  >
                    הוסף תמונה עכשיו
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleProfileImageReminderClose}
                    className="px-4 text-gray-600"
                  >
                    אחר כך
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">שלום {currentUser?.full_name || "משתמש"}!</h1>
            <p className="text-gray-600">בואו נמצא לכם התאמות מושלמות</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => loadData(currentUser)}
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
                onSuperLike={handleSuperLike}
                disabled={!hasMoreCards}
                currentUser={currentCard}
              />

              {/* Progress indicator */}
              <div className="flex justify-center">
                <div className="bg-white/50 rounded-full px-4 py-2 text-sm text-gray-600">
                  {currentCardIndex + 1} מתוך {potentialMatches.length}
                </div>
              </div>
            </div>
          ) : (
            <Card className="glass-card p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-200 to-teal-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">זה הכל לעכשיו!</h3>
              <p className="text-gray-600 mb-6">
                בדקתם את כל הפרופילים הזמינים.
                נוסיף עוד כשיהיו משתמשים חדשים!
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => loadData(currentUser)}
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
          }}
      />
    </div>
  );
}
