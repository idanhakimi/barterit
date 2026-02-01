import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, Star, Search, Gift, Sparkles, Users, Zap } from 'lucide-react';

const welcomeSteps = [
  {
    id: 'welcome',
    title: 'ברוכים הבאים ל-Barter4U! 🎉',
    subtitle: 'אתם רשמיים חלק מהקהילה שלנו!',
    content: 'מעכשיו תוכלו להתחיל להחליף שירותים ומוצרים עם אנשים מכל רחבי הארץ',
    icon: Gift,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'features',
    title: 'מה אתם יכולים לעשות כאן?',
    subtitle: 'גלו את כל האפשרויות הנפלאות שלנו',
    content: 'מצאו התאמות מושלמות, שוחחו עם אנשים מעניינים, ובנו את הרשת המקצועית שלכם',
    icon: Users,
    color: 'from-blue-500 to-teal-500'
  },
  {
    id: 'tips',
    title: 'טיפים להצלחה',
    subtitle: 'איך להפיק את המקסימום מהמערכת',
    content: 'השלימו את הפרופיל שלכם, היו אמיתיים ופתוחים, ותתחילו לגלות הזדמנויות חדשות',
    icon: Sparkles,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'start',
    title: 'מוכנים להתחיל?',
    subtitle: 'בואו נמצא לכם את ההתאמה המושלמת!',
    content: 'עכשיו זה הזמן לגלות את כל מה שהקהילה שלנו יכולה להציע לכם',
    icon: Zap,
    color: 'from-green-500 to-emerald-500'
  }
];

const features = [
  { icon: Heart, text: 'מצאו התאמות מושלמות', color: 'text-red-500' },
  { icon: MessageCircle, text: 'שוחחו עם אנשים מעניינים', color: 'text-blue-500' },
  { icon: Star, text: 'בנו מוניטין ודירוגים', color: 'text-yellow-500' },
  { icon: Search, text: 'חפשו שירותים מתקדמים', color: 'text-green-500' }
];

export default function WelcomePopup({ isVisible, onClose, userName }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showFeatures, setShowFeatures] = useState(false);

  useEffect(() => {
    if (isVisible && currentStep === 1) {
      const timer = setTimeout(() => setShowFeatures(true), 500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (currentStep < welcomeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setShowFeatures(false);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isVisible) return null;

  const currentWelcome = welcomeSteps[currentStep];
  const IconComponent = currentWelcome.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            key={currentStep}
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              duration: 0.5 
            }}
            className="w-full max-w-lg"
          >
            <Card className="glass-card overflow-hidden shadow-2xl border-2 border-white/20">
              {/* Header with gradient */}
              <div className={`bg-gradient-to-r ${currentWelcome.color} p-6 text-white text-center relative`}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSkip}
                  className="absolute top-2 right-2 text-white hover:bg-white/20 rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                  className="mb-4"
                >
                  <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold mb-2"
                >
                  {currentWelcome.title}
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/90 text-lg"
                >
                  {currentWelcome.subtitle}
                </motion.p>

                {userName && currentStep === 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-white/80 text-sm mt-2"
                  >
                    שלום {userName}! 👋
                  </motion.p>
                )}
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-gray-700 text-center leading-relaxed"
                >
                  {currentWelcome.content}
                </motion.p>

                {/* Features showcase */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ 
                            opacity: showFeatures ? 1 : 0, 
                            x: showFeatures ? 0 : -20 
                          }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <feature.icon className={`w-5 h-5 ${feature.color}`} />
                          <span className="text-gray-700">{feature.text}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {/* Tips showcase */}
                {currentStep === 2 && (
                  <div className="space-y-3">
                    {[
                      '📝 מלאו את הפרופיל שלכם במלואו',
                      '📸 הוסיפו תמונת פרופיל יפה',
                      '💡 תארו בבהירות מה אתם מציעים',
                      '🎯 ספרו מה אתם מחפשים'
                    ].map((tip, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className="text-gray-700 text-sm p-2 bg-orange-50 rounded-lg"
                      >
                        {tip}
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Progress dots */}
                <div className="flex justify-center gap-2">
                  {welcomeSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                        index === currentStep
                          ? 'bg-gradient-to-r from-orange-500 to-teal-500'
                          : index < currentStep
                          ? 'bg-green-400'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={handleSkip}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    דלג
                  </Button>
                  <Button
                    onClick={handleNext}
                    className={`bg-gradient-to-r ${currentWelcome.color} hover:opacity-90 text-white font-bold px-8`}
                  >
                    {currentStep === welcomeSteps.length - 1 ? 'בואו נתחיל!' : 'המשך'}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}