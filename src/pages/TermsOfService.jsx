import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function TermsOfService() {
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
              <CardTitle className="text-2xl font-bold">תנאי שימוש – Barter4U</CardTitle>
              <p className="text-white/90">עודכן לאחרונה: 24 ביוני 2025</p>
            </CardHeader>
            <CardContent className="p-8 prose prose-lg max-w-none text-right space-y-6">
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-3">הסכמה לתנאים</h2>
                <p className="text-gray-700 leading-relaxed">
                  השימוש באפליקציית Barter4U ("האפליקציה") מהווה הסכמה מלאה ובלתי חוזרת לתנאים אלה. אם אינך מסכים לאחד או יותר מהתנאים – אינך רשאי לעשות שימוש באפליקציה.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-3">מהות השירות</h2>
                <p className="text-gray-700 leading-relaxed">
                  האפליקציה מהווה פלטפורמה דיגיטלית להחלפת שירותים ומוצרים (ברטרים) בין משתמשים. Barter4U אינה צד לעסקאות המתבצעות בין המשתמשים, ואינה אחראית לאיכות, זמינות, חוקיות או כל התחייבות הקשורה לעסקאות אלה.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-3">התנהגות המשתמשים</h2>
                <p className="text-gray-700 leading-relaxed">
                  המשתמש מתחייב לפעול בהגינות, בנימוס ובכבוד כלפי משתמשים אחרים. חל איסור מוחלט לפרסם או לשתף תכנים פוגעניים, מסיתים, בלתי חוקיים, מטרידים או גזעניים. הפרה של תנאי זה עלולה להוביל לחסימת החשבון ללא התראה מוקדמת.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-3">דיווח על הפרות וחסימת משתמשים</h2>
                <p className="text-gray-700 leading-relaxed">
                  האפליקציה כוללת כלים לדיווח וחסימת משתמשים שמפרים את תנאי השימוש. הנהלת Barter4U שומרת לעצמה את הזכות להשעות, לחסום או למחוק חשבונות של משתמשים לפי שיקול דעתה, וללא צורך במתן הסבר מראש.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-3">הגבלת אחריות</h2>
                <p className="text-gray-700 leading-relaxed">
                  השימוש באפליקציה ובכלל השירותים הכלולים בה נעשה באחריותך הבלעדית. החברה לא תישא בכל אחריות, ישירה או עקיפה, בגין נזק או הפסד שייגרם כתוצאה מהשימוש באפליקציה או מהתקשרות עם משתמשים אחרים.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-3">שמירה על פרטיות</h2>
                <p className="text-gray-700 leading-relaxed">
                  פרטיות המשתמשים חשובה לנו. השימוש באפליקציה כפוף למדיניות הפרטיות של Barter4U, הכוללת פירוט על אופן איסוף, שמירה ושימוש במידע אישי.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-3">קניין רוחני</h2>
                <p className="text-gray-700 leading-relaxed">
                  כל זכויות היוצרים, סימני המסחר, העיצובים והתכנים באפליקציה הם רכוש בלעדי של Barter4U, ואין להעתיק, לשכפל או לעשות בהם כל שימוש אחר ללא אישור מראש ובכתב.
                </p>
              </section>

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