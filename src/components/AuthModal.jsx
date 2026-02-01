
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { User } from '@/entities/User';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function AuthModal({ onClose, mode = 'login' }) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedMarketing, setAcceptedMarketing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showExistingUserMessage, setShowExistingUserMessage] = useState(false);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setShowExistingUserMessage(false);
    
    try {
      if (currentMode === 'register') {
        if (!acceptedTerms || !acceptedPrivacy) {
          alert('יש לאשר את תנאי השימוש ומדיניות הפרטיות');
          setIsLoading(false);
          return;
        }
        
        // Store consent data for new registrations
        const consentData = {
          terms_accepted: acceptedTerms,
          privacy_accepted: acceptedPrivacy,
          marketing_accepted: acceptedMarketing
        };
        
        sessionStorage.setItem('userConsent', JSON.stringify(consentData));
      }
      
      // Try to check if user exists first (for registration mode)
      if (currentMode === 'register') {
        try {
          // This is a workaround - we can't directly check if a Google user exists
          // without them logging in first. The proper flow is handled in the backend.
          await User.loginWithRedirect(window.location.origin + createPageUrl('dashboard'));
        } catch (error) {
          // If login fails, continue with registration flow
          await User.loginWithRedirect(window.location.origin + createPageUrl('dashboard'));
        }
      } else {
        // Login mode - direct login
        await User.loginWithRedirect(window.location.origin + createPageUrl('dashboard'));
      }
      
    } catch (error) {
      console.error("Google auth failed:", error);
      setIsLoading(false);
      
      if (currentMode === 'register' && error.message?.includes('exists')) {
        setShowExistingUserMessage(true);
      }
    }
  };

  if (showExistingUserMessage) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[101] p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="w-full max-w-md"
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-center text-lg md:text-xl text-blue-600">
                חשבון קיים במערכת
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-gray-600">
                נראה שכבר יש לך חשבון במערכת. תוכל להתחבר ישירות.
              </p>
              
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => {
                    setCurrentMode('login');
                    setShowExistingUserMessage(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  התחבר למערכת
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  סגור
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[101] p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-center text-lg md:text-xl">
              {currentMode === 'register' ? 'הרשמה למערכת' : 'התחברות למערכת'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 text-center">
              <p className="text-gray-600 text-sm md:text-base">
                {currentMode === 'register' 
                  ? 'הצטרפו אלינו במהפכת הברטרים הדיגיטלית'
                  : 'התחברו למערכת באמצעות חשבון הגוגל שלכם'
                }
              </p>
              
              {/* Registration consent checkboxes */}
              {currentMode === 'register' && (
                <div className="space-y-3 text-right bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox 
                      id="terms" 
                      checked={acceptedTerms}
                      onCheckedChange={setAcceptedTerms}
                    />
                    <label htmlFor="terms" className="text-xs md:text-sm leading-tight">
                      <span className="text-red-500">*</span> אני מאשר/ת את{' '}
                      <Link to={createPageUrl("TermsOfService")} target="_blank" className="text-blue-600 hover:underline">
                        תנאי השימוש
                      </Link>
                      {' '}של Barter4U
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox 
                      id="privacy" 
                      checked={acceptedPrivacy}
                      onCheckedChange={setAcceptedPrivacy}
                    />
                    <label htmlFor="privacy" className="text-xs md:text-sm leading-tight">
                      <span className="text-red-500">*</span> אני מאשר/ת את{' '}
                      <Link to={createPageUrl("PrivacyPolicy")} target="_blank" className="text-blue-600 hover:underline">
                        מדיניות הפרטיות
                      </Link>
                      {' '}של Barter4U
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox 
                      id="marketing" 
                      checked={acceptedMarketing}
                      onCheckedChange={setAcceptedMarketing}
                    />
                    <label htmlFor="marketing" className="text-xs md:text-sm leading-tight">
                      אני מסכים/ה לקבל דיוור שיווקי מ-Barter4U
                    </label>
                  </div>
                </div>
              )}
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleAuth}
                disabled={isLoading || (currentMode === 'register' && (!acceptedTerms || !acceptedPrivacy))}
              >
                <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-4 h-4 ml-2" />
                {isLoading ? 'מתחבר...' : `${currentMode === 'register' ? 'הרשמה' : 'התחברות'} עם Google`}
              </Button>
            </div>

            {/* Switch between login and register */}
            <div className="text-center border-t pt-4">
              {currentMode === 'register' ? (
                <p className="text-sm text-gray-600">
                  כבר יש לכם חשבון?{' '}
                  <button 
                    onClick={() => setCurrentMode('login')}
                    className="text-blue-600 hover:underline"
                  >
                    התחברו כאן
                  </button>
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  עדיין אין לכם חשבון?{' '}
                  <button 
                    onClick={() => setCurrentMode('register')}
                    className="text-blue-600 hover:underline"
                  >
                    הירשמו כאן
                  </button>
                </p>
              )}
            </div>

            <div className="text-center mt-4">
              <Button type="button" variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700">
                סגור
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
