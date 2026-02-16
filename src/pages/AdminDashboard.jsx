import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createPageUrl } from '@/utils';
import { BarChart3, Users, Mail, TrendingUp, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import CRMTable from '../components/admin/CRMTable';
import EmailCampaignManager from '../components/admin/EmailCampaignManager';
import AdminAnalytics from '../components/admin/AdminAnalytics';

export default function AdminDashboard() {
  const [leads, setLeads] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [contactSubmissions, setContactSubmissions] = useState([]);
  const [pageViews, setPageViews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isAdminLoggedIn !== 'true') {
      window.location.href = createPageUrl('AdminLogin');
      return;
    }

    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [leadsData, campaignsData, contactsData, pageViewsData] = await Promise.all([
        base44.entities.Lead.list('-created_date'),
        base44.entities.EmailCampaign.list('-created_date'),
        base44.entities.ContactSubmission.list('-created_date'),
        base44.entities.PageView.list('-created_date', 1000)
      ]);
      setLeads(leadsData);
      setCampaigns(campaignsData);
      setContactSubmissions(contactsData);
      setPageViews(pageViewsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = createPageUrl('AdminLogin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex items-center gap-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/barterim-logo.png" 
              alt="Logo" 
              className="w-12 h-12"
            />
            <div>
              <h1 className="text-3xl font-bold text-white">פאנל ניהול Barter4U</h1>
              <p className="text-gray-400">מערכת CRM, אנליטיקה ודיוור</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="gap-2">
            <LogOut className="w-4 h-4" />
            התנתק
          </Button>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">סך הכל לידים</CardTitle>
              <Users className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leads.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">לידים חדשים</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leads.filter(l => l.status === 'new').length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">קמפיינים פעילים</CardTitle>
              <Mail className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaigns.filter(c => c.status === 'scheduled').length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">פניות ליצירת קשר</CardTitle>
              <BarChart3 className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contactSubmissions.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardContent className="p-6">
            <Tabs defaultValue="crm" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="crm">CRM - ניהול לידים</TabsTrigger>
                <TabsTrigger value="email">מערכת דיוור</TabsTrigger>
                <TabsTrigger value="analytics">אנליטיקה</TabsTrigger>
              </TabsList>
              
              <TabsContent value="crm">
                <CRMTable leads={leads} onUpdate={loadData} contactSubmissions={contactSubmissions} />
              </TabsContent>
              
              <TabsContent value="email">
                <EmailCampaignManager 
                  campaigns={campaigns} 
                  leads={leads}
                  onUpdate={loadData} 
                />
              </TabsContent>
              
              <TabsContent value="analytics">
                <AdminAnalytics leads={leads} campaigns={campaigns} pageViews={pageViews} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}