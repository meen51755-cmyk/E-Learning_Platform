import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { validators, checkRateLimit } from "@/lib/sanitize";
import { MessageSquare, Star, ThumbsUp, Send, Search, Plus } from "lucide-react";

const discussions = [
  { id: "1", title: "วิธีเรียน React ให้เข้าใจเร็ว?", author: "สมชาย", replies: 12, likes: 24, time: "2 ชม.ก่อน" },
  { id: "2", title: "แนะนำคอร์ส Data Science สำหรับมือใหม่", author: "สุดา", replies: 8, likes: 15, time: "5 ชม.ก่อน" },
  { id: "3", title: "ปัญหา CSS Flexbox ช่วยดูหน่อยครับ", author: "วรากร", replies: 5, likes: 3, time: "1 วันก่อน" },
  { id: "4", title: "ใครเรียน Flutter แล้วบ้าง เป็นยังไง?", author: "นิชา", replies: 18, likes: 32, time: "2 วันก่อน" },
];

const reviews = [
  { id: "1", course: "Complete Web Development Bootcamp", author: "สมศักดิ์", rating: 5, text: "คอร์สดีมาก เนื้อหาครบ สอนเข้าใจง่าย", time: "1 วันก่อน" },
  { id: "2", course: "Data Science with Python", author: "สุดา", rating: 4, text: "เนื้อหาดี แต่อยากให้มีแบบฝึกหัดมากกว่านี้", time: "3 วันก่อน" },
  { id: "3", course: "UI/UX Design Masterclass", author: "ประยุทธ์", rating: 5, text: "สอน Figma ได้ดีมาก ใช้งานจริงได้เลย", time: "5 วันก่อน" },
];

const contacts = [
  { name: "อ.สมชาย ใจดี", msg: "ขอบคุณครับ ลองทำดูนะ", time: "2 นาที", online: true },
  { name: "ดร.วิชัย นักวิจัย", msg: "ส่งการบ้านมาแล้วครับ", time: "1 ชม.", online: false },
  { name: "สุดา ฉลาดดี", msg: "Module 3 ยากมากเลย", time: "3 ชม.", online: true },
];

const initMessages = [
  { from: "other", text: "สวัสดีครับ มีอะไรสงสัยไหมครับ?", time: "10:00" },
  { from: "me", text: "สวัสดีครับอาจารย์ มีคำถามเรื่อง React Hooks ครับ", time: "10:02" },
  { from: "other", text: "ได้เลยครับ ถามมาได้เลย", time: "10:03" },
  { from: "me", text: "useEffect กับ useLayoutEffect ต่างกันยังไงครับ?", time: "10:05" },
  { from: "other", text: "ขอบคุณครับ ลองทำดูนะ", time: "10:08" },
];

