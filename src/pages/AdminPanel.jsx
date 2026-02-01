
import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Match } from '@/entities/Match';
import { Message } from '@/entities/Message';
import { Rating } from '@/entities/Rating';
import { Barter } from '@/entities/Barter';
import { Report } from '@/entities/Report';
import { BugReport } from '@/entities/BugReport';
import { ContactSubmission } from '@/entities/ContactSubmission';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, MessageSquare, Star, AlertTriangle, RefreshCw, Heart, Bug, TrendingUp, Activity, BarChart3, UserCheck, PieChart as PieChartIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import DemoUserGenerator from "../components/DemoUserGenerator";

const createPageUrl = (pageName) => {
    if (pageName === 'Home') return '/';
    return `/${pageName.toLowerCase()}`;
};

// Dashboard Stats Card Component
const StatsCard = ({ icon: Icon, title, value, change, color }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -5 }}
    transition={{ type: "spring", stiffness: 300 }}
    className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 text-white"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-300 text-sm">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
        {change && (
          <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
            {change} השבוע
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </motion.div>
);

// Charts Components
const AgeDistributionChart = ({ users }) => {
  const ageGroups = users.reduce((acc, user) => {
    if (!user.age || isNaN(parseInt(user.age))) return acc;
    const age = parseInt(user.age);
    let group;
    if (age < 18) group = 'מתחת ל-18';
    else if (age < 25) group = '18-24';
    else if (age < 35) group = '25-34';
    else if (age < 45) group = '35-44';
    else if (age < 55) group = '45-54';
    else group = '55+';

    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(ageGroups).map(([name, value]) => ({ name, value }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#E4572E'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F9FAFB',
            fontSize: '14px'
          }}
          formatter={(value, name) => [`${value} משתמשים`, name]}
        />
        <Legend
          wrapperStyle={{
            fontSize: '14px',
            color: '#F9FAFB',
            textAlign: 'center'
          }}
        />
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          labelStyle={{ fontSize: '12px', fill: '#F9FAFB' }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

const LocationDistributionChart = ({ users }) => {
  const getRegion = (location) => {
    if (!location) return 'לא צוין';
    const cleanLocation = location.toLowerCase();
    const north = ["חיפה", "קריות", "נהריה", "עכו", "צפת", "טבריה", "כרמיאל", "גולן", "גליל", "עפולה", "נצרת"];
    const south = ["באר שבע", "אשדוד", "אשקלון", "אילת", "דימונה", "נתיבות", "שדרות", "נגב", "קרית גת", "קרית מלאכי", "רמלה", "לוד"];
    const jerusalem = ["ירושלים", "בית שמש", "מעלה אדומים"];
    const center = ["תל אביב", "רמת גן", "גבעתיים", "ראשון לציון", "פתח תקווה", "רחובות", "נס ציונה", "חולון", "בת ים", "הרצליה", "כפר סבא", "רעננה", "נתניה", "הוד השרון", "אור יהודה", "יהוד", "מודיעין", "רמלה", "לוד"];

    if (north.some(city => cleanLocation.includes(city))) return "צפון";
    if (south.some(city => cleanLocation.includes(city))) return "דרום";
    if (jerusalem.some(city => cleanLocation.includes(city))) return "ירושלים והסביבה";
    if (center.some(city => cleanLocation.includes(city))) return "מרכז";
    return "אחר";
  };

  const regionGroups = users.reduce((acc, user) => {
    const region = getRegion(user.location);
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(regionGroups).map(([name, value]) => ({ name, value }));
  const COLORS = ['#FF6B35', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F9FAFB',
            fontSize: '14px'
          }}
          formatter={(value, name) => [`${value} משתמשים`, name]}
        />
        <Legend
          wrapperStyle={{
            fontSize: '14px',
            color: '#F9FAFB',
            textAlign: 'center'
          }}
        />
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          labelStyle={{ fontSize: '12px', fill: '#F9FAFB' }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

const ServicesChart = ({ users }) => {
  const servicesCount = users.reduce((acc, user) => {
    if (user.services_offered && Array.isArray(user.services_offered)) {
      user.services_offered.forEach(service => {
        if (typeof service === 'string' && service.trim() !== '') {
            acc[service] = (acc[service] || 0) + 1;
        }
      });
    }
    return acc;
  }, {});

  const topServices = Object.entries(servicesCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({ name: name.length > 20 ? name.substring(0, 20) + '...' : name, value }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={topServices} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={120}
          interval={0}
          stroke="#9CA3AF"
          fontSize={12}
          tick={{ fill: '#9CA3AF' }}
        />
        <YAxis
          stroke="#9CA3AF"
          tick={{ fill: '#9CA3AF' }}
          label={{ value: 'מספר משתמשים', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F9FAFB',
            fontSize: '14px'
          }}
          formatter={(value, name) => [`${value} משתמשים`, 'כמות']}
          labelFormatter={(label) => `שירות: ${label}`}
        />
        <Bar dataKey="value" fill="#4ECDC4" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default function AdminPanel() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loadError, setLoadError] = useState(null); // To store and display loading errors

    const [users, setUsers] = useState([]);
    const [matches, setMatches] = useState([]);
    const [messages, setMessages] = useState([]);
    const [ratings, setRatings] = useState([]);
    const [barters, setBarters] = useState([]);
    const [reports, setReports] = useState([]);
    const [bugReports, setBugReports] = useState([]);
    const [contactSubmissions, setContactSubmissions] = useState([]);

    useEffect(() => {
        const checkAuthAndLoad = async () => {
            try {
                const userData = await User.me();
                // Switched to role-based check for security and scalability
                if (userData.role !== 'admin') {
                    window.location.href = createPageUrl('dashboard'); // Use Dashboard for logged-in users
                    return;
                }
                setUser(userData);
                await loadData();
            } catch (error) {
                console.error("Authentication or data loading error:", error);
                window.location.href = createPageUrl('Home');
            }
        };
        checkAuthAndLoad();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        setLoadError(null); // Reset error on every load attempt
        try {
            const results = await Promise.allSettled([
                User.list(),
                Match.list(),
                Message.list(),
                Rating.list(),
                Barter.list(),
                Report.list(),
                BugReport.list(),
                ContactSubmission.list()
            ]);

            const [
                usersResult,
                matchesResult,
                messagesResult,
                ratingsResult,
                bartersResult,
                reportsResult,
                bugReportsResult,
                contactResult
            ] = results;

            // Handle Users separately as it's critical
            if (usersResult.status === 'fulfilled') {
                setUsers(usersResult.value);
            } else {
                console.error("Failed to load users:", usersResult.reason);
                setLoadError("שליפת רשימת המשתמשים נכשלה. אנא רענן שוב.");
                setIsLoading(false);
                return; // Stop loading if users fail
            }

            // Handle other data entities
            if (matchesResult.status === 'fulfilled') setMatches(matchesResult.value);
            else console.error("Failed to load matches:", matchesResult.reason);

            if (messagesResult.status === 'fulfilled') setMessages(messagesResult.value);
            else console.error("Failed to load messages:", messagesResult.reason);

            if (ratingsResult.status === 'fulfilled') setRatings(ratingsResult.value);
            else console.error("Failed to load ratings:", ratingsResult.reason);

            if (bartersResult.status === 'fulfilled') setBarters(bartersResult.value);
            else console.error("Failed to load barters:", bartersResult.reason);

            if (reportsResult.status === 'fulfilled') setReports(reportsResult.value);
            else console.error("Failed to load reports:", reportsResult.reason);

            if (bugReportsResult.status === 'fulfilled') setBugReports(bugReportsResult.value);
            else console.error("Failed to load bug reports:", bugReportsResult.reason);

            if (contactResult.status === 'fulfilled') setContactSubmissions(contactResult.value);
            else console.error("Failed to load contact submissions:", contactResult.reason);

        } catch (error) {
            console.error("Error in loadData execution:", error);
            setLoadError("אירעה שגיאה כללית בטעינת הנתונים.");
        }
        setIsLoading(false);
    };

    const updateContactStatus = async (id, status) => {
        try {
            await ContactSubmission.update(id, {
                status,
                resolved_at: (status === 'resolved' || status === 'read') ? new Date().toISOString() : null
            });
            loadData();
        } catch (error) {
            console.error("Error updating contact status:", error);
        }
    };

    const updateBugStatus = async (id, status) => {
        try {
            await BugReport.update(id, {
                status,
                resolved_at: (status === 'resolved' || status === 'closed') ? new Date().toISOString() : null
            });
            loadData();
        } catch (error) {
            console.error("Error updating bug status:", error);
        }
    };

    const getAnalyticsStats = () => {
        const activeUsers = users.filter(user => {
            const lastLogin = new Date(user.updated_date);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return lastLogin > weekAgo;
        }).length;

        const completedBarters = barters.filter(barter => barter.status === 'completed').length;
        const averageRating = ratings.length > 0
            ? ratings.reduce((sum, rating) => sum + rating.stars, 0) / ratings.length
            : 0;

        const usersWithAge = users.filter(u => u.age && !isNaN(parseInt(u.age)));
        const averageAge = usersWithAge.length > 0
            ? usersWithAge.reduce((sum, user) => sum + parseInt(user.age), 0) / usersWithAge.length
            : 0;

        return {
            totalUsers: users.length,
            activeUsers: activeUsers,
            totalMatches: matches.length,
            completedBarters: completedBarters,
            totalMessages: messages.length,
            averageRating: averageRating.toFixed(1),
            averageAge: averageAge.toFixed(1),
            totalReports: reports.length,
            totalBugReports: bugReports.length,
            totalContactSubmissions: contactSubmissions.length
        };
    };

    const analyticsStats = getAnalyticsStats();

    if (isLoading && !users.length) { // Show initial loader only if no data is present yet
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className="w-16 h-16 bg-gradient-to-r from-orange-500 to-teal-500 rounded-full mx-auto mb-4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-white text-lg">טוען פאנל ניהול...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Header */}
                <motion.div
                    className="flex items-center justify-between mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-teal-500 bg-clip-text text-transparent">
                            פאנל ניהול מערכת
                        </h1>
                        <p className="text-gray-400 mt-2">ברוכים הבאים, {user?.full_name || user?.email}</p>
                    </div>
                    <Button
                        onClick={loadData}
                        className="bg-gradient-to-r from-orange-500 to-teal-500 hover:from-orange-600 hover:to-teal-600 text-white border-0"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        רענן נתונים
                    </Button>
                </motion.div>

                {/* Navigation Tabs */}
                <motion.div
                    className="flex flex-wrap gap-2 mb-8 bg-gray-800/50 p-3 rounded-2xl backdrop-blur-sm border border-gray-700"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {[
                        { key: 'dashboard', label: 'דשבורד', icon: BarChart3 },
                        { key: 'analytics', label: 'ניתוח נתונים', icon: PieChartIcon },
                        { key: 'all-users', label: 'כל המשתמשים', icon: UserCheck, count: users.length },
                        { key: 'matches', label: 'התאמות', icon: Heart, count: matches.length },
                        { key: 'ratings', label: 'דירוגים', icon: Star, count: ratings.length },
                        { key: 'reports', label: 'דיווחים', icon: AlertTriangle, count: reports.length },
                        { key: 'bugs', label: 'באגים', icon: Bug, count: bugReports.length },
                        { key: 'contacts', label: 'פניות', icon: MessageSquare, count: contactSubmissions.length },
                        { key: 'demo', label: 'מצב הדגמה', icon: Users }
                    ].map((tab) => (
                        <Button
                            key={tab.key}
                            variant={activeTab === tab.key ? 'default' : 'ghost'}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 relative transition-all duration-200 ${
                                activeTab === tab.key
                                    ? 'bg-gradient-to-r from-orange-500 to-teal-500 text-white shadow-lg'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {tab.count > 0 && (
                                <motion.span
                                    className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center absolute -top-2 -right-2"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500 }}
                                >
                                    {tab.count}
                                </motion.span>
                            )}
                        </Button>
                    ))}
                </motion.div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Dashboard Tab */}
                        {activeTab === 'dashboard' && (
                            <div className="space-y-6">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatsCard
                                        icon={Users}
                                        title="משתמשים רשומים"
                                        value={analyticsStats.totalUsers}
                                        change={`+${users.filter(u => new Date(u.created_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}`}
                                        color="from-blue-500 to-purple-500"
                                    />
                                    <StatsCard
                                        icon={Activity}
                                        title="משתמשים פעילים"
                                        value={analyticsStats.activeUsers}
                                        change={`+${users.filter(u => new Date(u.updated_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}`}
                                        color="from-green-500 to-teal-500"
                                    />
                                    <StatsCard
                                        icon={Heart}
                                        title="התאמות"
                                        value={analyticsStats.totalMatches}
                                        change={`+${matches.filter(m => new Date(m.created_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}`}
                                        color="from-pink-500 to-red-500"
                                    />
                                    <StatsCard
                                        icon={Star}
                                        title="גיל ממוצע"
                                        value={analyticsStats.averageAge}
                                        change=""
                                        color="from-yellow-500 to-orange-500"
                                    />
                                </div>

                                {/* Recent Activity */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <Card className="bg-gray-800/50 border-gray-700 text-white">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <TrendingUp className="w-5 h-5 text-green-400" />
                                                פעילות אחרונה
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                    <span className="text-sm">{users.length} משתמשים רשומים</span>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-blue-400 rounded-lg">
                                                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                                    <span className="text-sm">{matches.length} התאמות נוצרו</span>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-purple-400 rounded-lg">
                                                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                                    <span className="text-sm">{messages.length} הודעות נשלחו</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-gray-800/50 border-gray-700 text-white">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                                התראות
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {contactSubmissions.filter(c => c.status === 'new').length > 0 && (
                                                    <div className="flex items-center gap-3 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                                                        <MessageSquare className="w-4 h-4 text-blue-400" />
                                                        <span className="text-sm">{contactSubmissions.filter(c => c.status === 'new').length} פניות חדשות</span>
                                                    </div>
                                                )}
                                                {bugReports.filter(b => b.status === 'new').length > 0 && (
                                                    <div className="flex items-center gap-3 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                                                        <Bug className="w-4 h-4 text-red-400" />
                                                        <span className="text-sm">{bugReports.filter(b => b.status === 'new').length} דיווחי באגים חדשים</span>
                                                    </div>
                                                )}
                                                {reports.length > 0 && (
                                                    <div className="flex items-center gap-3 p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                                                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                                        <span className="text-sm">{reports.length} דיווחים על משתמשים</span>
                                                    </div>
                                                )}
                                                {contactSubmissions.filter(c => c.status === 'new').length === 0 &&
                                                 bugReports.filter(b => b.status === 'new').length === 0 &&
                                                 reports.length === 0 && (
                                                    <p className="text-gray-400 text-center py-4">אין התראות חדשות</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {/* Analytics Tab */}
                        {activeTab === 'analytics' && (
                            <div className="grid md:grid-cols-2 gap-6">
                                <Card className="bg-gray-800/50 border-gray-700 text-white">
                                    <CardHeader>
                                        <CardTitle>התפלגות גילאים</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <AgeDistributionChart users={users} />
                                    </CardContent>
                                </Card>

                                <Card className="bg-gray-800/50 border-gray-700 text-white">
                                    <CardHeader>
                                        <CardTitle>התפלגות גיאוגרפית</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <LocationDistributionChart users={users} />
                                    </CardContent>
                                </Card>

                                <Card className="bg-gray-800/50 border-gray-700 text-white md:col-span-2">
                                    <CardHeader>
                                        <CardTitle>השירותים הפופולריים ביותר</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ServicesChart users={users} />
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* All Users Tab with Error Handling */}
                        {activeTab === 'all-users' && (
                            <Card className="bg-gray-800/50 border-gray-700 text-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserCheck className="w-5 h-5" />
                                        כל המשתמשים ({users.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loadError ? (
                                        <div className="text-center py-10">
                                            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                            <p className="text-xl text-red-400 mb-2">אירעה שגיאה</p>
                                            <p className="text-gray-400 mb-6">{loadError}</p>
                                            <Button
                                                onClick={loadData}
                                                className="bg-gradient-to-r from-orange-500 to-teal-500 hover:from-orange-600 hover:to-teal-600 text-white border-0"
                                            >
                                                <RefreshCw className="w-4 h-4 ml-2" />
                                                נסה שוב
                                            </Button>
                                        </div>
                                    ) : isLoading ? (
                                        <div className="text-center py-10 text-gray-400">טוען משתמשים...</div>
                                    ) : users.length === 0 ? (
                                        <div className="text-center py-10 text-gray-400">
                                            <Users className="w-12 h-12 mx-auto mb-4" />
                                            <p>אין עדיין משתמשים רשומים במערכת.</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-gray-700">
                                                        <th className="text-right p-3">שם מלא</th>
                                                        <th className="text-right p-3">אימייל</th>
                                                        <th className="text-right p-3">עיר</th>
                                                        <th className="text-right p-3">גיל</th>
                                                        <th className="text-right p-3">תאריך הצטרפות</th>
                                                        <th className="text-right p-3">סטטוס</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {users.slice().sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map((userItem) => (
                                                        <motion.tr
                                                            key={userItem.id}
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="border-b border-gray-700/50 hover:bg-gray-700/30"
                                                        >
                                                            <td className="p-3 font-medium flex items-center gap-2">
                                                                {userItem.profile_image ? (
                                                                    <img src={userItem.profile_image} alt={userItem.full_name} className="w-8 h-8 rounded-full object-cover" />
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center font-bold text-sm">
                                                                        {userItem.full_name?.charAt(0).toUpperCase() || '?'}
                                                                    </div>
                                                                )}
                                                                {userItem.full_name || 'לא צוין'}
                                                            </td>
                                                            <td className="p-3 text-gray-400">{userItem.email}</td>
                                                            <td className="p-3">{userItem.location || 'לא צוין'}</td>
                                                            <td className="p-3">{userItem.age || 'לא צוין'}</td>
                                                            <td className="p-3 text-gray-400">
                                                                {format(new Date(userItem.created_date), "dd/MM/yyyy", { locale: he })}
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="flex gap-2">
                                                                    {userItem.role === 'admin' && (
                                                                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                                                            מנהל
                                                                        </Badge>
                                                                    )}
                                                                    {new Date(userItem.updated_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? (
                                                                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                                                            פעיל
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">
                                                                            לא פעיל
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Reports Tab */}
                        {activeTab === 'reports' && (
                            <Card className="bg-gray-800/50 border-gray-700 text-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-red-400" />
                                        דיווחים אחרונים
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {reports.length === 0 ? (
                                        <p className="text-gray-400 text-center py-8">אין דיווחים חדשים</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {reports.slice().sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5).map((report) => {
                                                const reporter = users.find(u => u.id === report.reporter_id);
                                                const reported = users.find(u => u.id === report.reported_id);
                                                return (
                                                    <motion.div
                                                        key={report.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="p-4 border-red-500/50 bg-red-500/10 rounded-lg"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h4 className="font-semibold text-red-400">
                                                                    דיווח מ-{reporter?.full_name || 'משתמש לא זמין'}
                                                                </h4>
                                                                <p className="text-sm text-red-300">
                                                                    על {reported?.full_name || 'משתמש לא זמין'}
                                                                </p>
                                                            </div>
                                                            <span className="text-xs text-gray-400">
                                                                {format(new Date(report.created_date), "d/M/yyyy HH:mm", { locale: he })}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-200 bg-gray-700/50 p-3 rounded border border-gray-600">
                                                            <strong>סיבה:</strong> {report.reason}
                                                        </p>
                                                        <div className="flex gap-2 mt-3">
                                                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">טעון טיפול</Badge>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Bug Reports Tab */}
                        {activeTab === 'bugs' && (
                            <Card className="bg-gray-800/50 border-gray-700 text-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bug className="w-5 h-5" />
                                        דיווחי באגים ({bugReports.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {bugReports.length === 0 ? (
                                            <p className="text-gray-400 text-center py-8">אין דיווחי באגים</p>
                                        ) : (
                                            bugReports.slice().sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map((bug) => (
                                                <motion.div
                                                    key={bug.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`p-4 rounded-lg border-2 ${
                                                        bug.status === 'new'
                                                          ? 'border-red-500/50 bg-red-500/10'
                                                          : bug.status === 'in_progress'
                                                          ? 'border-yellow-500/50 bg-yellow-500/10'
                                                          : 'border-green-500/50 bg-green-500/10'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h4 className="font-bold">{bug.reporter_name}</h4>
                                                            <p className="text-gray-400">{bug.reporter_email}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {format(new Date(bug.created_date), 'dd/MM/yyyy HH:mm', { locale: he })}
                                                            </p>
                                                            {bug.page_url && (
                                                                <p className="text-xs text-blue-400 mt-1">
                                                                    דף: {bug.page_url}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Select
                                                                value={bug.status}
                                                                onValueChange={(value) => updateBugStatus(bug.id, value)}
                                                            >
                                                                <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                                                                    <SelectValue placeholder="סטטוס" />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-gray-700 border-gray-600">
                                                                    <SelectItem value="new" className="text-white hover:bg-gray-600">חדש</SelectItem>
                                                                    <SelectItem value="in_progress" className="text-white hover:bg-gray-600">בטיפול</SelectItem>
                                                                    <SelectItem value="resolved" className="text-white hover:bg-gray-600">נפתר</SelectItem>
                                                                    <SelectItem value="closed" className="text-white hover:bg-gray-600">סגור</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-700/50 p-3 rounded-lg">
                                                        <p className="text-gray-200 whitespace-pre-wrap">{bug.bug_description}</p>
                                                    </div>
                                                    <div className="flex gap-2 mt-3">
                                                        <Badge
                                                            className={
                                                                bug.priority === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                                                bug.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                                                bug.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                                                'bg-green-500/20 text-green-400 border-green-500/30'
                                                            }
                                                        >
                                                            {bug.priority}
                                                        </Badge>
                                                        <Badge className={
                                                            bug.status === 'resolved' || bug.status === 'closed'
                                                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                                                        }>
                                                            {bug.status}
                                                        </Badge>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Contact Submissions Tab */}
                        {activeTab === 'contacts' && (
                            <Card className="bg-gray-800/50 border-gray-700 text-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5" />
                                        פניות יצירת קשר ({contactSubmissions.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {/* Active/Pending Contacts */}
                                        <div>
                                            <h4 className="text-lg font-semibold mb-4 text-orange-400">פניות פעילות</h4>
                                            {contactSubmissions.filter(s => s.status === 'new').length === 0 ? (
                                                <p className="text-gray-400 text-center py-4">אין פניות חדשות</p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {contactSubmissions.filter(s => s.status === 'new').slice().sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map((submission) => (
                                                        <motion.div
                                                            key={submission.id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className={`p-4 rounded-lg border-2 ${
                                                                submission.status === 'new'
                                                                  ? 'border-blue-500/50 bg-blue-500/10'
                                                                  : submission.status === 'read'
                                                                  ? 'border-yellow-500/50 bg-yellow-500/10'
                                                                  : 'border-green-500/50 bg-green-500/10'
                                                            }`}
                                                        >
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div>
                                                                    <h4 className="font-bold text-lg">{submission.name}</h4>
                                                                    <p className="text-gray-400">{submission.email}</p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {format(new Date(submission.created_date), 'dd/MM/yyyy HH:mm', { locale: he })}
                                                                    </p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <Select
                                                                        value={submission.status}
                                                                        onValueChange={(value) => updateContactStatus(submission.id, value)}
                                                                    >
                                                                        <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                                                                            <SelectValue placeholder="סטטוס" />
                                                                        </SelectTrigger>
                                                                        <SelectContent className="bg-gray-700 border-gray-600">
                                                                            <SelectItem value="new" className="text-white hover:bg-gray-600">חדש</SelectItem>
                                                                            <SelectItem value="read" className="text-white hover:bg-gray-600">נקרא</SelectItem>
                                                                            <SelectItem value="resolved" className="text-white hover:bg-gray-600">טופל</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </div>
                                                            <div className="bg-gray-700/50 p-3 rounded-lg">
                                                                <p className="text-gray-200 whitespace-pre-wrap">{submission.message}</p>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Resolved Contacts - Show only those resolved in last 2 days */}
                                        <div>
                                            <h4 className="text-lg font-semibold mb-4 text-green-400">פניות שטופלו (יומיים אחרונים)</h4>
                                            {contactSubmissions.filter(s =>
                                                (s.status === 'resolved' || s.status === 'read') &&
                                                s.resolved_at &&
                                                new Date(s.resolved_at) > new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
                                            ).length === 0 ? (
                                                <p className="text-gray-400 text-center py-4">אין פניות שטופלו לאחרונה</p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {contactSubmissions.filter(s =>
                                                        (s.status === 'resolved' || s.status === 'read') &&
                                                        s.resolved_at &&
                                                        new Date(s.resolved_at) > new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
                                                    ).slice().sort((a, b) => new Date(b.resolved_at || b.created_date) - new Date(a.resolved_at || a.created_date)).map((submission) => (
                                                        <motion.div
                                                            key={submission.id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className={`p-4 rounded-lg border-2 ${
                                                                submission.status === 'new'
                                                                  ? 'border-blue-500/50 bg-blue-500/10'
                                                                  : submission.status === 'read'
                                                                  ? 'border-yellow-500/50 bg-yellow-500/10'
                                                                  : 'border-green-500/50 bg-green-500/10'
                                                            }`}
                                                        >
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div>
                                                                    <h4 className="font-bold text-lg">{submission.name}</h4>
                                                                    <p className="text-gray-400">{submission.email}</p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {format(new Date(submission.created_date), 'dd/MM/yyyy HH:mm', { locale: he })}
                                                                        {submission.resolved_at && (
                                                                            <span className="ml-2 text-green-300">
                                                                                (טופל: {format(new Date(submission.resolved_at), 'dd/MM/yyyy HH:mm', { locale: he })})
                                                                            </span>
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <Select
                                                                        value={submission.status}
                                                                        onValueChange={(value) => updateContactStatus(submission.id, value)}
                                                                    >
                                                                        <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                                                                            <SelectValue placeholder="סטטוס" />
                                                                        </SelectTrigger>
                                                                        <SelectContent className="bg-gray-700 border-gray-600">
                                                                            <SelectItem value="new" className="text-white hover:bg-gray-600">חדש</SelectItem>
                                                                            <SelectItem value="read" className="text-white hover:bg-gray-600">נקרא</SelectItem>
                                                                            <SelectItem value="resolved" className="text-white hover:bg-gray-600">טופל</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </div>
                                                            <div className="bg-gray-700/50 p-3 rounded-lg">
                                                                <p className="text-gray-200 whitespace-pre-wrap">{submission.message}</p>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Matches Tab - Added for completeness based on nav buttons */}
                        {activeTab === 'matches' && (
                            <Card className="bg-gray-800/50 border-gray-700 text-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Heart className="w-5 h-5" />
                                        כל ההתאמות ({matches.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {matches.length === 0 ? (
                                        <p className="text-gray-400 text-center py-8">אין התאמות עדיין</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {matches.slice().sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map((match) => {
                                                const user1 = users.find(u => u.id === match.user1_id);
                                                const user2 = users.find(u => u.id === match.user2_id);
                                                return (
                                                    <div key={match.id} className="p-4 border border-gray-700 rounded-lg bg-gray-700/50">
                                                        <p className="font-semibold">
                                                            התאמה בין {user1?.full_name || 'N/A'} ל-{user2?.full_name || 'N/A'}
                                                        </p>
                                                        <p className="text-sm text-gray-400">נוצרה ב: {format(new Date(match.created_date), "d/M/yyyy HH:mm", { locale: he })}</p>
                                                        <Badge
                                                            className={`mt-2 ${
                                                                match.status === 'active'
                                                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                                            }`}
                                                        >
                                                            {match.status}
                                                        </Badge>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Ratings Tab - Added for completeness based on nav buttons */}
                        {activeTab === 'ratings' && (
                            <Card className="bg-gray-800/50 border-gray-700 text-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Star className="w-5 h-5" />
                                        כל הדירוגים ({ratings.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {ratings.length === 0 ? (
                                        <p className="text-gray-400 text-center py-8">אין דירוגים עדיין</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {ratings.slice().sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map((rating) => {
                                                const rater = users.find(u => u.id === rating.rater_id);
                                                const rated = users.find(u => u.id === rating.rated_id);
                                                return (
                                                    <div key={rating.id} className="p-4 border border-gray-700 rounded-lg bg-gray-700/50">
                                                        <p className="font-semibold">
                                                            {rater?.full_name || 'N/A'} דירג/ה את {rated?.full_name || 'N/A'}
                                                        </p>
                                                        <p className="text-sm text-gray-400">כוכבים: {rating.stars}</p>
                                                        <p className="text-sm text-gray-400">
                                                            {rating.comment || 'אין תגובה'}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            נוצר ב: {format(new Date(rating.created_date), "d/M/yyyy HH:mm", { locale: he })}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Demo Tab */}
                        {activeTab === 'demo' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
                                <DemoUserGenerator />
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
