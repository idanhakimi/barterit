import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createPageUrl } from '@/utils';
import { Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already logged in
    const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isAdminLoggedIn === 'true') {
      window.location.href = createPageUrl('AdminDashboard');
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // Hardcoded credentials
    if (username === 'idanhakimi' && password === '1qaz@WSX') {
      sessionStorage.setItem('adminLoggedIn', 'true');
      window.location.href = createPageUrl('AdminDashboard');
    } else {
      setError('שם משתמש או סיסמה שגויים');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/barterim-logo.png" 
              alt="BARTERIM Logo" 
              className="w-20 h-20 mx-auto"
            />
            <CardTitle className="text-2xl font-bold">פאנל ניהול - Barter4U</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">שם משתמש</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pr-10"
                    placeholder="הזן שם משתמש"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">סיסמה</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    placeholder="הזן סיסמה"
                    required
                  />
                </div>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                התחבר
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}