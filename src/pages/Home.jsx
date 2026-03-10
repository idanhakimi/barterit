import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, BrainCircuit, TrendingUp, Mail, Facebook, Instagram, Heart, X, Star as StarIcon } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from '../components/AuthModal';
import ContactForm from '../components/ContactForm';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PiggyBank } from 'lucide-react';

const NavLink = ({ sectionId, children }) => {
    const scrollToSection = (e) => {
        e.preventDefault();
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <a href={`#${sectionId}`} onClick={scrollToSection} className="text-gray-600 hover:text-orange-500 transition-colors duration-300 font-medium">
            {children}
        </a>
    );
};

const AnimatedSwipeCards = () => {
    const [cards, setCards] = useState([
        { 
            id: 1, 
            name: 'דנה לוי', 
            age: 28,
            rating: 4.9,
            seeking: 'עיצוב גרפי, עיסוי',
            offering: 'כתיבת קורות חיים',
            img: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=200&h=200&auto=format&fit=crop' 
        },
        { 
            id: 2, 
            name: 'יוסי כהן', 
            age: 34,
            rating: 4.7,
            seeking: 'שיעורי גיטרה',
            offering: 'ייעוץ עסקי',
            img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop' 
        },
        { 
            id: 3, 
            name: 'מאיה ישראלי', 
            age: 31,
            rating: 5.0,
            seeking: 'אימון כושר',
            offering: 'תכנות אתרים',
            img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop'
        }
    ]);

    const [exitDirection, setExitDirection] = useState(0);

    const handleSwipe = (direction) => {
        setExitDirection(direction);
        setTimeout(() => {
            setCards(prev => {
                const newCards = [...prev];
                const swipedCard = newCards.shift();
                newCards.push(swipedCard);
                return newCards;
            });
            setExitDirection(0);
        }, 300);
    };

    return (
        <div className="relative w-full max-w-xs h-96 flex items-center justify-center">
            <AnimatePresence>
                {cards.slice(0, 2).reverse().map((card, index) => (
                    <motion.div
                        key={card.id}
                        className="absolute w-72 bg-white rounded-2xl shadow-2xl p-4 flex flex-col"
                        style={{ zIndex: index }}
                        initial={{ scale: 1 - index * 0.1, y: index * 20 }}
                        animate={{ scale: 1, y: 0, x: 0, rotate: 0 }}
                        exit={{ x: exitDirection * 300, opacity: 0, scale: 0.8, rotate: exitDirection * 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        <img src={card.img} className="w-full h-48 object-cover rounded-xl"/>
                        <div className="p-2">
                            <div className="flex justify-between items-center">
                                <h4 className="font-bold text-lg text-gray-800">{card.name}, {card.age}</h4>
                                <div className="flex items-center gap-1 text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                                    <StarIcon className="w-3 h-3 fill-current"/>
                                    <span>{card.rating}</span>
                                </div>
                            </div>
                            <div className="mt-2 text-sm">
                                <p className="text-gray-800"><strong className="font-semibold text-orange-600">מציעה:</strong> {card.offering}</p>
                                <p className="text-gray-800"><strong className="font-semibold text-teal-600">מחפשת:</strong> {card.seeking}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
            <div className="absolute bottom-[-60px] flex gap-6">
                <Button onClick={() => handleSwipe(-1)} size="icon" className="w-16 h-16 rounded-full bg-white shadow-lg text-red-500 hover:bg-red-50">
                    <X className="w-8 h-8"/>
                </Button>
                <Button onClick={() => handleSwipe(1)} size="icon" className="w-16 h-16 rounded-full bg-white shadow-lg text-green-500 hover:bg-green-50">
                    <Heart className="w-8 h-8"/>
                </Button>
            </div>
        </div>
    );
};

const FaqSection = () => {
    const faqs = [
        {
            question: "איך המערכת עובדת?",
            answer: "פשוט מאוד! אתם יוצרים פרופיל, מציגים את השירותים והמוצרים שאתם מציעים, ומציינים מה אתם מחפשים בתמורה. המערכת שלנו תציג לכם פרופילים רלוונטיים, ותוכלו להתחיל ליצור קשרים ולהחליף ערך."
        },
        {
            question: "האם השימוש ב-BARTERIM עולה כסף?",
            answer: "לא! השימוש הבסיסי בפלטפורמה הוא בחינם. אנו מאמינים בכלכלת שיתוף אמיתית, שבה הערך נוצר מהכישרונות והנכסים של חברי הקהילה."
        },
        {
            question: "איך נקבע השווי של כל שירות?",
            answer: "השווי נקבע בהסכמה הדדית בין שני הצדדים לעסקה. אין מחירון קבוע – אתם מדברים, מתאמים ציפיות ומגיעים להסכמה על מהי החלפה הוגנת עבור שניכם. היופי הוא בגמישות."
        },
        {
            question: "האם המידע שלי בטוח?",
            answer: "בהחלט. אנו מתייחסים לפרטיות שלכם ברצינות רבה. פרטי הקשר שלכם לא ייחשפו עד שתאשרו התאמה הדדית. בנוסף, יש לנו מערכת דירוגים ודיווחים כדי לשמור על קהילה בטוחה ואמינה."
        }
    ];

    return (
        <motion.section 
            className="py-12 md:py-20 bg-gray-50" 
            dir="rtl"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
        >
            <div className="container mx-auto px-4">
                <motion.div 
                    className="text-center mb-8 md:mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-2xl md:text-3xl font-bold">שאלות ותשובות נפוצות</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto mt-2 text-sm md:text-base">כל מה שרציתם לדעת על מהפכת הברטרים הדיגיטלית.</p>
                </motion.div>
                <div className="max-w-3xl mx-auto">
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-lg font-semibold text-right">{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-base text-gray-700">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </motion.section>
    );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="text-center p-6 bg-white/50 rounded-xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300 h-full flex flex-col">
    <div className="inline-block p-4 bg-gradient-to-r from-orange-100 to-teal-100 rounded-full mb-4 mx-auto">
      {React.createElement(icon, { className: "w-8 h-8 text-orange-500" })}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600 flex-1">{description}</p>
  </div>
);

const StepCard = ({ number, title, description }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-teal-500 text-white font-bold text-2xl rounded-full shadow-md">
            {number}
        </div>
        <div>
            <h4 className="text-lg font-semibold">{title}</h4>
            <p className="text-gray-500">{description}</p>
        </div>
    </div>
);

const TestimonialCard = ({ quote, name, service, image }) => (
  <Card className="glass-card border-0 p-6">
    <CardContent className="p-0">
      <p className="text-gray-700 italic mb-4">"{quote}"</p>
      <div className="flex items-center gap-3">
        <img src={image} alt={name} className="w-12 h-12 rounded-full object-cover"/>
        <div>
          <p className="font-bold">{name}</p>
          <p className="text-sm text-gray-500">{service}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function HomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // SEO: Update document title and meta for home page
  useEffect(() => {
    document.title = 'BARTERIM - פלטפורמת ברטרים וחילופי שירותים בישראל | ברטר דיגיטלי';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'הצטרפו ל-BARTERIM - פלטפורמת הברטרים המובילה בישראל. החליפו שירותים ללא כסף, בנו קהילה חזקה וחסכו כסף. ברטר דיגיטלי, חילופי שירותים וכלכלת שיתוף.');
    }
  }, []);

  // Track page view
  useEffect(() => {
    const trackPageView = async () => {
      try {
        // Generate session ID if not exists
        let sessionId = sessionStorage.getItem('page_session_id');
        if (!sessionId) {
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          sessionStorage.setItem('page_session_id', sessionId);
        }

        // Record page view
        await base44.entities.PageView.create({
          page_name: 'Home',
          user_agent: navigator.userAgent,
          referrer: document.referrer || 'direct',
          session_id: sessionId
        });
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    trackPageView();
  }, []);

  // Check if user is logged in and redirect to Dashboard
  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        await User.me();
        // If user is logged in, redirect to Dashboard
        window.location.href = createPageUrl('Dashboard');
      } catch (error) {
        // User not logged in, stay on Home page
        // console.error("User not logged in or error checking user:", error); 
      }
    };
    checkAndRedirect();
  }, []);

  const openAuthModal = (mode = 'login') => {
    base44.auth.redirectToLogin(createPageUrl('Dashboard'));
  }

  return (
    <div className="bg-white" dir="rtl">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center gap-3">
                        <img 
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68556286ca6709c560f1520f/0ee16e649_logo.png" 
                            alt="BARTER4U Logo" 
                            className="w-10 h-10 md:w-12 md:h-12 object-contain cursor-pointer"
                            onClick={() => window.location.href = createPageUrl("Home")}
                        />
                        <div className="hidden sm:block">
                            <h1 className="text-lg md:text-xl font-bold gradient-text">BARTER4U</h1>
                            <p className="text-xs text-gray-500">Give Value, Get Value</p>
                        </div>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <NavLink sectionId="hero-section">ראשי</NavLink>
                        <NavLink sectionId="about-us">מי אנחנו</NavLink>
                        <NavLink sectionId="how-it-works">המערכת שלנו</NavLink>
                        <Link to={createPageUrl("Blog")} className="text-gray-600 hover:text-orange-500 transition-colors duration-300 font-medium">בלוג</Link>
                    </nav>
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="outline" 
                            className="text-orange-500 border-orange-500 hover:bg-orange-50" 
                            onClick={() => openAuthModal('login')}
                        >
                            התחברות
                        </Button>
                        <Button 
                            className="bg-gradient-to-r from-orange-500 to-teal-500 text-white rounded-full" 
                            onClick={() => openAuthModal('register')}
                        >
                            הרשמה
                        </Button>
                    </div>
                </div>
            </div>
        </header>

      {/* Hero Section - Mobile Optimized */}
      <section 
        className="relative text-white py-12 md:py-20 lg:py-32 overflow-hidden"
        id="hero-section"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-orange-500 opacity-90"></div>
        <div className="container mx-auto px-4 relative z-10">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
                <motion.div 
                    className="text-center md:text-right order-1 md:order-1"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 md:mb-4 leading-tight font-rubik">
                        BARTERIM - העולם החדש של החלפת שירותים 
                    </h1>
                    <div className="text-base md:text-lg text-white/95 mb-6 md:mb-8 space-y-2 md:space-y-3">
                        <p className="font-semibold">מחליפים ערך בערך</p>
                        <p>תן שירות. קבל שירות. בונים קהילה של שפע הדדי.</p>
                        <p className="text-sm md:text-base">
                            ברוכים הבאים ל-BARTERIM – הפלטפורמה שמחברת בין אנשים אמיתיים לשיתופי פעולה אמיתיים.<br/>
                            כאן לא צריך כסף – רק כישרון, זמן ורצון טוב.<br/>
                            הצטרף למהפכת הברטרים הדיגיטלית והתחל ליהנות ממה שיש לעולם להציע – פשוט כי גם לך יש מה להציע.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center md:justify-start">
                        <Button 
                            size="lg" 
                            className="bg-white text-orange-500 hover:bg-orange-50 text-base md:text-lg font-bold py-3 px-6 md:px-8 rounded-full shadow-xl transform hover:scale-105 transition-transform"
                            onClick={openAuthModal}
                        >
                            התחל להחליף בחינם
                        </Button>
                    </div>
                </motion.div>
                <div className="flex justify-center items-center h-[500px] md:h-96 order-2 md:order-2">
                    <AnimatedSwipeCards />
                </div>
            </div>
        </div>
      </section>

      {/* Features Section - Mobile Optimized */}
      <motion.section 
        className="py-12 md:py-20 bg-gray-50" 
        dir="rtl" 
        id="about"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            למה BARTERIM?
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FeatureCard icon={PiggyBank} title="חסכון בכסף" description="קבלו שירותים ומוצרים שאתם צריכים מבלי להוציא שקל אחד מהכיס." />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FeatureCard icon={BrainCircuit} title="ניצול כישרונות" description="הפכו את הידע והכישורים שלכם למטבע בעל ערך ותקבלו תמורה הוגנת." />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FeatureCard icon={Users} title="בניית קהילה" description="התחברו לאנשים בעלי תחומי עניין דומים ובנו רשת קשרים חברתית ומקצועית." />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FeatureCard icon={TrendingUp} title="קידום עסקי" description="לאחר ברטר מוצלח השגתם לקוח קבוע. המערכת מאפשרת קידום עסקי משמעותי ליכולות שלכם." />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* How it works - Mobile Optimized */}
      <motion.section 
        className="py-12 md:py-20" 
        dir="rtl" 
        id="how-it-works"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
      >
          <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                  <motion.div 
                    className="space-y-6 md:space-y-8"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                  >
                      <h2 className="text-2xl md:text-3xl font-bold mb-4">פשוט, מהיר וחכם</h2>
                      <StepCard number="1" title="צרו פרופיל" description="הציגו את הכישורים, המוצרים והשירותים שאתם מציעים, וספרו מה אתם מחפשים בתמורה." />
                      <StepCard number="2" title="מצאו התאמות" description="החליקו בין פרופילים רלוונטיים באזורכם ומצאו את הברטר המושלם עבורכם." />
                      <StepCard number="3" title="שוחחו וסגרו" description="השתמשו בצ'אט הפנימי כדי לתאם את כל פרטי ההחלפה בצורה בטוחה ונוחה." />
                      <StepCard number="4" title="החליפו ודרגו" description="בצעו את העסקה ודרגו את החוויה כדי לשמור על קהילה אמינה ואיכותית." />
                  </motion.div>
                  <motion.div 
                    className="hidden md:block"
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                  >
                      <img src="https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=2070&auto=format&fit=crop" alt="How it works" className="rounded-2xl shadow-2xl"/>
                  </motion.div>
              </div>
          </div>
      </motion.section>

      {/* About Us Section - Mobile Optimized */}
      <motion.section 
        className="py-12 md:py-20 bg-teal-50" 
        dir="rtl" 
        id="about-us"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
      >
          <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                  <motion.div 
                    className="grid grid-cols-2 gap-3 md:gap-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                  >
                      <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" alt="Community" className="rounded-2xl shadow-lg aspect-square object-cover"/>
                      <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop" alt="Collaboration" className="rounded-2xl shadow-lg aspect-square object-cover mt-4 md:mt-8"/>
                  </motion.div>
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                  >
                      <h2 className="text-2xl md:text-3xl font-bold mb-4">הסיפור שלנו</h2>
                      <p className="text-gray-700 text-sm md:text-base">
                          BARTERIM נולד מתוך אמונה פשוטה: לכל אחד מאיתנו יש ערך ייחודי להציע. בעולם שבו הכל נמדד בכסף, רצינו ליצור מרחב שבו כישרון, זמן ורצון טוב הם המטבע האמיתי. אנחנו מאמינים בכוחה של קהילה, בשיתוף פעולה ובכלכלה מעגלית שבה כולנו יכולים לצמוח יחד.
                      </p>
                      <p className="text-gray-700 text-sm md:text-base">
                          המשימה שלנו היא לחבר בין אנשים, לאפשר החלפות הוגנות וליצור הזדמנויות חדשות לכולם – מעצמאים בתחילת דרכם, דרך בעלי עסקים ותיקים ועד לאנשים פרטיים עם תחביבים וכישורים.
                      </p>
                  </motion.div>
              </div>
          </div>
      </motion.section>
      
      {/* Testimonials - Mobile Optimized */}
      <motion.section 
        className="py-12 md:py-20 bg-gray-50" 
        dir="rtl"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            מה משתמשים אומרים
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { quote: "החלפתי שיעור גיטרה בעיצוב לוגו לעסק שלי דרך BARTERIM. חוויה מדהימה וחסכתי מאות שקלים!", name: "דניאל לוי", service: "קיבל עיצוב לוגו", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop" },
              { quote: "מצאתי מישהי שתעזור לי עם הגינה בתמורה לכמה צנצנות ריבה ביתית. כיף גדול!", name: "יעל כהן", service: "קיבלה עזרה בגינה", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop" },
              { quote: "הפלטפורמה נוחה וקלה לשימוש. הכרתי אנשים מקסימים ומוכשרים מהאזור שלי.", name: "אמיר חסן", service: "החליף תיקון מחשב", image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&h=200&auto=format&fit=crop" }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <TestimonialCard {...testimonial} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <FaqSection />

      {/* Contact Section - Mobile Optimized */}
      <motion.section 
        className="py-12 md:py-20" 
        dir="rtl"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
      >
          <div className="container mx-auto px-4">
              <motion.div 
                className="text-center mb-8 md:mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                  <Mail className="w-10 h-10 md:w-12 md:h-12 mx-auto text-teal-500 mb-4"/>
                  <h2 className="text-2xl md:text-3xl font-bold">יש לכם שאלה?</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto mt-2 text-sm md:text-base">
                      נשמח לשמוע מכם. מלאו את הטופס וניצור קשר בהקדם.
                  </p>
              </motion.div>
              <div className="max-w-3xl mx-auto">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="glass-card p-4 md:p-6 lg:p-10">
                        <ContactForm />
                    </Card>
                  </motion.div>
              </div>
          </div>
      </motion.section>

      {/* Final CTA - Mobile Optimized */}
      <motion.section 
        className="py-12 md:py-20 text-center bg-gray-50" 
        dir="rtl"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-2xl md:text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            מוכנים להתחיל להחליף?
          </motion.h2>
          <motion.p 
            className="text-gray-600 max-w-2xl mx-auto mb-6 md:mb-8 text-sm md:text-base"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            הצטרפו היום לקהילת הברטרים של ישראל והתחילו ליהנות מכלכלה חברתית, חסכונית וחכמה.
          </motion.p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-orange-500 to-teal-500 hover:from-orange-600 hover:to-teal-600 text-white text-base md:text-lg font-bold py-3 px-6 md:px-8 rounded-full shadow-xl transform hover:scale-105 transition-transform"
              onClick={openAuthModal}
            >
              פתח חשבון חינם
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer - Mobile Optimized */}
      <footer className="bg-gray-800 text-white py-8 md:py-10" dir="rtl">
        <div className="container mx-auto px-4 text-center">
          <motion.p 
            className="font-bold text-lg md:text-xl mb-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            BARTERIM
          </motion.p>
          <motion.div 
            className="flex justify-center gap-4 md:gap-6 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.a 
              href="https://www.facebook.com/profile.php?id=61578175921537" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <Facebook className="w-5 h-5 md:w-6 md:h-6" />
            </motion.a>
            <motion.a 
              href="https://www.instagram.com/barter4u_official" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <Instagram className="w-5 h-5 md:w-6 md:h-6" />
            </motion.a>
          </motion.div>
          <motion.div 
            className="flex flex-wrap justify-center gap-3 md:gap-4 mb-4 text-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
              <Link to={createPageUrl("TermsOfService")} className="text-gray-400 hover:text-white transition-colors">תנאי שימוש</Link>
              <Link to={createPageUrl("PrivacyPolicy")} className="text-gray-400 hover:text-white transition-colors">מדיניות פרטיות</Link>
              <Link to={createPageUrl("AccessibilityStatement")} className="text-gray-400 hover:text-white transition-colors">הצהרת נגישות</Link>
          </motion.div>
          <motion.p 
            className="text-gray-500 text-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            &copy; {new Date().getFullYear()} BARTERIM. כל הזכויות שמורות.
          </motion.p>
        </div>
      </footer>


    </div>
  );
}