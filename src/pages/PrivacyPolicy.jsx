
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
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
              <CardTitle className="text-2xl font-bold">מדיניות פרטיות</CardTitle>
            </CardHeader>
            <CardContent className="p-8 prose prose-lg max-w-none text-right space-y-6">
              <h2>מבוא</h2>
              <p>
                אפליקציית Barter4U ("האפליקציה") מכבדת את פרטיותך ומחויבת להגן על המידע האישי שלך. מדיניות פרטיות זו מתארת את סוגי המידע שאנו אוספים, כיצד אנו משתמשים בו, ועם מי אנו חולקים אותו.
              </p>

              <h2>איזה מידע אנו אוספים?</h2>
              <ul>
                <li><strong>מידע שאתה מספק:</strong> שם מלא, גיל, מיקום, תמונת פרופיל, שירותים מוצעים ומבוקשים, תחומי עניין, זמינות, ופרטי התקשרות.</li>
                <li><strong>מידע על שימוש:</strong> נתוני התאמות, הודעות בצ'אט (למטרות אבטחה ודיווח), דירוגים וביקורות.</li>
                <li><strong>מידע מיקום:</strong> אם תאשר זאת, אנו נאחסן את הקואורדינטות הגיאוגרפיות שלך כדי להציע התאמות מבוססות מרחק.</li>
                <li><strong>נתוני שימוש ואנליטיקה:</strong> מידע אנונימי על אופן השימוש שלך באפליקציה, כגון דפים נצפים, משך זמן שימוש, ואינטראקציות בתוך האפליקציה.</li>
              </ul>

              <h2>כיצד אנו משתמשים במידע?</h2>
              <p>
                המידע משמש אותנו כדי לספק לך את שירותי האפליקציה, לרבות:
              </p>
              <ul>
                <li>יצירת פרופיל אישי.</li>
                <li>הצגת התאמות רלוונטיות.</li>
                <li>תפעול מערכת הצ'אט והדירוגים.</li>
                <li>שיפור ואבטחת השירות.</li>
              </ul>

              <h2>שימוש ב-Google Analytics</h2>
              <p>
                אנו משתמשים בשירותי Google Analytics כדי לאסוף מידע על אופן השימוש שלך באפליקציה. מידע זה כולל נתונים על דפים בהם ביקרת, זמן שהייה, סוג המכשיר, מערכת הפעלה, ופעולות שביצעת בתוך האפליקציה. נתונים אלו נאספים באופן אנונימי ומשמשים אותנו אך ורק לשיפור חווית המשתמש, אופטימיזציה של האפליקציה והבנת מגמות שימוש כלליות. מידע זה אינו מזהה אותך באופן אישי.
              </p>

              <h2>יצירת קשר</h2>
              <p>
                כאשר אתה יוצר איתנו קשר באמצעות טופס יצירת קשר או דואר אלקטרוני, אנו אוספים את שמך, כתובת הדוא"ל שלך ותוכן ההודעה. מידע זה משמש אך ורק למענה לפנייתך ולטיפול בבקשתך. אנו שומרים מידע זה למשך תקופה סבירה הנדרשת לטיפול בפנייה ולאחר מכן הוא נמחק, אלא אם כן נדרש אחרת על פי חוק.
              </p>

              <h2>שיתוף מידע</h2>
              <p>
                אנו לא מוכרים את המידע האישי שלך. אנו עשויים לחלוק מידע עם משתמשים אחרים כחלק מהפונקציונליות של האפליקציה (לדוגמה, הצגת הפרופיל שלך למשתמשים אחרים).
              </p>

              <h2>אבטחת מידע</h2>
              <p>
                אנו נוקטים באמצעי אבטחה סבירים כדי להגן על המידע שלך מפני גישה, שימוש או חשיפה בלתי מורשים.
              </p>

              <h2>זכויותיך</h2>
              <p>
                באפשרותך לעדכן או למחוק את פרטי הפרופיל שלך בכל עת דרך הגדרות האפליקציה.
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
