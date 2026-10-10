import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2, Circle, PlayCircle } from "lucide-react";
import type { Lesson, TrainingCategory } from "../types";
import { categoryProgress } from "../data/demo";
import { paths } from "../paths";
import { DifficultyPill, DurationPill, ProgressBar } from "./ui";

export function CategoryCard({
  category,
  index = 0,
}: {
  category: TrainingCategory;
  index?: number;
}) {
  const reduce = useReducedMotion();
  const Icon = category.icon;
  const total = category.lessons.length;
  const minutes = category.lessons.reduce((s, l) => s + l.durationMin, 0);
  const done = category.lessons.filter((l) => l.status === "completed").length;

  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      style={{ display: "block" }}
    >
      <Link
        to={paths.category(category.id)}
        className="cn-cat-link"
        aria-label={`${category.title}: open category`}
      >
        <article className="cn-card cn-cat">
          <div className="cn-cat-icon">
            <Icon size={22} aria-hidden="true" />
          </div>
          <h3>{category.title}</h3>
          <p>{category.description}</p>
          <div className="cn-meta">
            <DifficultyPill level={category.difficulty} />
            <DurationPill minutes={minutes} prefix="~" />
            <span className="cn-pill">{total} lessons</span>
          </div>
          <ProgressBar value={categoryProgress(category)} label={`${category.title} progress`} />
          <span className="cn-small cn-muted">
            {done} of {total} lessons completed
          </span>
          <span className="cn-link-arrow">
            Open category <ArrowRight size={15} aria-hidden="true" />
          </span>
        </article>
      </Link>
    </motion.li>
  );
}

const STATUS_LABEL: Record<Lesson["status"], string> = {
  completed: "Completed",
  "in-progress": "In progress",
  "not-started": "Not started",
};

export function LessonRow({ categoryId, lesson }: { categoryId: string; lesson: Lesson }) {
  const Icon =
    lesson.status === "completed" ? CheckCircle2 : lesson.status === "in-progress" ? PlayCircle : Circle;
  const cta = lesson.status === "in-progress" ? "Continue" : lesson.status === "completed" ? "Review" : "Start";

  return (
    <li className="cn-lesson-row">
      <Icon
        size={22}
        aria-hidden="true"
        color={lesson.status === "completed" ? "var(--cn-success)" : "currentColor"}
      />
      <div className="cn-lesson-main">
        <h3>{lesson.title}</h3>
        <p className="cn-small cn-muted">{lesson.summary}</p>
        <div className="cn-meta" style={{ marginTop: 8 }}>
          <span
            className={`cn-pill ${
              lesson.status === "completed" ? "cn-pill-success" : lesson.status === "in-progress" ? "cn-pill-accent" : ""
            }`}
          >
            {STATUS_LABEL[lesson.status]}
            {lesson.status === "in-progress" ? ` · ${lesson.progress}%` : ""}
          </span>
          <DifficultyPill level={lesson.difficulty} />
          <DurationPill minutes={lesson.durationMin} />
        </div>
      </div>
      <Link
        to={paths.lesson(categoryId, lesson.id)}
        className="cn-btn cn-btn-ghost cn-btn-sm"
        aria-label={`${cta} lesson: ${lesson.title}`}
      >
        {cta}
      </Link>
    </li>
  );
}
