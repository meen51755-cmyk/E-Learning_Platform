import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CourseCard from "@/components/course/CourseCard";
import { useCourses, useCategories } from "@/hooks/useCourses";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Courses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");

  const { data: categoriesData } = useCategories();
  const { data: courses, isLoading } = useCourses({
    search: searchQuery || undefined,
    level: selectedLevel !== "all" ? selectedLevel : undefined,
    isFree: priceFilter === "free" ? true : priceFilter === "paid" ? false : undefined,
  });

  const categoryNames = ["ทั้งหมด", ...(categoriesData?.map(c => c.name) || [])];

  // Client-side category filter (since we join categories)
  const filteredCourses = (courses || []).filter(c =>
    selectedCategory === "ทั้งหมด" || c.category_name === selectedCategory
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto container-padding py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">คอร์สเรียนทั้งหมด</h1>
          <p className="text-muted-foreground mt-1">ค้นหาคอร์สที่เหมาะกับคุณ</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="ค้นหาคอร์ส..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base input-focus"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categoryNames.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">ระดับ:</span>
              {[
                { value: "all", label: "ทั้งหมด" },
                { value: "beginner", label: "เริ่มต้น" },
                { value: "intermediate", label: "กลาง" },
                { value: "advanced", label: "สูง" },
              ].map((level) => (
                <button
                  key={level.value}
                  onClick={() => setSelectedLevel(level.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedLevel === level.value
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">ราคา:</span>
              {[
                { value: "all", label: "ทั้งหมด" },
                { value: "free", label: "ฟรี" },
                { value: "paid", label: "มีค่าใช้จ่าย" },
              ].map((price) => (
                <button
                  key={price.value}
                  onClick={() => setPriceFilter(price.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    priceFilter === price.value
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {price.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <span className="text-sm text-muted-foreground">แสดง {filteredCourses.length} คอร์ส</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card-elevated">
                <Skeleton className="aspect-video w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {!isLoading && filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">ไม่พบคอร์สที่ค้นหา</p>
            <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(""); setSelectedCategory("ทั้งหมด"); setSelectedLevel("all"); setPriceFilter("all"); }}>
              ล้างตัวกรอง
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Courses;
