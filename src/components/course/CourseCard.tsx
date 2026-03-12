import { Link } from "react-router-dom";
import { Star, Users, Clock, PlayCircle } from "lucide-react";
import { CourseWithDetails } from "@/hooks/useCourses";

interface CourseCardProps {
  course: CourseWithDetails;
  progress?: number;
}

const CourseCard = ({ course, progress }: CourseCardProps) => {
  const levelLabels: Record<string, string> = {
    beginner: 'เริ่มต้น',
    intermediate: 'กลาง',
    advanced: 'สูง',
  };

  return (
    <Link to={`/courses/${course.id}`} className="course-card group block">
      <div className="aspect-video bg-muted relative overflow-hidden">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <PlayCircle className="w-12 h-12 text-primary-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`${course.level === 'beginner' ? 'badge-level-beginner' : course.level === 'intermediate' ? 'badge-level-intermediate' : 'badge-level-advanced'}`}>
            {levelLabels[course.level] || course.level}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={course.is_free ? 'badge-free' : 'badge-paid'}>
            {course.is_free ? 'ฟรี' : `฿${course.price.toLocaleString()}`}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{course.category_name || ''}</span>
        </div>
        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
            {(course.instructor_name || "?").charAt(0)}
          </div>
          <span className="text-xs text-muted-foreground">{course.instructor_name}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-warning text-warning" />
            <span className="font-medium text-foreground">{Number(course.rating).toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {course.total_students.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {course.duration || '-'}
            </span>
          </div>
        </div>

        {progress !== undefined && progress > 0 && (
          <div className="space-y-1">
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">{progress}% เสร็จสิ้น</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default CourseCard;
