import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { User } from '@/entities/User';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function EmailRegistration({ onClose }) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedMarketing, setAcceptedMarketing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (!acceptedTerms || !acceptedPrivacy) {
      alert('יש לאשר את תנאי השימוש ומדיניות הפרטיות');
      return;
    }

    setIsLoading(true);
    try {
      // Store consent data in sessionStorage for use after login
      const consentData = {
        terms_accepted: acceptedTerms,
        privacy_accepted: acceptedPrivacy,
        marketing_accepted: acceptedMarketing
      };
      
      sessionStorage.setItem('userConsent', JSON.stringify(consentData));
      
      // Redirect to Google login with callback
      await User.loginWithRedirect(window.location.origin + createPageUrl('Dashboard'));
      
    } catch (error) {
      console.error("Google login failed:", error);
      setIsLoading(false);
    }
  };

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
              הרשמה / התחברות
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 text-center">
              <p className="text-gray-600 text-sm md:text-base">
                הדרך המהירה והמאובטחת ביותר להצטרף היא באמצעות חשבון הגוגל שלכם.
              </p>
              
              {/* Consent Checkboxes */}
              <div className="space-y-3 text-right bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="terms" 
                    checked={acceptedTerms}
                    onCheckedChange={setAcceptedTerms}
                  />
                  <label htmlFor="terms" className="text-xs md:text-sm leading-tight">
                    אני מאשר/ת את{' '}
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
                    אני מאשר/ת את{' '}
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
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={!acceptedTerms || !acceptedPrivacy || isLoading}
              >
                <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-4 h-4 ml-2" />
                {isLoading ? 'מתחבר...' : 'המשך עם Google'}
              </Button>
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