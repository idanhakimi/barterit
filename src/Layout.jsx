import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { BugReport } from "@/entities/BugReport";
import { Heart, MessageCircle, Star, BarChart3, Settings, Search, LogIn, User as UserIcon, AlertTriangle, Sun, Moon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
// Removed SendEmail import as it's no longer used for welcome emails
import AccessibilityWidget from "@/components/AccessibilityWidget";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

// Welcome Popup Component
const WelcomePopup = ({ isVisible, onClose, userName }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-xl p-6 max-w-md w-full text-center"
          >
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/barterim-logo.png" 
              alt="BARTERIM Logo" 
              className="w-20 h-20 mx-auto mb-4"
            />
            <h3 className="text-2xl font-bold gradient-text mb-2">
              ברוכים הבאים ל-BARTERIM!
            </h3>
            {userName && (
              <p className="text-xl text-gray-700 mb-4">
                שלום {userName},
              </p>
            )}
            <p className="text-gray-600 mb-6">
              אנחנו נרגשים שהצטרפתם לקהילה שלנו! התחילו לגלות עולם של שירותים בברטר.
            </p>
            <Button 
              onClick={onClose} 
              className="bg-orange-500 hover:bg-orange-600 text-white w-full"
            >
              בואו נתחיל!
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showErrorReporter, setShowErrorReporter] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmittingBug, setIsSubmittingBug] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false); // New state for welcome popup
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try { return localStorage.getItem('darkMode') === 'true'; } catch { return false; }
  });
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try { localStorage.setItem('darkMode', newMode.toString()); } catch {}
  };
  
  const publicPages = ["Home", "TermsOfService", "PrivacyPolicy", "AccessibilityStatement", "Blog", "BlogPost"];
  const isPublicPage = publicPages.includes(currentPageName);

  useEffect(() => {
    // Google Analytics Script Injection
    if (!document.getElementById('google-analytics-script')) {
        const script = document.createElement('script');
        script.id = 'google-analytics-script';
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-06Z0MRB6YB';
        document.head.appendChild(script);

        const inlineScript = document.createElement('script');
        inlineScript.id = 'google-analytics-inline-script';
        inlineScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-06Z0MRB6YB');
        `;
        document.head.appendChild(inlineScript);
    }

    const checkUser = async () => {
      setIsLoading(true);
      try {
        const userData = await User.me();
        setUser(userData);

        // Check if user just logged in and has consent data to save
        const storedConsent = sessionStorage.getItem('userConsent');
        if (storedConsent) {
          try {
            const consentData = JSON.parse(storedConsent);
            
            // Always update consent data for new registrations
            await User.updateMyUserData(consentData);
            console.log('Consent data saved for user:', userData.email);
            
            // Clear stored consent data
            sessionStorage.removeItem('userConsent');
          } catch (error) {
            console.error('Error processing consent data:', error);
          }
        }

        // Check if it's a new user and show welcome popup (New logic)
        const now = new Date();
        const createdDate = new Date(userData.created_date);
        const isNewUser = (now.getTime() - createdDate.getTime()) < 600000; // 10 minutes threshold
        const welcomeShown = localStorage.getItem(`welcomeShown_${userData.id}`);

        if (isNewUser && !welcomeShown) {
          setShowWelcomePopup(true);
        }

        // Redirect logged-in users from public pages to Dashboard
        if (isPublicPage && currentPageName === 'Home') {
          window.location.href = createPageUrl('dashboard');
          return;
        }
        
      } catch (error) {
        setUser(null);
        // Only redirect to Home if trying to access a protected page
        if (!isPublicPage) {
          window.location.href = createPageUrl('Home');
        }
      }
      setIsLoading(false);
    };
    checkUser();
  }, [location.pathname, isPublicPage, currentPageName]);

  useEffect(() => {
    // Global error handler
    const handleError = (event) => {
      console.error('Global error caught:', event.error);
      setErrorMessage(event.error?.message || 'שגיאה לא ידועה');
      setShowErrorReporter(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  const handleLogin = async () => {
    try {
      await User.login();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };
  
  const handleLogout = async () => {
    try {
      await User.logout();
      setUser(null);
      window.location.href = createPageUrl('Home');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleWelcomeClose = () => { // New function for welcome popup
    setShowWelcomePopup(false);
    if (user) {
      localStorage.setItem(`welcomeShown_${user.id}`, 'true');
    }
  };

  const reportError = async () => {
    if (!errorMessage.trim()) return;
    
    setIsSubmittingBug(true);
    try {
      // Save bug report to database only (no email)
      await BugReport.create({
        reporter_email: user?.email || 'anonymous',
        reporter_name: user?.full_name || 'אנונימי',
        bug_description: errorMessage,
        page_url: window.location.href,
        status: 'new',
        priority: 'medium'
      });

      setShowErrorReporter(false);
      setErrorMessage("");
      alert('הדיווח נשלח בהצלחה! תודה על עזרתכם.');
    } catch (error) {
      console.error("Failed to save bug report:", error);
      alert('אירעה שגיאה בשליחת הדיווח. אנא נסו שוב מאוחר יותר.');
    }
    setIsSubmittingBug(false);
  };
  
  const isActivePage = (pageName) => {
    return location.pathname === createPageUrl(pageName);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-teal-50" dir="rtl">
        <motion.div 
          className="w-16 h-16 bg-gradient-to-r from-orange-500 to-teal-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  // If the page is public and user is not logged in, don't show the main app layout
  if (isPublicPage && !user) {
    return (
      <div dir="rtl">
        <AccessibilityWidget />
        <PWAInstallPrompt />
        {children}
      </div>
    );
  }

  // --- App layout for logged-in users ---
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' : 'bg-gray-50'}`} dir="rtl">
      <AccessibilityWidget />
      <PWAInstallPrompt />
      
      {/* Welcome Popup */}
      <WelcomePopup
        isVisible={showWelcomePopup}
        onClose={handleWelcomeClose}
        userName={user?.full_name}
      />

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;700;900&display=swap');

          :root {
            --primary-orange: #FF6B35;
            --primary-teal: #4ECDC4;
            --primary-blue: #45B7D1;
            --bg-dark: ${isDarkMode ? '#1a1d2e' : '#f8fafc'};
            --bg-darker: ${isDarkMode ? '#13161f' : '#f1f5f9'};
            --bg-card: ${isDarkMode ? '#252945' : '#ffffff'};
            --text-light: ${isDarkMode ? '#e2e8f0' : '#1e293b'};
            --text-muted: ${isDarkMode ? '#94a3b8' : '#64748b'};
            --border-color: ${isDarkMode ? '#3d4363' : '#e2e8f0'};
          }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            direction: rtl;
            background: ${isDarkMode ? 'linear-gradient(135deg, #13161f 0%, #1a1d2e 100%)' : '#f8fafc'};
            color: var(--text-light);
          }

          .font-rubik {
            font-family: 'Rubik', sans-serif;
          }

          .glass-card {
            background: ${isDarkMode ? 'rgba(37, 41, 69, 0.8)' : 'rgba(255, 255, 255, 0.9)'};
            backdrop-filter: blur(10px);
            border: 1px solid var(--border-color);
            transition: all 0.3s ease;
          }

          .glass-card:hover {
            background: ${isDarkMode ? 'rgba(37, 41, 69, 0.95)' : 'rgba(255, 255, 255, 1)'};
            transform: translateY(-2px);
            box-shadow: 0 10px 30px ${isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'};
          }

          .gradient-text {
            background: linear-gradient(135deg, var(--primary-orange), var(--primary-teal));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          * {
            text-align: right;
          }

          .ltr {
            direction: ltr;
            text-align: left;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .animate-fade-in {
            animation: fadeIn 0.5s ease-out;
          }
        `}
      </style>
      
      {/* App Header for logged-in users */}
      <motion.header 
        className={`glass-card border-0 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-lg sticky top-0 z-50`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo - Responsive sizing */}
            <div 
              className="flex items-center gap-2 md:gap-3 cursor-pointer" 
              onClick={() => window.location.href = createPageUrl("Dashboard")}
            >
              <motion.div 
                className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68556286ca6709c560f1520f/289c7b712_barter4u.png" 
                  alt="BARTER4U Logo" 
                  className="w-full h-full object-contain"
                />
              </motion.div>
              <div className="hidden md:block">
                <h1 className="text-lg md:text-xl font-bold gradient-text">BARTER4U</h1>
                <p className="text-xs text-gray-500">Give Value, Get Value</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      to={createPageUrl("Search")} 
                      className={`p-2 md:p-3 rounded-xl transition-colors duration-200 ${
                        isActivePage("Search") 
                          ? "bg-orange-100 text-orange-600" 
                          : "text-gray-500 hover:text-orange-500 hover:bg-orange-50"
                      }`}
                    >
                      <Search className="w-4 h-4 md:w-5 md:h-5" />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      to={createPageUrl("Profile")} 
                      className={`p-2 md:p-3 rounded-xl transition-colors duration-200 ${
                        isActivePage("Profile") 
                          ? "bg-teal-100 text-teal-600" 
                          : "text-gray-500 hover:text-teal-500 hover:bg-teal-50"
                      }`}
                    >
                      <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
                    </Link>
                  </motion.div>
                  
                  <DropdownMenu>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="w-8 h-8 md:w-10 md:h-10">
                        {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
                      </Button>
                    </motion.div>
                    <DropdownMenuTrigger asChild>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="ghost" size="icon" aria-label="הגדרות ומידע נוסף" className="w-8 h-8 md:w-10 md:h-10">
                          <Settings className="w-4 h-4 md:w-5 md:h-5 text-gray-500 hover:text-gray-700" />
                        </Button>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>שלום, {user.full_name || user.email}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      {/* Bug Report Option */}
                      <DropdownMenuItem onClick={() => setShowErrorReporter(true)} className="text-blue-600 cursor-pointer">
                        <AlertTriangle className="w-4 h-4 ml-2" />
                        דווח על באג
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600 font-medium cursor-pointer">
                        התנתק
                      </DropdownMenuItem>
                       {user.role === 'admin' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to={createPageUrl("AdminDashboard")}>פאנל ניהול</Link>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={handleLogin} className="flex items-center gap-2 text-sm md:text-base px-3 md:px-4">
                    <LogIn className="w-4 h-4" />
                    <span className="hidden md:inline">התחברות / הרשמה</span>
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-24">
        {children}
      </main>

      {/* Bottom Navigation with notification badges */}
      {user && !isPublicPage && (
        <motion.nav 
          className={`glass-card border-0 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} fixed bottom-0 left-0 right-0 z-50`}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="max-w-4xl mx-auto px-2 md:px-4 py-2">
            <div className="flex justify-around items-center">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="relative">
                <Link 
                  to={createPageUrl("Dashboard")}
                  className={`flex flex-col items-center gap-1 p-2 md:p-3 rounded-xl transition-all duration-200 ${
                    isActivePage("Dashboard") 
                      ? "bg-orange-500 text-white shadow-lg transform scale-105" 
                      : "text-gray-400 hover:text-orange-500"
                  }`}
                >
                  <Heart className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xs font-medium">התאמות</span>
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="relative">
                <Link 
                  to={createPageUrl("Chat")}
                  className={`flex flex-col items-center gap-1 p-2 md:p-3 rounded-xl transition-all duration-200 ${
                    isActivePage("Chat") 
                      ? "bg-blue-500 text-white shadow-lg transform scale-105" 
                      : "text-gray-400 hover:text-blue-500"
                  }`}
                >
                  <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xs font-medium">צ'אט</span>
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link 
                  to={createPageUrl("Ratings")}
                  className={`flex flex-col items-center gap-1 p-2 md:p-3 rounded-xl transition-all duration-200 ${
                    isActivePage("Ratings") 
                      ? "bg-yellow-500 text-white shadow-lg transform scale-105" 
                      : "text-gray-400 hover:text-yellow-500"
                  }`}
                >
                  <Star className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xs font-medium">דירוגים</span>
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link 
                  to={createPageUrl("MyDashboard")}
                  className={`flex flex-col items-center gap-1 p-2 md:p-3 rounded-xl transition-all duration-200 ${
                    isActivePage("MyDashboard") 
                      ? "bg-purple-500 text-white shadow-lg transform scale-105" 
                      : "text-gray-400 hover:text-purple-500"
                  }`}
                >
                  <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xs font-medium hidden md:inline">הסטטיסטיקות שלי</span>
                  <span className="text-xs font-medium md:hidden">נתונים</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.nav>
      )}

      {/* Enhanced Error Reporter Popup */}
      <AnimatePresence>
        {showErrorReporter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                <h3 className="text-lg font-bold">דיווח על באג או בעיה</h3>
              </div>
              <p className="text-gray-600 mb-4">
                מצאתם באג או בעיה במערכת? נשמח לשמוע ולתקן בהקדם.
              </p>
              <textarea 
                className="w-full p-3 border rounded-lg mb-4 text-gray-900 bg-white" 
                placeholder="תארו את הבעיה שנתקלתם בה..."
                rows={4}
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
              />
              <div className="flex gap-3">
                <Button 
                  onClick={reportError} 
                  className="bg-orange-500 hover:bg-orange-600 text-white" 
                  disabled={!errorMessage.trim() || isSubmittingBug}
                >
                  {isSubmittingBug ? 'שולח...' : 'שלח דיווח'}
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowErrorReporter(false);
                  setErrorMessage("");
                }}>
                  סגור
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}