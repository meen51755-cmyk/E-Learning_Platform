// src/components/SearchModal.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { sampleCourses } from "@/data/mockData";
import { Search, X, BookOpen, ArrowRight, Clock, Star } from "lucide-react";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

const RECENT_KEY = "learnhub_recent_search";

const SearchModal = ({ open, onClose }: SearchModalProps) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // โหลด recent searches
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      setRecentSearches(saved.slice(0, 5));
    } catch { setRecentSearches([]); }
  }, []);

  // Focus input เมื่อเปิด
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
    }
  }, [open]);

  // ปิดเมื่อกด Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // ค้นหาจาก mockData
  const results = query.trim().length >= 2
    ? sampleCourses.filter((c) =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.instructor.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase()) ||
        c.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 6)
    : [];

  const handleSelect = (courseId: string, searchQuery?: string) => {
    // บันทึก recent search
    if (searchQuery) {
      const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    }
    navigate(`/courses/${courseId}`);
    onClose();
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    navigate(`/courses?search=${encodeURIComponent(query)}`);
    onClose();
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_KEY);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-background rounded-2xl shadow-2xl border border-border overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="ค้นหาคอร์ส, ผู้สอน, หมวดหมู่..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
            maxLength={100}
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded text-xs text-muted-foreground border border-border">
            ESC
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {/* Search results */}
          {results.length > 0 ? (
            <div>
              <p className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                ผลลัพธ์ {results.length} คอร์ส
              </p>
              {results.map((course) => (
                <button
                  key={course.id}
                  onClick={() => handleSelect(course.id, query)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{course.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {course.instructor} · {course.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex items-center gap-0.5 text-xs text-warning">
                      <Star className="w-3 h-3 fill-warning" /> {course.rating}
                    </span>
                    <span className={`text-xs font-medium ${course.isFree ? "text-success" : "text-foreground"}`}>
                      {course.isFree ? "ฟรี" : `฿${course.price.toLocaleString()}`}
                    </span>
                  </div>
                </button>
              ))}
              {/* ดูผลลัพธ์ทั้งหมด */}
              <button
                onClick={handleSearch}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-primary hover:bg-primary/5 transition-colors border-t border-border"
              >
                ดูผลลัพธ์ทั้งหมดสำหรับ "{query}"
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : query.trim().length >= 2 ? (
            // ไม่พบผลลัพธ์
            <div className="p-8 text-center space-y-2">
              <BookOpen className="w-10 h-10 mx-auto text-muted-foreground opacity-30" />
              <p className="text-sm text-muted-foreground">ไม่พบคอร์สที่ตรงกับ "{query}"</p>
              <button
                onClick={handleSearch}
                className="text-sm text-primary hover:underline"
              >
                ค้นหาใน Courses page
              </button>
            </div>
          ) : (
            // Recent + Popular
            <div>
              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-4 py-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      ค้นหาล่าสุด
                    </p>
                    <button onClick={clearRecent} className="text-xs text-muted-foreground hover:text-foreground">
                      ล้าง
                    </button>
                  </div>
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setQuery(s); inputRef.current?.focus(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left"
                    >
                      <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground">{s}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Popular categories */}
              <div className="border-t border-border">
                <p className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  หมวดหมู่ยอดนิยม
                </p>
                <div className="flex flex-wrap gap-2 px-4 pb-4">
                  {["Web Development", "Data Science", "Design", "Cybersecurity", "Mobile Development"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setQuery(cat); inputRef.current?.focus(); }}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-foreground"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
