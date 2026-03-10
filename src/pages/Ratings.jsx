import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Rating } from "@/entities/Rating";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, Plus, Calendar } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

export default function Ratings() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRatings, setUserRatings] = useState([]);
  const [givenRatings, setGivenRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewRating, setShowNewRating] = useState(false);
  const [newRating, setNewRating] = useState({
    rated_user_email: "",
    stars: 5,
    comment: "",
    barter_description: ""
  });
  const [selectedStars, setSelectedStars] = useState(5);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
        try {
            const user = await User.me();
            loadData(user);
        } catch (error) {
            // If user is not authenticated, redirect to home page
            window.location.href = createPageUrl('Home');
        }
    };
    checkAuthAndLoad();
  }, []);

  const loadData = async (user) => {
    setIsLoading(true);
    setCurrentUser(user); // Set the current user from the argument
    try {
      // Get ratings received by current user
      const receivedRatings = await Rating.filter({
        rated_user_id: user.id
      }, "-created_date");
      
      // Get user details for each rating
      const ratingsWithUsers = await Promise.all(
        receivedRatings.map(async (rating) => {
          const ratingUser = await User.filter({ id: rating.rating_user_id });
          return {
            ...rating,
            ratingUser: ratingUser[0]
          };
        })
      );
      
      setUserRatings(ratingsWithUsers);
      
      // Get ratings given by current user
      const givenRatings = await Rating.filter({
        rating_user_id: user.id
      }, "-created_date");
      
      const givenRatingsWithUsers = await Promise.all(
        givenRatings.map(async (rating) => {
          const ratedUser = await User.filter({ id: rating.rated_user_id });
          return {
            ...rating,
            ratedUser: ratedUser[0]
          };
        })
      );
      
      setGivenRatings(givenRatingsWithUsers);
      
    } catch (error) {
      console.error("Error loading ratings:", error);
    }
    setIsLoading(false);
  };

  const handleSubmitRating = async () => {
    if (!newRating.rated_user_email.trim() || !currentUser) return;
    
    try {
      // Find user by email
      const users = await User.filter({
        email: newRating.rated_user_email.trim()
      });
      
      if (users.length === 0) {
        alert("לא נמצא משתמש עם האימייל הזה");
        return;
      }
      
      const ratedUser = users[0];
      
      // Create rating
      await Rating.create({
        rated_user_id: ratedUser.id,
        rating_user_id: currentUser.id,
        stars: selectedStars,
        comment: newRating.comment,
        barter_description: newRating.barter_description
      });
      
      // Update user's rating average
      const allUserRatings = await Rating.filter({
        rated_user_id: ratedUser.id
      });
      
      const avgRating = allUserRatings.reduce((sum, r) => sum + r.stars, 0) / allUserRatings.length;
      
      await User.update(ratedUser.id, {
        rating: avgRating,
        total_ratings: allUserRatings.length
      });
      
      // Reset form
      setNewRating({
        rated_user_email: "",
        stars: 5,
        comment: "",
        barter_description: ""
      });
      setSelectedStars(5);
      setShowNewRating(false);
      
      // Reload data
      loadData(currentUser); // Pass currentUser to loadData after successful submission
      
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("שגיאה בשמירת הדירוג");
    }
  };

  const renderStars = (rating, interactive = false, onClick = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? "text-yellow-500 fill-current"
                : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={() => interactive && onClick && onClick(star)}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <div className="text-center">
          <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">טוען דירוגים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">דירוגים וביקורות</h1>
          <Button
            onClick={() => setShowNewRating(true)}
            className="bg-gradient-to-r from-orange-500 to-teal-500 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            דרג משתמש
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-6 h-6 text-yellow-600 fill-current" />
              </div>
              <h3 className="font-semibold">הדירוג שלי</h3>
              <div className="flex items-center justify-center gap-2 mt-1">
                {renderStars(currentUser?.rating || 0)}
                <span className="text-sm text-gray-600">
                  ({currentUser?.total_ratings || 0})
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-green-600">{userRatings.length}</span>
              </div>
              <h3 className="font-semibold">דירוגים שקיבלתי</h3>
              <p className="text-sm text-gray-600">ביקורות חיוביות</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-blue-600">{givenRatings.length}</span>
              </div>
              <h3 className="font-semibold">דירוגים שנתתי</h3>
              <p className="text-sm text-gray-600">עסקאות שדירגתי</p>
            </CardContent>
          </Card>
        </div>

        {/* New Rating Form */}
        <AnimatePresence>
          {showNewRating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>דרג משתמש חדש</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">אימייל המשתמש שברטרתם איתו</label>
                    <Input
                      value={newRating.rated_user_email}
                      onChange={(e) => setNewRating(prev => ({
                        ...prev,
                        rated_user_email: e.target.value
                      }))}
                      placeholder="user@example.com"
                      dir="ltr"
                    />
                    <p className="text-xs text-gray-400 mt-1">ניתן למצוא את האימייל בפרופיל המשתמש</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">דירוג</label>
                    {renderStars(selectedStars, true, setSelectedStars)}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">תיאור העסקה</label>
                    <Input
                      value={newRating.barter_description}
                      onChange={(e) => setNewRating(prev => ({
                        ...prev,
                        barter_description: e.target.value
                      }))}
                      placeholder="למשל: עיסוי בתמורה לשיעור יוגה"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">ביקורת (אופציונלי)</label>
                    <Textarea
                      value={newRating.comment}
                      onChange={(e) => setNewRating(prev => ({
                        ...prev,
                        comment: e.target.value
                      }))}
                      placeholder="שתפו את החוויה שלכם..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSubmitRating}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      שמור דירוג
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowNewRating(false)}
                    >
                      ביטול
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ratings Tabs */}
        <div className="space-y-8">
          {/* Ratings I Received */}
          <div>
            <h2 className="text-xl font-semibold mb-4">דירוגים שקיבלתי</h2>
            {userRatings.length === 0 ? (
              <Card className="glass-card p-8 text-center">
                <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">אין עדיין דירוגים</h3>
                <p className="text-gray-600">
                  כשתבצעו עסקאות ברטר, המשתמשים יוכלו לדרג אתכם
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {userRatings.map((rating) => (
                  <motion.div
                    key={rating.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="glass-card">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-orange-200 to-teal-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                            {rating.ratingUser?.profile_image ? (
                              <img src={rating.ratingUser.profile_image} alt={rating.ratingUser.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-semibold text-gray-600">{rating.ratingUser?.full_name?.charAt(0) || "?"}</span>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">{rating.ratingUser?.full_name}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  {renderStars(rating.stars)}
                                  <Calendar className="w-4 h-4" />
                                  {format(new Date(rating.created_date), "d MMMM yyyy", { locale: he })}
                                </div>
                              </div>
                            </div>
                            
                            {rating.barter_description && (
                              <Badge className="bg-blue-100 text-blue-700 mb-2">
                                {rating.barter_description}
                              </Badge>
                            )}
                            
                            {rating.comment && (
                              <p className="text-gray-700">{rating.comment}</p> 
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Ratings I Gave */}
          <div>
            <h2 className="text-xl font-semibold mb-4">דירוגים שנתתי</h2>
            {givenRatings.length === 0 ? (
              <Card className="glass-card p-8 text-center">
                <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">לא דירגתם אף משתמש</h3>
                <p className="text-gray-600">
                  אחרי עסקאות ברטר, חשוב לדרג את המשתמשים
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {givenRatings.map((rating) => (
                  <motion.div
                    key={rating.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="glass-card">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-orange-200 to-teal-200 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-gray-600">
                              {rating.ratedUser?.full_name?.charAt(0) || "?"}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">{rating.ratedUser?.full_name}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  {renderStars(rating.stars)}
                                  <Calendar className="w-4 h-4" />
                                  {format(new Date(rating.created_date), "d MMMM yyyy", { locale: he })}
                                </div>
                              </div>
                            </div>
                            
                            {rating.barter_description && (
                              <Badge className="bg-green-100 text-green-700 mb-2">
                                {rating.barter_description}
                              </Badge>
                            )}
                            
                            {rating.comment && (
                              <p className="text-gray-700">{rating.comment}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}