import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function AdminAnalytics({ leads, campaigns, pageViews = [] }) {
  // Lead status distribution
  const statusData = [
    { name: 'חדש', value: leads.filter(l => l.status === 'new').length, color: '#3b82f6' },
    { name: 'צורך קשר', value: leads.filter(l => l.status === 'contacted').length, color: '#eab308' },
    { name: 'מוסמך', value: leads.filter(l => l.status === 'qualified').length, color: '#a855f7' },
    { name: 'הומר', value: leads.filter(l => l.status === 'converted').length, color: '#22c55e' },
    { name: 'סגור', value: leads.filter(l => l.status === 'closed').length, color: '#6b7280' }
  ];

  // Lead source distribution
  const sourceData = [
    { name: 'דף נחיתה', value: leads.filter(l => l.source === 'landing_page').length },
    { name: 'טופס יצירת קשר', value: leads.filter(l => l.source === 'contact_form').length },
    { name: 'ידני', value: leads.filter(l => l.source === 'manual').length }
  ];

  // Leads over time (last 30 days)
  const getLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = leads.filter(l => l.created_date.startsWith(dateStr)).length;
      days.push({
        date: date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' }),
        leads: count
      });
    }
    return days;
  };

  const timelineData = getLast30Days();

  // Campaign stats
  const campaignStats = {
    total: campaigns.length,
    drafts: campaigns.filter(c => c.status === 'draft').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    sent: campaigns.filter(c => c.status === 'sent').length,
    totalSent: campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0)
  };

  // Conversion rate
  const conversionRate = leads.length > 0 
    ? ((leads.filter(l => l.status === 'converted').length / leads.length) * 100).toFixed(1)
    : 0;

  // Page views stats
  const totalPageViews = pageViews.length;
  const uniqueSessions = new Set(pageViews.map(pv => pv.session_id)).size;
  
  // Page views over time (last 30 days)
  const getPageViewsLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = pageViews.filter(pv => pv.created_date.startsWith(dateStr)).length;
      days.push({
        date: date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' }),
        views: count
      });
    }
    return days;
  };

  const pageViewTimelineData = getPageViewsLast30Days();

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">צפיות בדף</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-600">{totalPageViews}</div>
            <div className="text-xs text-gray-500 mt-1">{uniqueSessions} סשנים ייחודיים</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">שיעור המרה</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{conversionRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">מיילים שנשלחו</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{campaignStats.totalSent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">קמפיינים פעילים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{campaignStats.scheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">לידים פעילים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {leads.filter(l => l.status !== 'closed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>התפלגות סטטוס לידים</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>מקורות לידים</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>צפיות בדף ב-30 הימים האחרונים</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={pageViewTimelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#14b8a6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>לידים ב-30 הימים האחרונים</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance */}
      <Card>
        <CardHeader>
          <CardTitle>ביצועי קמפיינים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{campaignStats.total}</div>
              <div className="text-sm text-gray-600">סך הכל קמפיינים</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{campaignStats.drafts}</div>
              <div className="text-sm text-gray-600">טיוטות</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{campaignStats.scheduled}</div>
              <div className="text-sm text-gray-600">מתוכננים</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{campaignStats.sent}</div>
              <div className="text-sm text-gray-600">נשלחו</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}