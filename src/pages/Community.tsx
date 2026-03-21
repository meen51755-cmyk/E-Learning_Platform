import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { validators, checkRateLimit } from "@/lib/sanitize";
import { usePosts, usePostLikes, useComments, useReviews, useMessages } from "@/hooks/useCommunity";
import { sampleCourses } from "@/data/mockData";
import {
  MessageSquare, Star, ThumbsUp, Send, Search,
  Plus, X, Loader2, RefreshCw, ChevronDown
} from "lucide-react";

// ── Modal สร้างโพสต์ใหม่ ──────────────────────────────────────
const NewPostModal = ({
  onClose, onCreate,
}: {
  onClose: () => void;
  onCreate: (title: string, content: string, category: string) => Promise<void>;
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("question");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const titleCheck = validators.postTitle(title);
    if (!titleCheck.ok) return;
    const contentCheck = validators.postContent(content);
    if (!contentCheck.ok) return;
    setSaving(true);
    await onCreate(titleCheck.value!, contentCheck.value!, category);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl p-6 w-full max-w-lg space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-foreground">สร้างกระทู้ใหม่</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">หมวดหมู่</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="question">❓ คำถาม</option>
            <option value="review">⭐ รีวิว</option>
            <option value="general">💬 ทั่วไป</option>
            <option value="announcement">📢 ประกาศ</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">หัวข้อ <span className="text-destructive">*</span></label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="หัวข้อกระทู้..."
            maxLength={200}
            className="input-focus"
          />
          <p className="text-xs text-muted-foreground text-right mt-1">{title.length}/200</p>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">เนื้อหา <span className="text-destructive">*</span></label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="เล่าให้ฟังหน่อย..."
            rows={4}
            maxLength={5000}
            className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <p className="text-xs text-muted-foreground text-right mt-1">{content.length}/5000</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>ยกเลิก</Button>
          <Button variant="hero" className="flex-1" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "โพสต์"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Post Card ─────────────────────────────────────────────────
const PostCard = ({
  post, liked, onLike, onOpen,
}: {
  post: import("@/hooks/useCommunity").Post;
  liked: boolean;
  onLike: () => void;
  onOpen: () => void;
}) => {
  const categoryLabel: Record<string, string> = {
    question: "❓ คำถาม", review: "⭐ รีวิว",
    general: "💬 ทั่วไป", announcement: "📢 ประกาศ",
  };

  return (
    <div className="card-elevated p-5 hover:border-primary/20 transition-all cursor-pointer" onClick={onOpen}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          {categoryLabel[post.category] ?? post.category}
        </span>
        {post.is_pinned && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning">📌 ปักหมุด</span>
        )}
      </div>
      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{post.title}</h3>
      {post.content && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.content}</p>
      )}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
            {(post.author_name ?? "?").charAt(0)}
          </div>
          <span className="text-xs">{post.author_name}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onLike(); }}
          className={`flex items-center gap-1 text-xs transition-colors ${liked ? "text-primary" : "hover:text-primary"}`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          {post.likes_count + (liked ? 0 : 0)}
        </button>
        <span className="flex items-center gap-1 text-xs">
          <MessageSquare className="w-3.5 h-3.5" />
          ความคิดเห็น
        </span>
        <span className="text-xs ml-auto">
          {new Date(post.created_at).toLocaleDateString("th-TH")}
        </span>
      </div>
    </div>
  );
};

