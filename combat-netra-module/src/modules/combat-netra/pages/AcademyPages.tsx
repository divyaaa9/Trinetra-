import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Construction, SearchX } from "lucide-react";
import { categories, findCategory, findLesson, categoryProgress } from "../data/demo";
import { paths } from "../paths";
import { CategoryCard, LessonRow } from "../components/cards";
import {
  DifficultyPill,
  DurationPill,
  EmptyState,
  Notice,
  PageHeader,
  PageTransition,
  ProgressBar,
} from "../components/ui";

export function AcademyPage() {
  return (
    <PageTransition>
      <PageHeader
        eyebrow="Training academy"
        title="Academy"
        subtitle="Choose a focus area. Each category is a short series of lessons you can take at your own pace."
      />
      <div className="cn-section" style={{ marginTop: 28 }}>
        <ul className="cn-grid cn-grid-2">
          {categories.map((c, i) => (
            <CategoryCard key={c.id} category={c} index={i} />
          ))}
        </ul>
      </div>
    </PageTransition>
  );
}

export function CategoryPage() {
  const { categoryId } = useParams();
  const category = findCategory(categoryId);

  if (!category) {
    return (
      <PageTransition>
        <EmptyState
          icon={SearchX}
          title="Category not found"
          message="That training category doesn't exist. Head back to the Academy to pick one."
          actionLabel="Back to Academy"
          actionTo={paths.academy}
        />
      </PageTransition>
    );
  }

  const Icon = category.icon;
  const minutes = category.lessons.reduce((s, l) => s + l.durationMin, 0);

  return (
    <PageTransition>
      <nav className="cn-crumbs" aria-label="Breadcrumb">
        <Link to={paths.academy}>Academy</Link>
        <span aria-hidden="true">/</span>
        <span>{category.title}</span>
      </nav>
      <div className="cn-card" style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="cn-cat-icon">
          <Icon size={22} aria-hidden="true" />
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)" }}>{category.title}</h1>
          <p className="cn-muted" style={{ margin: "8px 0 14px" }}>{category.description}</p>
          <div className="cn-meta" style={{ marginBottom: 14 }}>
            <DifficultyPill level={category.difficulty} />
            <DurationPill minutes={minutes} prefix="~" />
            <span className="cn-pill">{category.lessons.length} lessons</span>
          </div>
          <ProgressBar value={categoryProgress(category)} label={`${category.title} progress`} />
        </div>
      </div>

      <div className="cn-section" style={{ marginTop: 32 }}>
        <h2 style={{ marginBottom: 16 }}>Lessons</h2>
        {category.lessons.length ? (
          <ul className="cn-lesson-list">
            {category.lessons.map((l) => (
              <LessonRow key={l.id} categoryId={category.id} lesson={l} />
            ))}
          </ul>
        ) : (
          <EmptyState icon={Construction} title="No lessons yet" message="Lessons for this category are coming soon." />
        )}
      </div>
    </PageTransition>
  );
}

export function LessonPage() {
  const { categoryId, lessonId } = useParams();
  const found = findLesson(categoryId, lessonId);

  if (!found) {
    return (
      <PageTransition>
        <EmptyState
          icon={SearchX}
          title="Lesson not found"
          message="That lesson doesn't exist. Head back to the Academy to choose another."
          actionLabel="Back to Academy"
          actionTo={paths.academy}
        />
      </PageTransition>
    );
  }
  const { category, lesson } = found;

  return (
    <PageTransition>
      <nav className="cn-crumbs" aria-label="Breadcrumb">
        <Link to={paths.academy}>Academy</Link>
        <span aria-hidden="true">/</span>
        <Link to={paths.category(category.id)}>{category.title}</Link>
        <span aria-hidden="true">/</span>
        <span>{lesson.title}</span>
      </nav>
      <PageHeader eyebrow={category.title} title={lesson.title} subtitle={lesson.summary} />
      <div className="cn-meta" style={{ margin: "16px 0 28px" }}>
        <DifficultyPill level={lesson.difficulty} />
        <DurationPill minutes={lesson.durationMin} />
      </div>
      <div className="cn-card">
        <EmptyState
          icon={Construction}
          title="Lesson player coming soon"
          message="This is a placeholder for the lesson. The interactive lesson player is planned for a later stage."
        />
        <div style={{ marginTop: 16 }}>
          <Notice>Lesson content is not yet available, and no progress is saved in this stage.</Notice>
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <Link to={paths.category(category.id)} className="cn-btn cn-btn-ghost">
          <ArrowLeft size={16} aria-hidden="true" /> Back to {category.title}
        </Link>
      </div>
    </PageTransition>
  );
}