const Community = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"discussions" | "reviews" | "messages">("discussions");
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState(initMessages);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const displayName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "ผู้ใช้";
  const initials = profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "?";

  const filteredDiscussions = discussions.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!user) {
      toast({ title: "กรุณาเข้าสู่ระบบก่อน", variant: "destructive" });
      return;
    }

    // ✅ validate ข้อความ
    const msgCheck = validators.message(messageText);
    if (!msgCheck.ok) {
      toast({ title: msgCheck.error, variant: "destructive" });
      return;
    }

    // ✅ rate limit — ส่งได้ไม่เกิน 10 ข้อความ/นาที
    const rate = checkRateLimit(`message-${user.id}`, 10, 60000);
    if (!rate.allowed) {
      toast({ title: "ส่งข้อความถี่เกินไป กรุณารอสักครู่", variant: "destructive" });
      return;
    }

    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;
    setMessages((prev) => [...prev, { from: "me", text: msgCheck.value!, time }]);
    setMessageText("");
    // TODO: supabase.from('messages').insert({ sender_id: user.id, content: msgCheck.value })
  };

  const handleLike = (id: string) => {
    if (!user) {
      toast({ title: "กรุณาเข้าสู่ระบบก่อน", variant: "destructive" });
      return;
    }
    // ✅ rate limit — ไลก์ได้ไม่เกิน 20 ครั้ง/นาที
    const rate = checkRateLimit(`like-${user.id}`, 20, 60000);
    if (!rate.allowed) {
      toast({ title: "ไลก์ถี่เกินไป", variant: "destructive" });
      return;
    }
    setLikedPosts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleNewPost = () => {
    if (!user) {
      toast({ title: "กรุณาเข้าสู่ระบบก่อน", variant: "destructive" });
      return;
    }
    // ✅ rate limit — สร้างโพสต์ได้ไม่เกิน 3 ครั้ง/นาที
    const rate = checkRateLimit(`new-post-${user.id}`, 3, 60000);
    if (!rate.allowed) {
      toast({ title: "สร้างโพสต์ถี่เกินไป กรุณารอสักครู่", variant: "destructive" });
      return;
    }
    toast({ title: "ฟีเจอร์นี้กำลังพัฒนา" });
    // TODO: เปิด modal สร้างกระทู้ใหม่
  };

  const tabs = [
    { id: "discussions" as const, label: "กระทู้", icon: MessageSquare },
    { id: "reviews" as const, label: "รีวิวคอร์ส", icon: Star },
    { id: "messages" as const, label: "ข้อความ", icon: Send },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto container-padding py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">ชุมชน LearnHub</h1>
          <p className="text-muted-foreground mt-1">พูดคุย แลกเปลี่ยน และรีวิวคอร์ส</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* ── Discussions ─────────────────────────────────────── */}
        {activeTab === "discussions" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหากระทู้..."
                  className="pl-10 input-focus"
                />
              </div>
              <Button variant="hero" onClick={handleNewPost}>
                <Plus className="w-4 h-4" /> สร้างกระทู้ใหม่
              </Button>
            </div>

            {filteredDiscussions.length === 0 ? (
              <div className="card-elevated p-8 text-center text-muted-foreground">
                ไม่พบกระทู้ที่ค้นหา
              </div>
            ) : (
              filteredDiscussions.map((post) => (
                <div
                  key={post.id}
                  className="card-elevated p-5 hover:border-primary/20 transition-colors cursor-pointer"
                >
                  <h3 className="font-semibold text-foreground mb-2">{post.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>โดย {post.author}</span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" /> {post.replies}
                    </span>
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        likedPosts.includes(post.id) ? "text-primary" : "hover:text-primary"
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {post.likes + (likedPosts.includes(post.id) ? 1 : 0)}
                    </button>
                    <span>{post.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Reviews ─────────────────────────────────────────── */}
        {activeTab === "reviews" && (
          <div className="space-y-4 animate-fade-in">
            {reviews.map((review) => (
              <div key={review.id} className="card-elevated p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-primary">{review.course}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? "fill-warning text-warning" : "text-muted"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-foreground">{review.text}</p>
                <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                  <span>โดย {review.author}</span>
                  <span>• {review.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Messages ────────────────────────────────────────── */}
        {activeTab === "messages" && (
          <div className="animate-fade-in">
            {!user ? (
              <div className="card-elevated p-8 text-center space-y-3">
                <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground opacity-30" />
                <p className="text-muted-foreground">กรุณาเข้าสู่ระบบเพื่อส่งข้อความ</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[500px]">
                {/* Contact List */}
                <div className="card-elevated overflow-hidden flex flex-col">
                  <div className="p-3 border-b border-border">
                    <Input placeholder="ค้นหาผู้ติดต่อ..." className="input-focus h-8 text-sm" />
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {contacts.map((contact, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors ${
                          i === 0 ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                            {contact.name.charAt(0)}
                          </div>
                          {contact.online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{contact.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{contact.msg}</p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{contact.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chat */}
                <div className="md:col-span-2 card-elevated flex flex-col overflow-hidden">
                  <div className="p-3 border-b border-border flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                      อ
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">อ.สมชาย ใจดี</p>
                      <p className="text-xs text-success">ออนไลน์</p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                            msg.from === "me"
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted text-foreground rounded-bl-md"
                          }`}
                        >
                          <p>{msg.text}</p>
                          <p className={`text-xs mt-1 ${msg.from === "me" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-border flex items-center gap-2">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="พิมพ์ข้อความ..."
                      className="input-focus flex-1"
                    />
                    <Button size="icon" onClick={handleSendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Community;
