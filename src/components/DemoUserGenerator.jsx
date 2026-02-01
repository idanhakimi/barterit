import React, { useState } from "react";
import { GenerateImage } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, Sparkles } from "lucide-react";

export default function DemoUserGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUsers, setGeneratedUsers] = useState([]);

  const demoUserTemplates = [
    {
      full_name: "שרה כהן",
      age: 28,
      location: "תל אביב",
      bio: "מעצבת גרפית ומורה ליוגה בזמן הפנוי. אוהבת לעזור לאנשים ולחלוק ידע",
      services_offered: ["עיצוב גרפי", "שיעורי יוגה", "צילום"],
      services_wanted: ["תיקון מחשבים", "שיעורי בישול", "עיסוי"],
      interests: ["יוגה", "צילום", "טבע", "אמנות"],
      imagePrompt: "Professional portrait of a young Israeli woman, graphic designer, yoga instructor, warm smile, creative background"
    },
    {
      full_name: "דוד לוי",
      age: 35,
      location: "ירושלים", 
      bio: "טכנאי מחשבים ומתכנת. נהנה לעזור באתגרים טכנולוגיים",
      services_offered: ["תיקון מחשבים", "פיתוח אתרים", "הדרכת מחשבים"],
      services_wanted: ["עיצוב גרפי", "שיעורי גיטרה", "גינון"],
      interests: ["טכנולוגיה", "מוזיקה", "ספרים", "צמחים"],
      imagePrompt: "Professional portrait of a middle-aged Israeli man, computer technician, programmer, friendly face, tech background"
    },
    {
      full_name: "מיכל אבני",
      age: 42,
      location: "חיפה",
      bio: "שפית ביתית ואמא לשניים. אוהבת ללמד ולחלוק מתכונים",
      services_offered: ["שיעורי בישול", "הכנת עוגות", "ייעוץ תזונה"],
      services_wanted: ["שיעורי אנגלית", "עיצוב פנים", "טיפוח הגינה"],
      interests: ["בישול", "משפחה", "גידול פרחים", "קריאה"],
      imagePrompt: "Professional portrait of a warm Israeli mother, home chef, cooking instructor, kitchen background"
    },
    {
      full_name: "יואב פרידמן",
      age: 26,
      location: "תל אביב",
      bio: "מתמחה בעיסוי רפואי ופיזיותרפיה. בוגר לימודי ספורט",
      services_offered: ["עיסוי רפואי", "אימון כושר", "ייעוץ ספורט"],
      services_wanted: ["שיעורי צילום", "תיקון אופניים", "הדרכת מחשבים"],
      interests: ["ספורט", "רכיבה על אופניים", "צילום", "בריאות"],
      imagePrompt: "Professional portrait of a young Israeli man, massage therapist, fitness trainer, athletic background"
    },
    {
      full_name: "רחל גרין",
      age: 31,
      location: "פתח תקווה",
      bio: "מורה לאנגלית ומטיילת בעולם. אוהבת שפות ותרבויות",
      services_offered: ["שיעורי אנגלית", "תרגום", "ייעוץ נסיעות"],
      services_wanted: ["עיצוב גרפי", "שיעורי פילאטיס", "תיקון בגדים"],
      interests: ["שפות", "נסיעות", "תרבות", "ספרים"],
      imagePrompt: "Professional portrait of an Israeli English teacher, traveler, warm and intelligent expression"
    },
    {
      full_name: "אמיר חדד",
      age: 29,
      location: "באר שבע",
      bio: "מכונאי רכב ואוהב מוזיקה. מנגן בגיטרה בזמן הפנוי",
      services_offered: ["תיקון רכב", "שיעורי גיטרה", "ייעוץ רכישת רכב"],
      services_wanted: ["עיצוב אתרים", "שיעורי בישול", "צילום אירועים"],
      interests: ["מוזיקה", "רכב", "גיטרה", "מכניקה"],
      imagePrompt: "Professional portrait of an Israeli car mechanic, guitar player, working hands, workshop background"
    },
    {
      full_name: "לינא אבו חסן",
      age: 33,
      location: "נצרת",
      bio: "מעצבת פנים ואמנית. אוהבת ליצור חללים יפים ופונקציונליים",
      services_offered: ["עיצוב פנים", "ציור", "ייעוץ עיצוב"],
      services_wanted: ["שיעורי יוגה", "טיפוח גינה", "צילום מוצרים"],
      interests: ["אמנות", "עיצוב", "צבעים", "יצירה"],
      imagePrompt: "Professional portrait of an Arab-Israeli interior designer, artist, creative and elegant style"
    },
    {
      full_name: "אלון ברק",
      age: 27,
      location: "הרצליה",
      bio: "גנן נוף ואוהב טבע. מתמחה בעיצוב גינות ובהקמת מרחבים ירוקים",
      services_offered: ["עיצוב גינות", "טיפוח צמחים", "הדרכת גינון"],
      services_wanted: ["פיתוח אפליקציות", "שיעורי צילום", "עיסוי"],
      interests: ["טבע", "צמחים", "גינון", "סביבה"],
      imagePrompt: "Professional portrait of an Israeli landscape gardener, nature lover, outdoor setting with plants"
    },
    {
      full_name: "טליה רוזן",
      age: 24,
      location: "רמת גן",
      bio: "סטודנטית לפסיכולוגיה ומתמחה בטיפול בילדים. אוהבת לעזור ולהקשיב",
      services_offered: ["הדרכת הורים", "טיפול בילדים", "ייעוץ לימודי"],
      services_wanted: ["שיעורי ריקוד", "תיקון מחשב", "עיצוב גרפי"],
      interests: ["פסיכולוגיה", "ילדים", "ריקוד", "מוזיקה"],
      imagePrompt: "Professional portrait of a young Israeli psychology student, child therapist, warm and caring expression"
    },
    {
      full_name: "רועי שמעון",
      age: 30,
      location: "מודיעין",
      bio: "צלם פרילנסר ומדריך סדנאות צילום. אוהב לתפוס רגעים מיוחדים",
      services_offered: ["צילום אירועים", "שיעורי צילום", "עריכת תמונות"],
      services_wanted: ["עיצוב אתרים", "שיעורי בישול", "מסאז'"],
      interests: ["צילום", "אמנות", "נסיעות", "טכנולוגיה"],
      imagePrompt: "Professional portrait of an Israeli photographer, freelancer, camera in hand, creative background"
    }
  ];

  const generateDemoUsers = async () => {
    setIsGenerating(true);
    
    try {
      const usersWithImages = await Promise.all(
        demoUserTemplates.map(async (user, index) => {
          try {
            const result = await GenerateImage({
              prompt: user.imagePrompt
            });
            
            return {
              ...user,
              id: `demo_user_${index + 1}`,
              profile_image: result.url,
              rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0-5.0
              total_ratings: Math.floor(Math.random() * 25) + 5, // 5-30 ratings
              verified: Math.random() > 0.3, // 70% verified
              max_distance: Math.floor(Math.random() * 20) + 10 // 10-30 km
            };
          } catch (error) {
            console.error(`Error generating image for ${user.full_name}:`, error);
            return {
              ...user,
              id: `demo_user_${index + 1}`,
              profile_image: null,
              rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
              total_ratings: Math.floor(Math.random() * 25) + 5,
              verified: Math.random() > 0.3,
              max_distance: Math.floor(Math.random() * 20) + 10
            };
          }
        })
      );
      
      setGeneratedUsers(usersWithImages);
      
    } catch (error) {
      console.error("Error generating demo users:", error);
    }
    
    setIsGenerating(false);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          מחולל משתמשי דמו
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">
          יצירת {demoUserTemplates.length} פרופילי דמו עם תמונות AI לבדיקת המערכת
        </p>
        
        <Button
          onClick={generateDemoUsers}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-orange-500 to-teal-500 text-white"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              יוצר משתמשי דמו...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              צור משתמשי דמו
            </>
          )}
        </Button>
        
        {generatedUsers.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-3">משתמשי דמו שנוצרו:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
              {generatedUsers.map((user) => (
                <div key={user.id} className="text-center p-2 border rounded-lg">
                  {user.profile_image ? (
                    <img 
                      src={user.profile_image} 
                      alt={user.full_name}
                      className="w-12 h-12 object-cover rounded-full mx-auto mb-2"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">
                        {user.full_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <p className="text-xs font-medium">{user.full_name}</p>
                  <p className="text-xs text-gray-500">{user.location}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}