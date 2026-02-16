import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, Heart, TrendingUp, Activity, Star } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { he } from 'date-fns/locale';

export default function AnalyticsDashboard({ users, matches, messages, ratings }) {
  // Calculate growth data for last 30 days
  const getLast30DaysData = () => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const usersCount = users.filter(u => 
        format(new Date(u.created_date), 'yyyy-MM-dd') <= dateStr
      ).length;
      
      const matchesCount = matches.filter(m => 
        format(new Date(m.created_date), 'yyyy-MM-dd') <= dateStr
      ).length;
      
      const messagesCount = messages.filter(m => 
        format(new Date(m.created_date), 'yyyy-MM-dd') <= dateStr
      ).length;

      data.push({
        date: format(date, 'd/M', { locale: he }),
        users: usersCount,
        matches: matchesCount,
        messages: messagesCount
      });
    }
    return data;
  };

  const dailyGrowth = getLast30DaysData();

  // User activity by hour
  const getUserActivityByHour = () => {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    
    users.forEach(user => {
      const hour = new Date(user.created_date).getHours();
      hourlyData[hour].count++;
    });

    return hourlyData.map(d => ({
      hour: `${d.hour}:00`,
      users: d.count
    }));
  };

  const hourlyActivity = getUserActivityByHour();

  // Calculate statistics
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => {
      const lastActive = new Date(u.updated_date);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return lastActive > dayAgo;
    }).length,
    totalMatches: matches.length,
    matchedMatches: matches.filter(m => m.status === 'matched').length,
    totalMessages: messages.length,
    avgMessagesPerMatch: matches.length > 0 ? (messages.length / matches.length).toFixed(1) : 0,
    avgRating: ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length).toFixed(1) : 0,
    newUsersToday: users.filter(u => {
      const created = new Date(u.created_date);
      const today = new Date();
      return created.toDateString() === today.toDateString();
    }).length,
    newMatchesToday: matches.filter(m => {
      const created = new Date(m.created_date);
      const today = new Date();
      return created.toDateString() === today.toDateString();
    }).length
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">משתמשים כולל</p>
                <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                <p className="text-xs text-blue-300 mt-1">+{stats.newUsersToday} היום</p>
              </div>
              <Users className="w-12 h-12 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">משתמשים פעילים</p>
                <p className="text-3xl font-bold text-white">{stats.activeUsers}</p>
                <p className="text-xs text-green-300 mt-1">ב-24 שעות אחרונות</p>
              </div>
              <Activity className="w-12 h-12 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 border-pink-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">התאמות כולל</p>
                <p className="text-3xl font-bold text-white">{stats.totalMatches}</p>
                <p className="text-xs text-pink-300 mt-1">+{stats.newMatchesToday} היום</p>
              </div>
              <Heart className="w-12 h-12 text-pink-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">הודעות כולל</p>
                <p className="text-3xl font-bold text-white">{stats.totalMessages}</p>
                <p className="text-xs text-purple-300 mt-1">ממוצע {stats.avgMessagesPerMatch} להתאמה</p>
              </div>
              <MessageSquare className="w-12 h-12 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-400" />
              צמיחת משתמשים - 30 יום
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyGrowth}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Area type="monotone" dataKey="users" stroke="#4ECDC4" fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-400" />
              פעילות לפי שעה
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Line type="monotone" dataKey="users" stroke="#FF6B35" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">סטטיסטיקות התאמות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">התאמות מוצלחות</span>
              <span className="text-white font-bold">{stats.matchedMatches}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">אחוז הצלחה</span>
              <span className="text-green-400 font-bold">
                {stats.totalMatches > 0 ? ((stats.matchedMatches / stats.totalMatches) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              דירוגים
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">סה"כ דירוגים</span>
              <span className="text-white font-bold">{ratings.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">ממוצע דירוג</span>
              <span className="text-yellow-400 font-bold">{stats.avgRating} ⭐</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">מעורבות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">הודעות ממוצעות</span>
              <span className="text-white font-bold">{stats.avgMessagesPerMatch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">שיעור תגובה</span>
              <span className="text-teal-400 font-bold">
                {users.length > 0 ? ((stats.activeUsers / users.length) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}