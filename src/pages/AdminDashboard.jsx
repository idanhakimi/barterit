import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createPageUrl } from '@/utils';
import { BarChart3, Users, Mail, TrendingUp, Eye, LogOut, RefreshCw, MessageSquare, Bug, AlertTriangle, Heart, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import CRMTable from '../components/admin/CRMTable';
import EmailCampaignManager from '../components/admin/EmailCampaignManager';

const LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68556286ca6709c560f1520f/289c7b712_barter4u.png";

const StatCard = ({ icon: Icon, title, value, sub, color }) => (
  <Card>
    <CardContent className="pt-5 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${color || 'text-gray-800'}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color ? color.replace('text-', 'bg-').replace('-600', '-100').replace('-500', '-100') : 'bg-gray-100'}`}>
          <Icon className={`w-6 h-6 ${color || 'text-gray-600'}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const priorityColors = { low: 'bg-green-100 text-green-800', medium: 'bg-yellow-100 text-yellow-800', high: 'bg-orange-100 text-orange-800', critical: 'bg-red-100 text-red-800' };
const statusBugColors = { new: 'bg-blue-100 text-blue-800', in_progress: 'bg-yellow-100 text-yellow-800', resolved: 'bg-green-100 text-green-800', closed: 'bg-gray-100 text-gray-800' };

function BugCard({ bug, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`border-2 rounded-lg p-4 ${bug.status === 'new' ? 'border-blue-300 bg-blue-50' : bug.status === 'in_progress' ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900">{bug.reporter_name || bug.reporter_email}</p>
            <Badge className={priorityColors[bug.priority] || 'bg-gray-100 text-gray-800'}>{bug.priority}</Badge>
            <Badge className={statusBugColors[bug.status] || 'bg-gray-100 text-gray-800'}>{bug.status === 'new' ? 'חדש' : bug.status === 'in_progress' ? 'בטיפול' : bug.status === 'resolved' ? 'נפתר' : 'סגור'}</Badge>
          </div>
          <p className="text-sm text-gray-500">{bug.reporter_email} · {new Date(bug.created_date).toLocaleDateString('he-IL')}</p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={bug.priority} onValueChange={v => onUpdate(bug.id, { priority: v })}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">נמוך</SelectItem>
              <SelectItem value="medium">בינוני</SelectItem>
              <SelectItem value="high">גבוה</SelectItem>
              <SelectItem value="critical">קריטי</SelectItem>
            </SelectContent>
          </Select>
          <Select value={bug.status} onValueChange={v => onUpdate(bug.id, { status: v })}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="new">חדש</SelectItem>
              <SelectItem value="in_progress">בטיפול</SelectItem>
              <SelectItem value="resolved">נפתר</SelectItem>
              <SelectItem value="closed">סגור</SelectItem>
            </SelectContent>
          </Select>
          <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-700">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="mt-3 bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-gray-800 text-sm whitespace-pre-wrap">{bug.bug_description}</p>
          {bug.page_url && <p className="text-xs text-blue-500 mt-2">דף: {bug.page_url}</p>}
        </div>
      )}
    </div>
  );
}

