import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

const tooltipSteps = [
  {
    id: 'welcome',
    title: 'ברוכים הבאים ל-Barter4U! 🎉',
    content: 'בואו נכיר אתכם עם המערכת בסיור קצר ומהיר',
    position: 'center'
  },
  {
    id: 'swipe',
    title: 'החליקו על הכרטיסים',
    content: 'החליקו ימינה כדי לאהוב 💚 ושמאלה כדי לדחות ❌',
    position: 'center'
  },
  {
    id: 'buttons',
    title: 'או השתמשו בכפתורים',
    content: 'תוכלו גם להשתמש בכפתורים למטה במקום החלקה',
    position: 'center'
  },
  {
    id: 'match',
    title: 'התאמה! 🎊',
    content: 'כשגם המשתמש השני יאהב אתכם - תקבלו התאמה ותוכלו להתחיל לשוחח',
    position: 'center'
  },
  {
    id: 'navigation',
    title: 'ניווט קל',
    content: 'השתמשו בתפריט התחתון כדי לנווט בין הפעולות השונות',
    position: 'center'
  },
  {
    id: 'profile',
    title: 'השלימו את הפרופיל',
    content: 'אל תשכחו למלא את הפרופיל שלכם עם תמונה ופרטים - זה מגדיל את הסיכויים להתאמות!',
    position: 'center'
  }
];

export default function FirstTimeTooltips({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < tooltipSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('barter4u_first_time_completed', 'true');
    if (onComplete) onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const currentTooltip = tooltipSteps[currentStep];
  const isLast = currentStep === tooltipSteps.length - 1;
  const isFirst = currentStep === 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            key={currentStep}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-md mx-auto"
          >
            <Card className="glass-card p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-gray-500">
                    {currentStep + 1} מתוך {tooltipSteps.length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSkip}
                  className="h-6 w-6"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <h3 className="text-lg font-bold mb-3 text-right">
                {currentTooltip.title}
              </h3>
              <p className="text-gray-600 mb-6 text-right">
                {currentTooltip.content}
              </p>

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {!isFirst && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrev}
                      className="flex items-center gap-1"
                    >
                      <ArrowRight className="w-4 h-4" />
                      הקודם
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-gray-500"
                  >
                    דלג
                  </Button>
                  <Button
                    onClick={handleNext}
                    size="sm"
                    className="bg-gradient-to-r from-orange-500 to-teal-500 text-white flex items-center gap-1"
                  >
                    {isLast ? 'סיום' : 'הבא'}
                    {!isLast && <ArrowLeft className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mt-4">
                {tooltipSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-orange-500'
                        : index < currentStep
                        ? 'bg-orange-300'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}