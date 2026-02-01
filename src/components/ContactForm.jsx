import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ContactSubmission } from '@/entities/ContactSubmission';
import { Loader2, CheckCircle, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactForm() {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
            setError('אנא מלאו את כל השדות');
            return;
        }

        setStatus('sending');
        setError('');
        
        try {
            await ContactSubmission.create({
                name: formData.name.trim(),
                email: formData.email.trim(),
                message: formData.message.trim(),
                status: 'new'
            });
            
            setStatus('success');
            setFormData({ name: '', email: '', message: '' });
        } catch (err) {
            setStatus('error');
            setError('אירעה שגיאה בשליחת ההודעה. אנא נסו שוב מאוחר יותר.');
            console.error('Failed to save contact submission:', err);
        }
    };

    if (status === 'success') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center p-6 md:p-8 bg-green-50 rounded-2xl"
            >
                <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl md:text-2xl font-bold mb-2">הפנייה נשלחה בהצלחה!</h3>
                <p className="text-gray-600 text-sm md:text-base">קיבלנו את הפנייה שלכם וניצור קשר בהקדם האפשרי.</p>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm md:text-base">שם מלא</Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="הכניסו את השם המלא שלכם"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="text-sm md:text-base"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm md:text-base">כתובת אימייל</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="text-sm md:text-base"
                        required
                    />
                </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="message" className="text-sm md:text-base">הודעה</Label>
                <Textarea
                    id="message"
                    placeholder="כתבו כאן את הודעתכם..."
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="min-h-[120px] md:min-h-[150px] text-sm md:text-base"
                    required
                />
            </div>
            
            {error && (
                <div className="text-red-500 text-sm md:text-base text-center bg-red-50 p-3 rounded-lg">
                    {error}
                </div>
            )}
            
            <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-teal-500 hover:from-orange-600 hover:to-teal-600 text-white py-3 md:py-4 text-sm md:text-base font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                disabled={status === 'sending'}
            >
                {status === 'sending' ? (
                    <>
                        <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                        שולח...
                    </>
                ) : (
                    <>
                        <Send className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                        שליחת הודעה
                    </>
                )}
            </Button>
        </form>
    );
}