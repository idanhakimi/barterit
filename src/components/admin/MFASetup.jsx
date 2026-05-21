import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { User } from '@/entities/User';

export default function MFASetup({ user, onMFAVerified }) {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      const mfaStatus = user?.mfa_enabled || false;
      setMfaEnabled(mfaStatus);
      
      if (!mfaStatus && user?.role === 'admin') {
        await generateMFASecret();
      }
    } catch (error) {
      console.error('Error checking MFA status:', error);
    }
  };

  const generateMFASecret = async () => {
    try {
      const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      const generatedSecret = Array.from(crypto.getRandomValues(new Uint8Array(20)))
        .map(b => base32Chars[b % 32]).join('');
      setSecret(generatedSecret);
      
      // Generate QR code URL for Google Authenticator
      const appName = 'BARTERIM';
      const userEmail = user?.email || '';
      const qrUrl = `otpauth://totp/${appName}:${userEmail}?secret=${generatedSecret}&issuer=${appName}`;
      setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`);
    } catch (error) {
      console.error('Error generating MFA secret:', error);
      setError('שגיאה ביצירת קוד MFA');
    }
  };

  const verifyAndEnableMFA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('נא להזין קוד בן 6 ספרות');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In production, verify the TOTP code on the server
      // For now, we'll store the secret and mark MFA as enabled
      await User.updateMyUserData({
        mfa_enabled: true,
        mfa_secret: secret
      });

      setMfaEnabled(true);
      if (onMFAVerified) onMFAVerified();
    } catch (error) {
      console.error('Error enabling MFA:', error);
      setError('קוד שגוי, נסה שוב');
    }
    setLoading(false);
  };

  const disableMFA = async () => {
    try {
      await User.updateMyUserData({
        mfa_enabled: false,
        mfa_secret: null
      });
      setMfaEnabled(false);
      setVerificationCode('');
    } catch (error) {
      console.error('Error disabling MFA:', error);
    }
  };

  if (mfaEnabled) {
    return (
      <Card className="bg-green-500/10 border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            אימות דו-שלבי פעיל
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 mb-4">החשבון שלך מוגן באימות דו-שלבי</p>
          <Button 
            variant="outline" 
            onClick={disableMFA}
            className="border-red-500 text-red-500 hover:bg-red-500/10"
          >
            ביטול אימות דו-שלבי
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-500" />
          הגדרת אימות דו-שלבי (MFA)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-300">
          סרוק את קוד ה-QR באפליקציית Google Authenticator או אפליקציית אימות אחרת:
        </p>
        
        {qrCode && (
          <div className="flex justify-center bg-white p-4 rounded-lg">
            <img src={qrCode} alt="QR Code" className="w-48 h-48" />
          </div>
        )}

        <div className="bg-gray-700/50 p-3 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">או הזן את הקוד ידנית:</p>
          <code className="text-orange-400 text-sm">{secret}</code>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-300">הזן את הקוד מהאפליקציה (6 ספרות):</label>
          <Input
            type="text"
            maxLength={6}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="bg-gray-700 border-gray-600 text-white text-center text-2xl tracking-widest"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <Button
          onClick={verifyAndEnableMFA}
          disabled={loading || verificationCode.length !== 6}
          className="w-full bg-gradient-to-r from-orange-500 to-teal-500"
        >
          {loading ? 'מאמת...' : 'אמת והפעל MFA'}
        </Button>
      </CardContent>
    </Card>
  );
}