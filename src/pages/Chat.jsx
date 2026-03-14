import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, ArrowRight, MoreVertical, Shield, Ban } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea";

export default function Chat() {
  const [currentUser, setCurrentUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
        try {
            const user = await base44.auth.me();
            loadData(user);
        } catch (error) {
            window.location.href = createPageUrl('Home');
        }
    };
    checkAuthAndLoad();
  }, []);

  useEffect(() => {
    if (!selectedMatch) return;

    // Load messages for this match
    const fetchMessages = async () => {
      const msgs = await base44.entities.Message.filter(
        { match_id: selectedMatch.id },
        "created_date"
      );
      setMessages(msgs);
    };
    fetchMessages();

    // Real-time subscription for new messages
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.data?.match_id === selectedMatch.id && event.type === 'create') {
        setMessages(prev => {
          if (prev.find(m => m.id === event.id)) return prev;
          return [...prev, event.data];
        });
      }
    });

    return () => unsubscribe();
  }, [selectedMatch?.id]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadData = async (user) => {
    setIsLoading(true);
    setCurrentUser(user);
    try {
      const [myBlockedUsers, usersWhoBlockedMe, userMatches1, userMatches2, allUsers] = await Promise.all([
        base44.entities.Block.filter({ blocker_id: user.id }),
        base44.entities.Block.filter({ blocked_id: user.id }),
        base44.entities.Match.filter({ user1_id: user.id }),
        base44.entities.Match.filter({ user2_id: user.id }),
        base44.entities.User.list(),
      ]);

      const blockedIds = new Set([
        ...myBlockedUsers.map(b => b.blocked_id),
        ...usersWhoBlockedMe.map(b => b.blocker_id)
      ]);

      // Only show MATCHED (mutual) conversations
      let allMatches = [...userMatches1, ...userMatches2];
      allMatches = allMatches.filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i);
      allMatches = allMatches.filter(match => {
        if (match.status !== 'matched') return false;
        const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
        return !blockedIds.has(otherUserId);
      });

      const userMap = {};
      allUsers.forEach(u => { userMap[u.id] = u; });

      const matchesWithUsers = allMatches.map((match) => {
        const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
        return { ...match, otherUser: userMap[otherUserId] || null };
      }).filter(m => m.otherUser !== null);

      setMatches(matchesWithUsers);
    } catch (error) {
      console.error("Error loading matches:", error);
    }
    setIsLoading(false);
  };



  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMatch || !currentUser || isSending) return;
    
    setIsSending(true);
    try {
      const message = await Message.create({
        match_id: selectedMatch.id,
        sender_id: currentUser.id,
        content: newMessage.trim(),
        message_type: "text"
      });
      
      setMessages(prev => [...prev, message]);
      setNewMessage("");

      // Notify the other user
      const otherUserId = selectedMatch.otherUser?.id;
      if (otherUserId) {
        base44.entities.Notification.create({
          user_id: otherUserId,
          type: 'new_message',
          title: `💬 הודעה חדשה מ-${currentUser.full_name}`,
          body: newMessage.trim().substring(0, 80),
          from_user_id: currentUser.id,
          related_id: selectedMatch.id,
        });
      }
      
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setIsSending(false);
  };

  const handleBlockUser = async () => {
    if (!currentUser || !selectedMatch) return;
    const otherUserId = selectedMatch.otherUser.id;
    try {
        await Block.create({
            blocker_id: currentUser.id,
            blocked_id: otherUserId
        });
        setShowBlockDialog(false);
        setSelectedMatch(null);
        // Reload data with the current user to reflect the block
        await loadData(currentUser); 
    } catch(error) {
        console.error("Failed to block user:", error);
    }
  };

  const handleReportUser = async () => {
    if (!currentUser || !selectedMatch || !reportReason.trim()) return;
    const otherUserId = selectedMatch.otherUser.id;
    try {
        await Report.create({
            reporter_id: currentUser.id,
            reported_id: otherUserId,
            reason: reportReason,
            match_id: selectedMatch.id
        });
        setReportReason("");
        setShowReportDialog(false);
    } catch (error) {
        console.error("Failed to report user:", error);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-teal-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-300">טוען שיחות...</p>
        </div>
      </div>
    );
  }

  // This block should ideally not be reached if `checkAuthAndLoad` redirects.
  // Keeping it as a fallback or if there's a slight delay in redirect.
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 px-4">
        <Card className="glass-card p-8 text-center max-w-md">
          <MessageCircle className="w-16 h-16 text-teal-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-4">אין עדיין שיחות</h2>
          <p className="text-gray-600">
            כשתתאימו עם מישהו, תוכלו להתחיל לשוחח כאן
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
      <div className="max-w-4xl mx-auto">
        {!selectedMatch ? (
          /* Matches List */
          <div className="px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-100 mb-6">השיחות שלי</h1>
            
            {matches.length === 0 ? (
              <Card className="glass-card p-8 text-center">
                <MessageCircle className="w-16 h-16 text-teal-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 text-gray-100">אין עדיין התאמות</h3>
                <p className="text-gray-400">
                  בואו נמצא לכם אנשים מעניינים להחלפת שירותים!
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {matches.map((match) => (
                  <motion.div
                    key={match.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className="glass-card cursor-pointer hover:shadow-lg transition-all duration-200"
                      onClick={() => setSelectedMatch(match)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-orange-200 to-teal-200 rounded-full flex items-center justify-center">
                            {match.otherUser?.profile_image ? (
                              <img 
                                src={match.otherUser.profile_image} 
                                alt={match.otherUser.full_name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <span className="font-semibold text-gray-600">
                                {match.otherUser?.full_name?.charAt(0) || "?"}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-semibold">{match.otherUser?.full_name}</h3>
                            <p className="text-sm text-gray-500">
                              {match.user1_liked && match.user2_liked 
                                ? `התאמה הדדית` 
                                : match.user1_id === currentUser?.id && match.user1_liked
                                ? `שלחת בקשת ברטר`
                                : `קיבלת בקשת ברטר 💌`
                              }
                            </p>
                          </div>
                          
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Chat Interface */
          <div className="flex flex-col h-screen">
            {/* Chat Header */}
            <div className="glass-card border-0 border-b px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedMatch(null)}
                    className="rounded-full"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                  
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-200 to-teal-200 rounded-full flex items-center justify-center">
                    {selectedMatch.otherUser?.profile_image ? (
                      <img 
                        src={selectedMatch.otherUser.profile_image} 
                        alt={selectedMatch.otherUser.full_name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="font-semibold text-gray-600">
                        {selectedMatch.otherUser?.full_name?.charAt(0) || "?"}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h2 className="font-semibold">{selectedMatch.otherUser?.full_name}</h2>
                    <p className="text-sm text-gray-500">{selectedMatch.otherUser?.location}</p>
                  </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="w-5 h-5"/></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => setShowReportDialog(true)} className="text-yellow-600">
                            <Shield className="w-4 h-4 ml-2" />
                            דווח על משתמש
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setShowBlockDialog(true)} className="text-red-600">
                            <Ban className="w-4 h-4 ml-2" />
                            חסום משתמש
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender_id === currentUser.id ? 'justify-end' : message.sender_id === 'system' ? 'justify-center' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.sender_id === currentUser.id
                          ? 'bg-gradient-to-r from-orange-500 to-teal-500 text-white'
                          : message.sender_id === 'system'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 text-center'
                          : 'bg-gray-700/80 text-gray-100 border border-gray-600'
                      }`}
                    >
                      <p>{message.content}</p>
                      {message.sender_id !== 'system' && (
                        <p className={`text-xs mt-1 ${
                          message.sender_id === currentUser.id ? 'text-white/70' : 'text-gray-400'
                        }`}>
                          {format(new Date(message.created_date), "HH:mm")}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="glass-card border-0 border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="כתבו הודעה..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="bg-gradient-to-r from-orange-500 to-teal-500 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Block Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>האם לחסום את {selectedMatch?.otherUser?.full_name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                      לאחר החסימה, לא תוכלו לראות אחד את השני באפליקציה ולא תוכלו לתקשר. הפעולה אינה הפיכה.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>ביטול</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBlockUser} className="bg-red-600 hover:bg-red-700">חסום</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      {/* Report Dialog */}
      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>דיווח על {selectedMatch?.otherUser?.full_name}</AlertDialogTitle>
                  <AlertDialogDescription>
                      אנא פרט את סיבת הדיווח. הדיווח ייבדק על ידי הצוות שלנו.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <Textarea 
                  placeholder="לדוגמה: התנהגות לא הולמת, ספאם..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
              />
              <AlertDialogFooter>
                  <AlertDialogCancel>ביטול</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReportUser} disabled={!reportReason.trim()}>שלח דיווח</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}