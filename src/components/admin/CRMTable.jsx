import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Phone, Mail as MailIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CRMTable({ leads, onUpdate, contactSubmissions }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    status: 'new',
    source: 'manual',
    notes: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    qualified: 'bg-purple-100 text-purple-800',
    converted: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  };

  const handleEdit = (lead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      message: lead.message || '',
      status: lead.status,
      source: lead.source,
      notes: lead.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (selectedLead) {
        await base44.entities.Lead.update(selectedLead.id, formData);
      } else {
        await base44.entities.Lead.create(formData);
      }
      setIsDialogOpen(false);
      setSelectedLead(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        status: 'new',
        source: 'manual',
        notes: ''
      });
      onUpdate();
    } catch (error) {
      console.error('Error saving lead:', error);
      alert('שגיאה בשמירת הליד');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('האם אתה בטוח שברצונך למחוק ליד זה?')) {
      try {
        await base44.entities.Lead.delete(id);
        onUpdate();
      } catch (error) {
        console.error('Error deleting lead:', error);
        alert('שגיאה במחיקת הליד');
      }
    }
  };

  const convertContactToLead = async (contact) => {
    try {
      await base44.entities.Lead.create({
        name: contact.name,
        email: contact.email,
        message: contact.message,
        status: 'new',
        source: 'contact_form',
        notes: `הומר מטופס יצירת קשר בתאריך ${new Date(contact.created_date).toLocaleDateString('he-IL')}`
      });
      await base44.entities.ContactSubmission.update(contact.id, { status: 'resolved' });
      onUpdate();
      alert('הפניה הומרה בהצלחה לליד!');
    } catch (error) {
      console.error('Error converting contact:', error);
      alert('שגיאה בהמרת הפניה');
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const newContactSubmissions = contactSubmissions.filter(c => c.status === 'new');

  return (
    <div className="space-y-6">
      {/* Contact Submissions Alert */}
      {newContactSubmissions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <h3 className="font-bold text-blue-900 mb-2">
            פניות חדשות ליצירת קשר ({newContactSubmissions.length})
          </h3>
          <div className="space-y-2">
            {newContactSubmissions.slice(0, 3).map(contact => (
              <div key={contact.id} className="flex justify-between items-center bg-white p-3 rounded">
                <div>
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-gray-600">{contact.email}</p>
                  <p className="text-sm text-gray-500">{contact.message.substring(0, 50)}...</p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => convertContactToLead(contact)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  המר לליד
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="flex justify-between items-center">
        <Input
          placeholder="חיפוש לפי שם או אימייל..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setSelectedLead(null);
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  message: '',
                  status: 'new',
                  source: 'manual',
                  notes: ''
                });
              }}
              className="gap-2 bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="w-4 h-4" />
              ליד חדש
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>{selectedLead ? 'עריכת ליד' : 'ליד חדש'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">שם מלא*</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="שם מלא"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">אימייל*</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="example@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">טלפון</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="050-1234567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">סטטוס</label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">חדש</SelectItem>
                    <SelectItem value="contacted">צורך קשר</SelectItem>
                    <SelectItem value="qualified">מוסמך</SelectItem>
                    <SelectItem value="converted">הומר</SelectItem>
                    <SelectItem value="closed">סגור</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">הודעה</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="הודעה מהלקוח..."
                  rows={3}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">הערות פנימיות</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="הערות לצוות..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>ביטול</Button>
              <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">שמור</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {filteredLeads.map((lead) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="border rounded-xl p-4 bg-white hover:shadow-md transition-shadow"
          >
            <div className="flex flex-wrap justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900">{lead.name}</p>
                  <Badge className={statusColors[lead.status]}>
                    {lead.status === 'new' ? 'חדש' : lead.status === 'contacted' ? 'צורך קשר' : lead.status === 'qualified' ? 'מוסמך' : lead.status === 'converted' ? 'הומר' : 'סגור'}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {lead.source === 'landing_page' ? 'דף נחיתה' : lead.source === 'contact_form' ? 'טופס יצירת קשר' : 'ידני'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 mt-2 text-sm">
                  <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                    <MailIcon className="w-3 h-3" />{lead.email}
                  </a>
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                      <Phone className="w-3 h-3" />{lead.phone}
                    </a>
                  )}
                  <span className="text-gray-400">{new Date(lead.created_date).toLocaleDateString('he-IL')}</span>
                </div>
                {lead.message && (
                  <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2 border">{lead.message}</p>
                )}
                {lead.notes && (
                  <p className="mt-1 text-xs text-gray-500 italic">📝 {lead.notes}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(lead)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(lead.id)} className="text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
        {filteredLeads.length === 0 && (
          <div className="text-center py-12 text-gray-400">אין לידים להצגה</div>
        )}
      </div>
    </div>
  );
}