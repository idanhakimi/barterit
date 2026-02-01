import React, { useState, useEffect } from 'react';
import { Accessibility, X, ZoomIn, ZoomOut, Contrast, Link2, Type, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const AccessibilityWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [settings, setSettings] = useState({
        fontSize: 100,
        highContrast: false,
        grayscale: false,
        highlightLinks: false,
        readableFont: false,
    });

    useEffect(() => {
        const body = document.body;
        body.style.fontSize = `${settings.fontSize}%`;
        body.classList.toggle('high-contrast', settings.highContrast);
        body.classList.toggle('grayscale', settings.grayscale);
        body.classList.toggle('highlight-links', settings.highlightLinks);
        body.classList.toggle('readable-font', settings.readableFont);
    }, [settings]);
    
    const resetAccessibility = () => {
        setSettings({
            fontSize: 100,
            highContrast: false,
            grayscale: false,
            highlightLinks: false,
            readableFont: false,
        });
    };

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const changeFontSize = (amount) => {
        setSettings(prev => ({ ...prev, fontSize: Math.max(80, Math.min(150, prev.fontSize + amount)) }));
    };

    return (
        <>
            <style>
                {`
                .high-contrast { filter: contrast(175%); }
                .grayscale { filter: grayscale(100%); }
                .highlight-links a { background-color: yellow !important; color: black !important; text-decoration: underline !important; }
                .readable-font { font-family: 'Arial', 'Helvetica', sans-serif !important; }
                `}
            </style>
            <div className="fixed top-1/2 left-4 transform -translate-y-1/2 z-[100]">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                        size="icon"
                        className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 shadow-lg text-white"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="פתח תפריט נגישות"
                    >
                        <Accessibility className="w-6 h-6" />
                    </Button>
                </motion.div>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-white rounded-lg shadow-2xl p-4 w-72 border"
                        >
                            <div className="flex justify-between items-center mb-4 pb-2 border-b">
                                <h4 className="font-bold">תפריט נגישות</h4>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}><X className="w-4 h-4" /></Button>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span>הגדל גופן</span>
                                    <Button size="icon" variant="outline" onClick={() => changeFontSize(10)}><ZoomIn className="w-4 h-4"/></Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>הקטן גופן</span>
                                    <Button size="icon" variant="outline" onClick={() => changeFontSize(-10)}><ZoomOut className="w-4 h-4"/></Button>
                                </div>
                                 <div className="flex items-center justify-between">
                                    <span>ניגודיות גבוהה</span>
                                    <Button size="icon" variant={settings.highContrast ? 'secondary' : 'outline'} onClick={() => toggleSetting('highContrast')}><Contrast className="w-4 h-4"/></Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>גווני אפור</span>
                                    <Button size="icon" variant={settings.grayscale ? 'secondary' : 'outline'} onClick={() => toggleSetting('grayscale')}><Moon className="w-4 h-4"/></Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>הדגשת קישורים</span>
                                    <Button size="icon" variant={settings.highlightLinks ? 'secondary' : 'outline'} onClick={() => toggleSetting('highlightLinks')}><Link2 className="w-4 h-4"/></Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>פונט קריא</span>
                                    <Button size="icon" variant={settings.readableFont ? 'secondary' : 'outline'} onClick={() => toggleSetting('readableFont')}><Type className="w-4 h-4"/></Button>
                                </div>
                                <Button variant="outline" className="w-full mt-4" onClick={resetAccessibility}>אפס הגדרות</Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default AccessibilityWidget;