import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Send, Pencil, Trash2, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmailCampaignManager({ campaigns, leads, onUpdate }) {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    campaign_name: '',
    subject: '',
    body: '',
    status: 'draft'
  });

  const handleEdit = (campaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      campaign_name: campaign.campaign_name,
      subject: campaign.subject,
      body: campaign.body,
      status: campaign.status
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (selectedCampaign) {
        await base44.entities.EmailCampaign.update(selectedCampaign.id, formData);
      } else {
        await base44.entities.EmailCampaign.create(formData);
      }
      setIsDialogOpen(false);
      setSelectedCampaign(null);
      setFormData({
        campaign_name: '',
        subject: '',
        body: '',
        status: 'draft'
      });
      onUpdate();
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert('שגיאה בשמירת הקמפיין');
    }
  };

  const handleSendCampaign = async (campaign) => {
    if (!confirm(`האם אתה בטוח שברצונך לשלוח את הקמפיין "${campaign.campaign_name}" ל-${leads.length} לידים?`)) {
      return;
    }

    setIsSending(true);
    try {
      let sentCount = 0;
      for (const lead of leads) {
        try {
          await base44.integrations.Core.SendEmail({
            from_name: 'Barter4U',
            to: lead.email,
            subject: campaign.subject,
            body: campaign.body
          });
          sentCount++;
        } catch (error) {
          console.error(`Failed to send to ${lead.email}:`, error);
        }
      }

      await base44.entities.EmailCampaign.update(campaign.id, {
        status: 'sent',
        sent_count: sentCount
      });

      alert(`הקמפיין נשלח בהצלחה ל-${sentCount} נמענים!`);
      onUpdate();
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('שגיאה בשליחת הקמפיין');
    }
    setIsSending(false);
  };

  const handleDelete = async (id) => {
    if (confirm('האם אתה בטוח שברצונך למחוק קמפיין זה?')) {
      try {
        await base44.entities.EmailCampaign.delete(id);
        onUpdate();
      } catch (error) {
        console.error('Error deleting campaign:', error);
        alert('שגיאה במחיקת הקמפיין');
      }
    }
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-green-100 text-green-800'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">קמפיינים פעילים</h3>
          <p className="text-sm text-gray-600">סך הכל {leads.length} לידים זמינים לשליחה</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setSelectedCampaign(null);
                setFormData({
                  campaign_name: '',
                  subject: '',
                  body: '',
                  status: 'draft'
                });
              }}
              className="gap-2 bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              קמפיין חדש
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>{selectedCampaign ? 'עריכת קמפיין' : 'קמפיין חדש'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">שם הקמפיין*</label>
                <Input
                  value={formData.campaign_name}
                  onChange={(e) => setFormData({...formData, campaign_name: e.target.value})}
                  placeholder="למשל: קמפיין פברואר 2026"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">נושא המייל*</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="נושא המייל שהלקוחות יראו"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">תוכן המייל*</label>
                <Textarea
                  value={formData.body}
                  onChange={(e) => setFormData({...formData, body: e.target.value})}
                  placeholder="תוכן המייל..."
                  rows={12}
                  className="font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  טיפ: השתמש ב-HTML לעיצוב מתקדם
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">סטטוס</label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">טיוטה</SelectItem>
                    <SelectItem value="scheduled">מתוכנן</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>ביטול</Button>
              <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600">שמור</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {campaigns.map((campaign) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{campaign.campaign_name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{campaign.subject}</p>
                  </div>
                  <Badge className={statusColors[campaign.status]}>
                    {campaign.status === 'draft' ? 'טיוטה' :
                     campaign.status === 'scheduled' ? 'מתוכנן' : 'נשלח'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {campaign.body}
                </p>
                {campaign.status === 'sent' && (
                  <div className="bg-green-50 border border-green-200 rounded p-2 mb-3">
                    <p className="text-sm text-green-700">
                      <Mail className="w-4 h-4 inline ml-1" />
                      נשלח ל-{campaign.sent_count} נמענים
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  {campaign.status !== 'sent' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleSendCampaign(campaign)}
                      disabled={isSending}
                      className="gap-1 bg-green-500 hover:bg-green-600"
                    >
                      <Send className="w-3 h-3" />
                      {isSending ? 'שולח...' : 'שלח עכשיו'}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleEdit(campaign)}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDelete(campaign.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">אין עדיין קמפיינים. צור את הקמפיין הראשון שלך!</p>
        </div>
      )}
    </div>
  );
}