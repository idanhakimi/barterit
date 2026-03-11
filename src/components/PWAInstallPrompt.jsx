import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if it's iOS (including iPadOS)
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        setIsIOS(iOS);

        // Check if already installed (standalone mode)
        const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                          window.navigator.standalone === true || 
                          document.referrer.includes('android-app://');
        setIsStandalone(standalone);

        if (standalone) return; // Already installed, do nothing

        // Check if user already dismissed the prompt
        const dismissed = localStorage.getItem('pwa_install_dismissed');

        // Listen for the beforeinstallprompt event (Android/Chrome) - MUST be set up immediately
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            if (!dismissed) {
                setTimeout(() => setShowPrompt(true), 3000);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // For iOS Safari or if beforeinstallprompt doesn't fire, show after delay
        if (iOS && !dismissed) {
            const timer = setTimeout(() => {
                setShowPrompt(true);
            }, 5000);
            return () => {
                clearTimeout(timer);
                window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            };
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const [showIOSGuide, setShowIOSGuide] = useState(false);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setShowPrompt(false);
                localStorage.setItem('pwa_install_dismissed', 'true');
            }
        } else if (isIOS) {
            setShowIOSGuide(true);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa_install_dismissed', 'true');
    };

    if (isStandalone || !showPrompt) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40"
            >
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <img 
                                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/2139342b7_barter4u.png" 
                                alt="Barter4U" 
                                className="w-8 h-8"
                            />
                        </div>
                        
                        <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="font-bold text-gray-800">התקן את Barter4U</h4>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleDismiss}
                                    className="h-6 w-6 text-gray-400"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3">
                                קבל גישה מהירה לאפליקציה ישירות מהמסך הראשי
                            </p>
                            
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleInstall}
                                    className="bg-gradient-to-r from-orange-500 to-teal-500 text-white text-sm px-4 py-2 h-auto"
                                >
                                    <Download className="w-4 h-4 mr-1" />
                                    {isIOS ? 'הוראות התקנה' : 'התקן'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleDismiss}
                                    className="text-sm px-3 py-2 h-auto"
                                >
                                    לא עכשיו
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}