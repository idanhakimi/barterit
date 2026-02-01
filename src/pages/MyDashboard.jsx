
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Match } from "@/entities/Match";
import { Rating } from "@/entities/Rating";
import { SuperLike } from "@/entities/SuperLike";
import { ProfileView } from "@/entities/ProfileView";
import { Barter } from "@/entities/Barter";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  MessageCircle, 
  Eye, 
  Heart, 
  TrendingUp, 
  Calendar,
  Handshake,
  Award,
  Zap
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { motion } from "framer-motion";

export default function MyDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userStats, setUserStats] = useState({
    totalMatches: 0,
    totalLikes: 0,
    totalSuperLikes: 0,
    profileViews: 0,
    completedBarters: 0,
    activeChats: 0
  });
  const [recentRatings, setRecentRatings] = useState([]);
  const [activeBarters, setActiveBarters] = useState([]);
  const [activeChats, setActiveChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      try {
        const user = await User.me();
        loadDashboardData(user);
      } catch (error) {
        console.error("User not authenticated, redirecting to Home:", error);
        window.location.href = createPageUrl('Home');
      }
    };
    checkAuthAndLoad();
  }, []);

  const loadDashboardData = async (user) => {
    setIsLoading(true);
    setCurrentUser(user);
    try {
      await loadUserStats(user.id);
      await loadRecentRatings(user.id);
      await loadActiveBarters(user.id);
      await loadActiveChats(user.id);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
    setIsLoading(false);
  };

  const loadUserStats = async (userId) => {
    try {
      // Count matches
      const matches1 = await Match.filter({ user1_id: userId });
      const matches2 = await Match.filter({ user2_id: userId });
      const totalMatches = matches1.length + matches2.length;

      // Count likes received
      const likesReceived = await Match.filter({ 
        user2_id: userId, 
        user1_liked: true 
      });
      
      // Count super likes received
      const superLikesReceived = await SuperLike.filter({ 
        receiver_id: userId 
      });

      // Count profile views
      const profileViews = await ProfileView.filter({ 
        viewed_user_id: userId 
      });
      const totalViews = profileViews.reduce((sum, view) => sum + view.view_count, 0);

      // Count completed barters
      const completedBarters = await Barter.filter({
        status: "completed"
      });
      const userCompletedBarters = completedBarters.filter(
        barter => barter.user1_id === userId || barter.user2_id === userId
      );

      // Count active chats
      const activeMatches = [...matches1, ...matches2].filter(
        match => match.status === "matched"
      );

      setUserStats({
        totalMatches,
        totalLikes: likesReceived.length,
        totalSuperLikes: superLikesReceived.length,
        profileViews: totalViews,
        completedBarters: userCompletedBarters.length,
        activeChats: activeMatches.length
      });

    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadRecentRatings = async (userId) => {
    try {
      const ratings = await Rating.filter(
        { rated_user_id: userId },
        "-created_date",
        5
      );

      const ratingsWithUsers = await Promise.all(
        ratings.map(async (rating) => {
          const sampleUsers = {
            "demo_1": { full_name: "שרה כהן", profile_image: null },
            "demo_2": { full_name: "דוד לוי", profile_image: null },
            "demo_3": { full_name: "מיכל אבני", profile_image: null }
          };
          
          return {
            ...rating,
            ratingUser: sampleUsers[rating.rating_user_id] || { full_name: "משתמש לא ידוע" }
          };
        })
      );

      setRecentRatings(ratingsWithUsers);
    } catch (error) {
      console.error("Error loading ratings:", error);
    }
  };

  const loadActiveBarters = async (userId) => {
    try {
      const sampleBarters = [
        {
          id: "barter_1",
          user1_id: userId,
          user2_id: "demo_1",
          user1_service: "עיצוב גרפי",
          user2_service: "שיעור יוגה",
          status: "active",
          created_date: "2024-01-15T10:00:00Z",
          description: "לוגו חדש לעסק בתמורה לשיעור יוגה פרטי",
          otherUser: { full_name: "שרה כהן" }
        },
        {
          id: "barter_2", 
          user1_id: "demo_2",
          user2_id: userId,
          user1_service: "תיקון מחשב",
          user2_service: "שיעור צילום",
          status: "active",
          created_date: "2024-01-18T14:30:00Z", 
          description: "תיקון מחשב נייד בתמורה לסדנת צילום",
          otherUser: { full_name: "דוד לוי" }
        }
      ];

      setActiveBarters(sampleBarters);
    } catch (error) {
      console.error("Error loading barters:", error);
    }
  };

  const loadActiveChats = async (userId) => {
    try {
      const sampleChats = [
        {
          id: "chat_1",
          otherUser: { full_name: "שרה כהן", profile_image: null },
          lastMessage: "אשמח לקבוע מועד לשיעור היוגה",
          lastMessageTime: "2024-01-20T16:45:00Z",
          unreadCount: 2
        },
        {
          id: "chat_2",
          otherUser: { full_name: "דוד לוי", profile_image: null },
          lastMessage: "מתי נוח לך שאגיע לתקן את המחשב?",
          lastMessageTime: "2024-01-20T12:20:00Z", 
          unreadCount: 0
        }
      ];

      setActiveChats(sampleChats);
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <Card className="glass-card hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                {trend}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-teal-500 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">טוען את הדשבורד שלך...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            הדשבורד שלי
          </h1>
          <p className="text-gray-600">
            סקירה כללית על הפעילות שלך ב-Barter4U
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="התאמות כולל"
            value={userStats.totalMatches}
            icon={Heart}
            color="bg-red-500"
            trend="+3 השבוע"
          />
          <StatCard
            title="לייקים שקיבלתי"
            value={userStats.totalLikes}
            icon={Heart}
            color="bg-pink-500"
            trend="+5 החודש"
          />
          <StatCard
            title="סופר לייקים"
            value={userStats.totalSuperLikes}
            icon={Zap}
            color="bg-yellow-500"
          />
          <StatCard
            title="צפיות בפרופיל"
            value={userStats.profileViews}
            icon={Eye}
            color="bg-blue-500"
            trend="+12 השבוע"
          />
          <StatCard
            title="ברטרים הושלמו"
            value={userStats.completedBarters}
            icon={Handshake}
            color="bg-green-500"
          />
          <StatCard
            title="שיחות פעילות"
            value={userStats.activeChats}
            icon={MessageCircle}
            color="bg-purple-500"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="overview">סקירה</TabsTrigger>
            <TabsTrigger value="barters">ברטרים</TabsTrigger>
            <TabsTrigger value="chats">שיחות</TabsTrigger>
            <TabsTrigger value="ratings">דירוגים</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Rating Overview */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    הדירוג שלי
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold mb-2">
                      {currentUser?.rating?.toFixed(1) || "0.0"}
                    </div>
                    <div className="flex justify-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-6 h-6 ${
                            star <= (currentUser?.rating || 0)
                              ? "text-yellow-500 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600">
                      מבוסס על {currentUser?.total_ratings || 0} דירוגים
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>פעילות אחרונה</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Handshake className="w-5 h-5 text-green-600" />
                      <span className="font-medium">ברטר חדש הושלם</span>
                    </div>
                    <span className="text-sm text-gray-600">אתמול</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-red-500" />
                      <span className="font-medium">קיבלת 3 לייקים חדשים</span>
                    </div>
                    <span className="text-sm text-gray-600">היום</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium">קיבלת סופר לייק!</span>
                    </div>
                    <span className="text-sm text-gray-600">לפני שעתיים</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Barters Tab */}
          <TabsContent value="barters" className="space-y-4">
            <h3 className="text-xl font-semibold">הברטרים שלי</h3>
            
            {activeBarters.length === 0 ? (
              <Card className="glass-card p-8 text-center">
                <Handshake className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">אין עדיין ברטרים</h4>
                <p className="text-gray-600">
                  כשתתחילו לבצע עסקאות, הן יופיעו כאן
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeBarters.map((barter) => (
                  <motion.div
                    key={barter.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="glass-card">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-lg mb-2">
                              {barter.description}
                            </h4>
                            <p className="text-gray-600 mb-2">
                              עם {barter.otherUser.full_name}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(barter.created_date), "d MMMM yyyy", { locale: he })}
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">
                            {barter.status === "active" ? "פעיל" : "הושלם"}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">אני נותן</p>
                            <p className="font-semibold">
                              {barter.user1_id === currentUser?.id ? barter.user1_service : barter.user2_service}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">אני מקבל</p>
                            <p className="font-semibold">
                              {barter.user1_id === currentUser?.id ? barter.user2_service : barter.user1_service}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Chats Tab */}
          <TabsContent value="chats" className="space-y-4">
            <h3 className="text-xl font-semibold">השיחות הפעילות שלי</h3>
            
            {activeChats.length === 0 ? (
              <Card className="glass-card p-8 text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">אין שיחות פעילות</h4>
                <p className="text-gray-600">
                  כשתתאימו עם מישהו, השיחות יופיעו כאן
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {activeChats.map((chat) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="glass-card hover:shadow-lg transition-all duration-200 cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-orange-200 to-teal-200 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-gray-600">
                              {chat.otherUser.full_name.charAt(0)}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold">{chat.otherUser.full_name}</h4>
                              <span className="text-xs text-gray-500">
                                {format(new Date(chat.lastMessageTime), "HH:mm")}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm">{chat.lastMessage}</p>
                          </div>
                          
                          {chat.unreadCount > 0 && (
                            <Badge className="bg-red-500 text-white">
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Ratings Tab */}
          <TabsContent value="ratings" className="space-y-4">
            <h3 className="text-xl font-semibold">הדירוגים שקיבלתי</h3>
            
            {recentRatings.length === 0 ? (
              <Card className="glass-card p-8 text-center">
                <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">אין עדיין דירוגים</h4>
                <p className="text-gray-600">
                  אחרי עסקאות ברטר, המשתמשים יוכלו לדרג אתכם
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {recentRatings.map((rating) => (
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
                              {rating.ratingUser?.full_name?.charAt(0) || "?"}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{rating.ratingUser?.full_name}</h4>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= rating.stars
                                        ? "text-yellow-500 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            
                            {rating.barter_description && (
                              <Badge className="bg-blue-100 text-blue-700 mb-2">
                                {rating.barter_description}
                              </Badge>
                            )}
                            
                            {rating.comment && (
                              <p className="text-gray-700 mb-2">{rating.comment}</p>
                            )}
                            
                            <p className="text-xs text-gray-500">
                              {format(new Date(rating.created_date), "d MMMM yyyy", { locale: he })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