function ContactCard({ contact, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`border-2 rounded-lg p-4 ${contact.status === 'new' ? 'border-blue-300 bg-blue-50' : contact.status === 'read' ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{contact.name}</p>
          <a href={`mailto:${contact.email}`} className="text-sm text-blue-600 hover:underline">{contact.email}</a>
          <p className="text-xs text-gray-400 mt-1">{new Date(contact.created_date).toLocaleDateString('he-IL')}</p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge className={contact.status === 'new' ? 'bg-blue-100 text-blue-800' : contact.status === 'read' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
            {contact.status === 'new' ? 'חדש' : contact.status === 'read' ? 'נקרא' : 'טופל'}
          </Badge>
          <Select value={contact.status} onValueChange={v => onUpdate(contact.id, { status: v })}>
            <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="new">חדש</SelectItem>
              <SelectItem value="read">נקרא</SelectItem>
              <SelectItem value="resolved">טופל</SelectItem>
            </SelectContent>
          </Select>
          <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-700">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="mt-3 bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-gray-800 text-sm whitespace-pre-wrap">{contact.message}</p>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [leads, setLeads] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [contactSubmissions, setContactSubmissions] = useState([]);
  const [pageViews, setPageViews] = useState([]);
  const [bugReports, setBugReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [messages, setMessages] = useState([]);
  const [barters, setBarters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await base44.auth.me();
        if (userData.role !== 'admin') {
          window.location.href = createPageUrl('Dashboard');
          return;
        }
        loadData();
      } catch (e) {
        base44.auth.redirectToLogin(createPageUrl('AdminDashboard'));
      }
    };
    checkAuth();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [leadsData, campaignsData, contactsData, pageViewsData, bugData, usersData, matchesData, messagesData, bartersData] = await Promise.all([
        base44.entities.Lead.list('-created_date'),
        base44.entities.EmailCampaign.list('-created_date'),
        base44.entities.ContactSubmission.list('-created_date'),
        base44.entities.PageView.list('-created_date', 1000),
        base44.entities.BugReport.list('-created_date'),
        base44.entities.User.list(),
        base44.entities.Match.list('-created_date', 200),
        base44.entities.Message.list('-created_date', 200),
        base44.entities.Barter.list('-created_date', 200)
      ]);
      setLeads(leadsData);
      setCampaigns(campaignsData);
      setContactSubmissions(contactsData);
      setPageViews(pageViewsData);
      setBugReports(bugData);
      setUsers(usersData);
      setMatches(matchesData);
      setMessages(messagesData);
      setBarters(bartersData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  };

  const updateBug = async (id, data) => {
    await base44.entities.BugReport.update(id, data);
    loadData();
  };

  const updateContact = async (id, data) => {
    await base44.entities.ContactSubmission.update(id, data);
    loadData();
  };

  const handleLogout = () => {
    base44.auth.logout(createPageUrl('Home'));
  };

  // Analytics calculations
  const last30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' }),
        צפיות: pageViews.filter(pv => pv.created_date?.startsWith(dateStr)).length,
        לידים: leads.filter(l => l.created_date?.startsWith(dateStr)).length,
        משתמשים: users.filter(u => u.created_date?.startsWith(dateStr)).length,
      });
    }
    return days;
  };

  const uniqueSessions = new Set(pageViews.map(pv => pv.session_id)).size;
  const successBarters = barters.filter(b => b.status === 'completed').length;
  const newContacts = contactSubmissions.filter(c => c.status === 'new').length;
  const newBugs = bugReports.filter(b => b.status === 'new').length;
  const matchedCount = matches.filter(m => m.status === 'matched').length;
  const sourceData = [
    { name: 'דף נחיתה', value: leads.filter(l => l.source === 'landing_page').length },
    { name: 'טופס יצירת קשר', value: leads.filter(l => l.source === 'contact_form').length },
    { name: 'ידני', value: leads.filter(l => l.source === 'manual').length },
  ];
  const COLORS = ['#FF6B35', '#4ECDC4', '#6366f1'];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <img src={LOGO} alt="Logo" className="w-20 h-20 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">טוען פאנל ניהול...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="BARTER4U" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">פאנל ניהול BARTER4U</h1>
              <p className="text-sm text-gray-500">מערכת ניהול מלאה</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadData} variant="outline" className="gap-2 text-gray-700">
              <RefreshCw className="w-4 h-4" /> רענן
            </Button>
            <Button onClick={handleLogout} variant="outline" className="gap-2 text-red-600 border-red-300 hover:bg-red-50">
              <LogOut className="w-4 h-4" /> התנתק
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <StatCard icon={Users} title="משתמשים" value={users.length} color="text-blue-600" sub={`${users.filter(u => new Date(u.created_date) > new Date(Date.now() - 7*24*60*60*1000)).length} השבוע`} />
          <StatCard icon={Eye} title="צפיות בדף" value={pageViews.length} color="text-teal-600" sub={`${uniqueSessions} סשנים ייחודיים`} />
          <StatCard icon={Heart} title="התאמות" value={matchedCount} color="text-pink-600" sub={`מתוך ${matches.length} סך הכל`} />
          <StatCard icon={BarChart3} title="ברטרים מוצלחים" value={successBarters} color="text-green-600" />
          <StatCard icon={MessageSquare} title="הודעות" value={messages.length} color="text-purple-600" />
          <StatCard icon={TrendingUp} title="לידים" value={leads.length} color="text-orange-600" sub={`${leads.filter(l => l.status === 'new').length} חדשים`} />
          <StatCard icon={Mail} title="פניות חדשות" value={newContacts} color="text-blue-600" />
          <StatCard icon={Bug} title="באגים חדשים" value={newBugs} color={newBugs > 0 ? 'text-red-600' : 'text-gray-500'} />
          <StatCard icon={Mail} title="קמפיינים" value={campaigns.length} color="text-indigo-600" sub={`${campaigns.filter(c => c.status === 'sent').length} נשלחו`} />
          <StatCard icon={Users} title="לידים מוסמכים" value={leads.filter(l => l.status === 'converted').length} color="text-emerald-600" sub="הומרו" />
        </div>

        {/* Main Tabs */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <Tabs defaultValue="overview">
              <TabsList className="flex flex-wrap h-auto gap-1 mb-6 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger value="overview" className="text-gray-700 data-[state=active]:text-gray-900">סקירה כללית</TabsTrigger>
                <TabsTrigger value="contacts" className="text-gray-700 data-[state=active]:text-gray-900">
                  פניות {newContacts > 0 && <span className="mr-1 bg-blue-500 text-white text-xs rounded-full px-1.5">{newContacts}</span>}
                </TabsTrigger>
                <TabsTrigger value="bugs" className="text-gray-700 data-[state=active]:text-gray-900">
                  באגים {newBugs > 0 && <span className="mr-1 bg-red-500 text-white text-xs rounded-full px-1.5">{newBugs}</span>}
                </TabsTrigger>
                <TabsTrigger value="crm" className="text-gray-700 data-[state=active]:text-gray-900">CRM לידים</TabsTrigger>
                <TabsTrigger value="email" className="text-gray-700 data-[state=active]:text-gray-900">דיוור</TabsTrigger>
                <TabsTrigger value="analytics" className="text-gray-700 data-[state=active]:text-gray-900">אנליטיקה</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader><CardTitle className="text-base text-gray-800">צפיות ולידים - 30 ימים אחרונים</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={last30Days()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} />
                          <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="צפיות" stroke="#14b8a6" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="לידים" stroke="#f97316" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="משתמשים" stroke="#6366f1" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="text-base text-gray-800">מקורות לידים</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={sourceData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                            {sourceData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Alerts */}
                <div className="space-y-3">
                  {newContacts > 0 && (
                    <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-800 font-medium">{newContacts} פניות חדשות ממתינות לטיפול</span>
                    </div>
                  )}
                  {newBugs > 0 && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <Bug className="w-5 h-5 text-red-600" />
                      <span className="text-red-800 font-medium">{newBugs} דיווחי באגים חדשים דורשים תשומת לב</span>
                    </div>
                  )}
                  {leads.filter(l => l.status === 'new').length > 0 && (
                    <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                      <span className="text-orange-800 font-medium">{leads.filter(l => l.status === 'new').length} לידים חדשים ממתינים לטיפול</span>
                    </div>
                  )}
                  {newContacts === 0 && newBugs === 0 && leads.filter(l => l.status === 'new').length === 0 && (
                    <div className="text-center py-6 text-gray-500">כל הפניות טופלו ✓</div>
                  )}
                </div>
              </TabsContent>

              {/* Contacts Tab */}
              <TabsContent value="contacts" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">פניות מעמוד הנחיתה ({contactSubmissions.length})</h3>
                </div>
                {contactSubmissions.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">אין פניות עדיין</div>
                ) : (
                  <div className="space-y-3">
                    {contactSubmissions.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map(contact => (
                      <ContactCard key={contact.id} contact={contact} onUpdate={updateContact} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Bugs Tab */}
              <TabsContent value="bugs" className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-lg font-semibold text-gray-800">דיווחי באגים ({bugReports.length})</h3>
                  <div className="flex gap-2 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">חדשים: {bugReports.filter(b => b.status === 'new').length}</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">בטיפול: {bugReports.filter(b => b.status === 'in_progress').length}</span>
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded">קריטי: {bugReports.filter(b => b.priority === 'critical').length}</span>
                  </div>
                </div>
                {bugReports.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">אין דיווחי באגים</div>
                ) : (
                  <div className="space-y-3">
                    {bugReports.sort((a, b) => {
                      const pOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                      return (pOrder[a.priority] || 2) - (pOrder[b.priority] || 2);
                    }).map(bug => (
                      <BugCard key={bug.id} bug={bug} onUpdate={updateBug} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* CRM Tab */}
              <TabsContent value="crm">
                <CRMTable leads={leads} onUpdate={loadData} contactSubmissions={contactSubmissions} />
              </TabsContent>

              {/* Email Tab */}
              <TabsContent value="email">
                <EmailCampaignManager campaigns={campaigns} leads={leads} onUpdate={loadData} />
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-5">
                      <p className="text-sm text-gray-500">שיעור המרת לידים</p>
                      <p className="text-3xl font-bold text-green-600">
                        {leads.length > 0 ? ((leads.filter(l => l.status === 'converted').length / leads.length) * 100).toFixed(1) : 0}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-5">
                      <p className="text-sm text-gray-500">ממוצע הודעות לשיחה</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {matches.length > 0 ? (messages.length / matches.length).toFixed(1) : 0}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-5">
                      <p className="text-sm text-gray-500">שיעור התאמה</p>
                      <p className="text-3xl font-bold text-pink-600">
                        {matches.length > 0 ? ((matchedCount / matches.length) * 100).toFixed(1) : 0}%
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader><CardTitle className="text-gray-800">גידול יומי - 30 ימים</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={last30Days()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                        <Tooltip />
                        <Bar dataKey="צפיות" fill="#14b8a6" radius={[3,3,0,0]} />
                        <Bar dataKey="לידים" fill="#f97316" radius={[3,3,0,0]} />
                        <Bar dataKey="משתמשים" fill="#6366f1" radius={[3,3,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}