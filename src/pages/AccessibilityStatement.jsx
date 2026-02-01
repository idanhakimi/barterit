
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Accessibility } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function AccessibilityStatement() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50" dir="rtl">
      {/* Header */}
      <motion.header 
        className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/2139342b7_barter4u.png" 
                alt="Barter4U Logo" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-orange-500 to-teal-500 bg-clip-text text-transparent">Barter4U</h1>
              </div>
            </Link>
            
            <Link to={createPageUrl("Home")}>
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                חזרה לעמוד הראשי
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-white/85 backdrop-blur-sm border border-white/20 shadow-xl">
            <CardHeader className="text-center bg-gradient-to-r from-orange-500 to-teal-500 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                <Accessibility className="w-6 h-6" />
                הצהרת נגישות
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 prose prose-lg max-w-none text-right space-y-6">
              <p>
                אנו ב-Barter4U רואים חשיבות רבה במתן שירות שוויוני לכלל המשתמשים, לרבות אנשים עם מוגבלויות, ושואפים לספק חווית שימוש נגישה ככל הניתן.
              </p>
              
              <h2>מאמצי הנגישות שלנו</h2>
              <ul>
                <li>האפליקציה תומכת בניגודיות צבעים ברורה.</li>
                <li>הוספנו תוויות ARIA ותיאורים לכפתורים ואייקונים חשובים לשימוש עם קוראי מסך.</li>
                <li>המבנה הסמנטי של הדפים נועד להקל על ניווט באמצעות מקלדת.</li>
                <li>הטקסטים מיושרים לימין ותומכים באופן מלא בשפה העברית.</li>
              </ul>

              <h2>פנייה בנושאי נגישות</h2>
              <p>
                אנו ממשיכים במאמצים לשפר את נגישות האפליקציה. אם נתקלת בבעיית נגישות או יש לך הצעה לשיפור, נשמח אם תיצור איתנו קשר דרך ערוצי התמיכה.
              </p>
              
              <p className="mt-4">
                <em>עדכון אחרון: 24 ביוני 2025</em>
              </p>
              
              <div className="text-center pt-8 border-t border-gray-200">
                <Link to={createPageUrl("Home")}>
                  <Button className="bg-gradient-to-r from-orange-500 to-teal-500 text-white px-8 py-3 rounded-full">
                    חזרה לעמוד הראשי
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