// ── Post Detail Modal ─────────────────────────────────────────
const PostDetailModal = ({
  post, onClose,
}: {
  post: import("@/hooks/useCommunity").Post;
  onClose: () => void;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { comments, addComment } = useComments(post.id);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);

  const handleComment = async () => {
    if (!user) {
      toast({ title: "กรุณาเข้าสู่ระบบก่อน", variant: "destructive" });
      return;
    }
    const check = validators.postContent(commentText);
    if (!check.ok) {
      toast({ title: check.error, variant: "destructive" });
      return;
    }
    const rate = checkRateLimit(`comment-${user.id}`, 10, 60000);
    if (!rate.allowed) {
      toast({ title: "คอมเมนต์ถี่เกินไป", variant: "destructive" });
      return;
    }
    setSending(true);
    const result = await addComment(check.value!);
    if (!result.ok) toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
    else setCommentText("");
    setSending(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-fade-in">
        <div className="p-6 border-b border-border flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display font-bold text-foreground">{post.title}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              โดย {post.author_name} · {new Date(post.created_at).toLocaleDateString("th-TH")}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {post.content && (
            <p className="text-sm text-foreground whitespace-pre-wrap">{post.content}</p>
          )}

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              ความคิดเห็น ({comments.length})
            </h3>
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">ยังไม่มีความคิดเห็น เป็นคนแรกสิ!</p>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                      {(c.author_name ?? "?").charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-foreground">{c.author_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(c.created_at).toLocaleDateString("th-TH")}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          <Input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleComment()}
            placeholder="เขียนความคิดเห็น..."
            maxLength={1000}
            className="input-focus flex-1"
          />
          <Button size="icon" onClick={handleComment} disabled={sending}>
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Main Community ────────────────────────────────────────────
const Community = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"discussions" | "reviews" | "messages">("discussions");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<import("@/hooks/useCommunity").Post | null>(null);
  const [messageText, setMessageText] = useState("");

  const { posts, loading: postsLoading, toggleLike, createPost, refetch } = usePosts(searchQuery);
  const { reviews } = useReviews();
  const postIds = posts.map((p) => p.id);
  const likedIds = usePostLikes(postIds);

  // Mock contact สำหรับ messages (TODO: ดึง contacts จริง)
  const MOCK_RECEIVER = "00000000-0000-0000-0000-000000000000";
  const { messages, sendMessage } = useMessages(user ? MOCK_RECEIVER : null);

  const handleNewPost = async (title: string, content: string, category: string) => {
    if (!user) {
      toast({ title: "กรุณาเข้าสู่ระบบก่อน", variant: "destructive" });
      return;
    }
    const rate = checkRateLimit(`new-post-${user.id}`, 3, 60000);
    if (!rate.allowed) {
      toast({ title: "สร้างโพสต์ถี่เกินไป กรุณารอสักครู่", variant: "destructive" });
      return;
    }
    const result = await createPost(title, content, category);
    if (result.ok) {
      toast({ title: "โพสต์สำเร็จ! ✓" });
    } else {
      toast({ title: "โพสต์ไม่สำเร็จ", description: result.error, variant: "destructive" });
    }
  };

  const handleSendMessage = async () => {
    if (!user) {
      toast({ title: "กรุณาเข้าสู่ระบบก่อน", variant: "destructive" });
      return;
    }
    const check = validators.message(messageText);
    if (!check.ok) {
      toast({ title: check.error, variant: "destructive" });
      return;
    }
    const rate = checkRateLimit(`msg-${user.id}`, 10, 60000);
    if (!rate.allowed) {
      toast({ title: "ส่งข้อความถี่เกินไป", variant: "destructive" });
      return;
    }
    const result = await sendMessage(check.value!);
    if (result.ok) setMessageText("");
  };

  const tabs = [
    { id: "discussions" as const, label: "กระทู้", icon: MessageSquare },
    { id: "reviews" as const, label: "รีวิวคอร์ส", icon: Star },
    { id: "messages" as const, label: "ข้อความ", icon: Send },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {showNewPost && (
        <NewPostModal
          onClose={() => setShowNewPost(false)}
          onCreate={handleNewPost}
        />
      )}

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}

      <div className="container mx-auto container-padding py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">ชุมชน LearnHub</h1>
          <p className="text-muted-foreground mt-1">พูดคุย แลกเปลี่ยน และรีวิวคอร์ส</p>
        </div>

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
                  maxLength={200}
                />
              </div>
              <Button variant="ghost" size="icon" onClick={refetch} title="รีเฟรช">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="hero" onClick={() => {
                if (!user) { toast({ title: "กรุณาเข้าสู่ระบบก่อน", variant: "destructive" }); return; }
                setShowNewPost(true);
              }}>
                <Plus className="w-4 h-4" /> สร้างกระทู้
              </Button>
            </div>

            {/* Realtime indicator */}
            <div className="flex items-center gap-1.5 text-xs text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse inline-block" />
              Realtime — อัปเดตอัตโนมัติ
            </div>

            {postsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              </div>
            ) : posts.length === 0 ? (
              <div className="card-elevated p-8 text-center text-muted-foreground">
                <MessageSquare className="w-10 h-10 mx-auto opacity-30 mb-3" />
                <p>ยังไม่มีกระทู้ เป็นคนแรกที่โพสต์สิ!</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  liked={likedIds.has(post.id)}
                  onLike={() => toggleLike(post.id, likedIds.has(post.id))}
                  onOpen={() => setSelectedPost(post)}
                />
              ))
            )}
          </div>
        )}

        {/* ── Reviews ─────────────────────────────────────────── */}
        {activeTab === "reviews" && (
          <div className="space-y-4 animate-fade-in">
            {reviews.length === 0 ? (
              <div className="card-elevated p-8 text-center text-muted-foreground">
                <Star className="w-10 h-10 mx-auto opacity-30 mb-3" />
                <p>ยังไม่มีรีวิว</p>
              </div>
            ) : (
              reviews.map((review) => {
                const course = sampleCourses.find((c) => c.id === review.course_id);
                return (
                  <div key={review.id} className="card-elevated p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-primary">
                        {course?.title ?? review.course_id}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-warning text-warning" : "text-muted"}`} />
                        ))}
                      </div>
                    </div>
                    {review.content && <p className="text-foreground text-sm">{review.content}</p>}
                    <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                      <span>โดย {review.author_name}</span>
                      <span>• {new Date(review.created_at).toLocaleDateString("th-TH")}</span>
                    </div>
                  </div>
                );
              })
            )}
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
              <div className="card-elevated flex flex-col h-[500px] overflow-hidden">
                <div className="p-3 border-b border-border flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {profile?.full_name?.charAt(0) ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{profile?.full_name ?? user.email}</p>
                    <div className="flex items-center gap-1 text-xs text-success">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse inline-block" />
                      Realtime
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">ยังไม่มีข้อความ</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender_id === user.id ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                          msg.sender_id === user.id
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        }`}>
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.sender_id === user.id ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                            {new Date(msg.created_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3 border-t border-border flex items-center gap-2">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="พิมพ์ข้อความ..."
                    maxLength={1000}
                    className="input-focus flex-1"
                  />
                  <Button size="icon" onClick={handleSendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
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
