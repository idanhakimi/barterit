import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { User } from "@/entities/User";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Plus, Check, X, CalendarCheck, Bell } from "lucide-react";
import { format, isPast, isToday, addHours } from "date-fns";
import { he } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_LABELS = {
  pending: { label: "ממתין לאישור", color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "מאושר", color: "bg-green-100 text-green-700" },
  cancelled: { label: "בוטל", color: "bg-red-100 text-red-700" },
  completed: { label: "הושלם", color: "bg-blue-100 text-blue-700" },
};

export default function Schedule() {
  const [currentUser, setCurrentUser] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [form, setForm] = useState({
    match_id: "",
    title: "",
    proposed_date: "",
    proposed_time: "",
    location_text: "",
    organizer_service: "",
    participant_service: "",
    notes: "",
  });

  useEffect(() => {
    const init = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        await loadData(user);
      } catch {
        window.location.href = createPageUrl("Home");
      }
    };
    init();
  }, []);

  const loadData = async (user) => {
    setIsLoading(true);
    try {
      const [asMeetings1, asMeetings2, myMatches1, myMatches2] = await Promise.all([
        base44.entities.BarterMeeting.filter({ organizer_id: user.id }, "-proposed_date"),
        base44.entities.BarterMeeting.filter({ participant_id: user.id }, "-proposed_date"),
        base44.entities.Match.filter({ user1_id: user.id, status: "matched" }),
        base44.entities.Match.filter({ user2_id: user.id, status: "matched" }),
      ]);

      const allMeetings = [...asMeetings1, ...asMeetings2];
      const allMatches = [...myMatches1, ...myMatches2];

      // Enrich meetings with user data
      const enriched = await Promise.all(allMeetings.map(async (m) => {
        const otherId = m.organizer_id === user.id ? m.participant_id : m.organizer_id;
        const otherUsers = await base44.entities.User.filter({ id: otherId });
        return { ...m, otherUser: otherUsers[0] };
      }));

      // Enrich matches with other user
      const enrichedMatches = await Promise.all(allMatches.map(async (m) => {
        const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id;
        const otherUsers = await base44.entities.User.filter({ id: otherId });
        return { ...m, otherUser: otherUsers[0] };
      }));

      setMeetings(enriched);
      setMatches(enrichedMatches);
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.match_id || !form.proposed_date || !form.proposed_time) {
      alert("אנא מלאו תאריך, שעה וסיאוט.");
      return;
    }
    const selectedMatch = matches.find(m => m.id === form.match_id);
    if (!selectedMatch) return;

    const dateTime = new Date(`${form.proposed_date}T${form.proposed_time}`).toISOString();
    const participantId = selectedMatch.user1_id === currentUser.id ? selectedMatch.user2_id : selectedMatch.user1_id;

    await base44.entities.BarterMeeting.create({
      match_id: form.match_id,
      organizer_id: currentUser.id,
      participant_id: participantId,
      title: form.title || `פגישת ברטר עם ${selectedMatch.otherUser?.full_name}`,
      proposed_date: dateTime,
      location_text: form.location_text,
      organizer_service: form.organizer_service,
      participant_service: form.participant_service,
      notes: form.notes,
      status: "pending",
    });

    // Create notification for the other user
    await base44.entities.Notification.create({
      user_id: participantId,
      type: "meeting_confirmed",
      title: "הצעת פגישה חדשה",
      body: `${currentUser.full_name} מציע/ה פגישת ברטר ב-${format(new Date(dateTime), "d/M HH:mm")}`,
      from_user_id: currentUser.id,
      related_id: form.match_id,
    });

    setShowForm(false);
    setForm({ match_id: "", title: "", proposed_date: "", proposed_time: "", location_text: "", organizer_service: "", participant_service: "", notes: "" });
    await loadData(currentUser);
  };

  const handleUpdateStatus = async (meetingId, newStatus) => {
    await base44.entities.BarterMeeting.update(meetingId, { status: newStatus });
    setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, status: newStatus } : m));

    // Notify organizer if participant confirms/cancels
    const meeting = meetings.find(m => m.id === meetingId);
    if (meeting && meeting.organizer_id !== currentUser.id) {
      await base44.entities.Notification.create({
        user_id: meeting.organizer_id,
        type: newStatus === "confirmed" ? "meeting_confirmed" : "meeting_cancelled",
        title: newStatus === "confirmed" ? "הפגישה אושרה!" : "הפגישה בוטלה",
        body: `${currentUser.full_name} ${newStatus === "confirmed" ? "אישר/ה" : "ביטל/ה"} את הפגישה`,
        from_user_id: currentUser.id,
        related_id: meeting.match_id,
      });
    }
  };

  const now = new Date();
  const upcoming = meetings.filter(m => !isPast(new Date(m.proposed_date)) || m.status === "confirmed");
  const past = meetings.filter(m => isPast(new Date(m.proposed_date)) && m.status !== "confirmed");

  const displayedMeetings = activeTab === "upcoming" ? upcoming : past;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <CalendarCheck className="w-16 h-16 text-orange-400 animate-pulse mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">יומן פגישות</h1>
            <p className="text-sm text-gray-500">תאמו פגישות ברטר עם ההתאמות שלכם</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-orange-500 to-teal-500 text-white"
          >
            <Plus className="w-4 h-4 ml-1" />
            פגישה חדשה
          </Button>
        </div>

        {/* New Meeting Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="glass-card border border-orange-200">
                <CardHeader>
                  <CardTitle className="text-lg">הצעת פגישה חדשה</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">בחרו שיחה / התאמה</label>
                    <Select value={form.match_id} onValueChange={(v) => setForm(p => ({ ...p, match_id: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="בחרו אדם..." />
                      </SelectTrigger>
                      <SelectContent>
                        {matches.map(m => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.otherUser?.full_name || "משתמש"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">כותרת (אופציונלי)</label>
                    <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="פגישת ברטר..." />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">תאריך</label>
                      <Input type="date" value={form.proposed_date} onChange={e => setForm(p => ({ ...p, proposed_date: e.target.value }))} min={new Date().toISOString().split("T")[0]} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">שעה</label>
                      <Input type="time" value={form.proposed_time} onChange={e => setForm(p => ({ ...p, proposed_time: e.target.value }))} />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">מיקום הפגישה</label>
                    <Input value={form.location_text} onChange={e => setForm(p => ({ ...p, location_text: e.target.value }))} placeholder="לדוגמה: בית קפה, זום, כתובת..." />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">השירות שלי</label>
                      <Input value={form.organizer_service} onChange={e => setForm(p => ({ ...p, organizer_service: e.target.value }))} placeholder="מה אני נותן..." />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">השירות שלהם</label>
                      <Input value={form.participant_service} onChange={e => setForm(p => ({ ...p, participant_service: e.target.value }))} placeholder="מה הם נותנים..." />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">הערות</label>
                    <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="פרטים נוספים..." rows={2} />
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleSubmit} className="bg-green-500 hover:bg-green-600 text-white flex-1">
                      <CalendarCheck className="w-4 h-4 ml-1" />
                      שלח הצעה
                    </Button>
                    <Button variant="outline" onClick={() => setShowForm(false)}>ביטול</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {["upcoming", "past"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab === "upcoming" ? `קרובות (${upcoming.length})` : `עבר (${past.length})`}
            </button>
          ))}
        </div>

        {/* Meetings List */}
        {displayedMeetings.length === 0 ? (
          <Card className="glass-card p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">אין פגישות {activeTab === "upcoming" ? "קרובות" : "עבר"}</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {displayedMeetings.map((meeting) => {
              const isOrganizer = meeting.organizer_id === currentUser.id;
              const meetingDate = new Date(meeting.proposed_date);
              const isTodayMeeting = isToday(meetingDate);
              const statusInfo = STATUS_LABELS[meeting.status];

              return (
                <motion.div key={meeting.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className={`glass-card ${isTodayMeeting ? "border-2 border-orange-400" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">{meeting.title || "פגישת ברטר"}</h3>
                          <p className="text-sm text-gray-500">עם {meeting.otherUser?.full_name}</p>
                        </div>
                        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-400" />
                          <span>{format(meetingDate, "EEEE, d MMMM yyyy", { locale: he })}</span>
                          {isTodayMeeting && <Badge className="bg-orange-100 text-orange-700 text-xs">היום!</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-teal-400" />
                          <span>{format(meetingDate, "HH:mm")}</span>
                        </div>
                        {meeting.location_text && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <span>{meeting.location_text}</span>
                          </div>
                        )}
                      </div>

                      {(meeting.organizer_service || meeting.participant_service) && (
                        <div className="flex gap-2 mb-3">
                          {meeting.organizer_service && <Badge className="bg-orange-100 text-orange-700 text-xs">נותן: {meeting.organizer_service}</Badge>}
                          {meeting.participant_service && <Badge className="bg-teal-100 text-teal-700 text-xs">מקבל: {meeting.participant_service}</Badge>}
                        </div>
                      )}

                      {meeting.notes && <p className="text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded">{meeting.notes}</p>}

                      {/* Actions */}
                      {!isOrganizer && meeting.status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdateStatus(meeting.id, "confirmed")} className="bg-green-500 hover:bg-green-600 text-white flex-1">
                            <Check className="w-4 h-4 ml-1" /> אשר
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(meeting.id, "cancelled")} className="text-red-500 border-red-200 flex-1">
                            <X className="w-4 h-4 ml-1" /> סרב
                          </Button>
                        </div>
                      )}
                      {meeting.status === "confirmed" && !isPast(meetingDate) && (
                        <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(meeting.id, "cancelled")} className="text-red-500 border-red-200 w-full">
                          <X className="w-4 h-4 ml-1" /> בטל פגישה
                        </Button>
                      )}
                      {meeting.status === "confirmed" && isPast(meetingDate) && isOrganizer && (
                        <Button size="sm" onClick={() => handleUpdateStatus(meeting.id, "completed")} className="bg-blue-500 hover:bg-blue-600 text-white w-full">
                          <Check className="w-4 h-4 ml-1" /> סמן כהושלם
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}