import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpenCheck, Flame, Gauge, Layers, Sparkles } from "lucide-react";
import {
  badges,
  categories,
  completedCount,
  currentLevelInfo,
  demoUser,
  findLesson,
  levels,
  overallProgress,
  totalWeeklyMinutes,
  weeklyActivity,
  allLessons,
} from "../data/demo";
import { paths } from "../paths";
import { CategoryCard } from "./cards";
import {
  DemoPill,
  DifficultyPill,
  DurationPill,
  EmptyState,
  Notice,
  ProgressBar,
  SectionHead,
} from "./ui";

/* 1 — Welcome ---------------------------------------------------------- */
export function Welcome() {
  const target = findLesson(demoUser.continueLesson.categoryId, demoUser.continueLesson.lessonId);
  const to = target ? paths.lesson(target.category.id, target.lesson.id) : paths.academy;
  return (
    <section className="cn-welcome" aria-labelledby="cn-welcome-title">
      <span className="cn-eyebrow">Netra 2 · Combat Training</span>
      <h1 id="cn-welcome-title">Welcome back, {demoUser.firstName}.</h1>
      <p className="cn-tagline">“Strength begins with practice.”</p>
      <p className="cn-lead">
        Every small session builds confidence. Learn to stay aware, set clear boundaries, and
        practise self-defence at your own pace — one calm, focused lesson at a time.
      </p>
      <div className="cn-welcome-actions">
        <Link to={to} className="cn-btn">
          Continue Learning <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <Link to={paths.academy} className="cn-btn cn-btn-ghost">
          Browse Academy
        </Link>
      </div>
    </section>
  );
}

/* 2 — Overview --------------------------------------------------------- */
export function TrainingOverview() {
  const reduce = useReducedMotion();
  const total = allLessons().length;
  const { current } = currentLevelInfo();
  const stats = [
    { icon: BookOpenCheck, value: `${completedCount()} / ${total}`, label: "Lessons completed" },
    { icon: Layers, value: current.name, label: "Current training level" },
    { icon: Gauge, value: `${overallProgress()}%`, label: "Overall learning progress" },
    { icon: Flame, value: `${demoUser.streakDays} days`, label: "Current learning streak" },
  ];
  return (
    <section className="cn-section" aria-label="Training overview">
      <SectionHead
        title="Training overview"
        subtitle="A snapshot of where you are right now."
        action={<DemoPill />}
      />
      <ul className="cn-grid cn-grid-4">
        {stats.map(({ icon: Icon, value, label }, i) => (
          <motion.li
            key={label}
            className="cn-card cn-stat"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 * i }}
          >
            <div className="cn-stat-icon">
              <Icon size={18} aria-hidden="true" />
            </div>
            <div className="cn-stat-value">{value}</div>
            <div className="cn-stat-label">{label}</div>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

/* 3 — Continue learning ------------------------------------------------ */
export function ContinueLearningCard() {
  const target = findLesson(demoUser.continueLesson.categoryId, demoUser.continueLesson.lessonId);
  return (
    <section className="cn-section" aria-label="Continue learning">
      <SectionHead title="Continue learning" subtitle="Your next recommended lesson." />
      {target ? (
        <div className="cn-card cn-continue">
          <div>
            <span className="cn-eyebrow">{target.category.title}</span>
            <h3>{target.lesson.title}</h3>
            <div className="cn-meta" style={{ marginBottom: 16 }}>
              <DurationPill minutes={target.lesson.durationMin} />
              <DifficultyPill level={target.lesson.difficulty} />
              <span className="cn-pill cn-pill-accent">{target.lesson.progress}% complete</span>
            </div>
            <ProgressBar value={target.lesson.progress} label="Lesson progress" />
          </div>
          <Link to={paths.lesson(target.category.id, target.lesson.id)} className="cn-btn">
            Continue <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="Nothing queued yet"
          message="Pick a category in the Academy to start your first lesson."
          actionLabel="Open Academy"
          actionTo={paths.academy}
        />
      )}
    </section>
  );
}

/* 4 — Academy preview -------------------------------------------------- */
export function AcademyPreview() {
  return (
    <section className="cn-section" aria-label="Training academy">
      <SectionHead
        title="Training academy"
        subtitle="Four focus areas to build skills step by step."
        action={
          <Link to={paths.academy} className="cn-link-arrow">
            View all <ArrowRight size={15} aria-hidden="true" />
          </Link>
        }
      />
      {categories.length ? (
        <ul className="cn-grid cn-grid-2">
          {categories.map((c, i) => (
            <CategoryCard key={c.id} category={c} index={i} />
          ))}
        </ul>
      ) : (
        <EmptyState icon={Sparkles} title="No categories yet" message="Training categories will appear here." />
      )}
    </section>
  );
}

/* 5 — Levels ----------------------------------------------------------- */
export function TrainingLevels() {
  const { current, next, idx, done, percentToNext } = currentLevelInfo();
  return (
    <section className="cn-section" aria-label="Training levels">
      <SectionHead
        title="Training levels"
        subtitle="Bronze to Platinum, based on lessons completed."
        action={<DemoPill>Illustrative levels</DemoPill>}
      />
      <div className="cn-card">
        <div className="cn-levels">
          {levels.map((lv, i) => (
            <div
              key={lv.name}
              className="cn-level"
              data-state={i === idx ? "current" : i < idx ? "done" : "upcoming"}
            >
              <h3>{lv.name}</h3>
              <span className="cn-level-note">{lv.blurb}</span>
              <span className="cn-small">
                <strong>{lv.minLessons}</strong> lessons
              </span>
              {i === idx && <span className="cn-pill cn-pill-accent" style={{ alignSelf: "flex-start" }}>You are here</span>}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24 }}>
          <div className="cn-meta" style={{ justifyContent: "space-between", marginBottom: 8 }}>
            <strong>
              {next ? `Progress to ${next.name}` : "Highest level reached"}
            </strong>
            <span className="cn-small cn-muted">
              {next ? `${done} of ${next.minLessons} lessons` : `${done} lessons`}
            </span>
          </div>
          <ProgressBar value={percentToNext} label={`Progress toward ${next?.name ?? current.name}`} />
        </div>
        <div style={{ marginTop: 16 }}>
          <Notice>
            Levels and thresholds are illustrative demo data in this stage. They are not linked to a
            real account.
          </Notice>
        </div>
      </div>
    </section>
  );
}

/* 6 — Weekly activity -------------------------------------------------- */
export function WeeklyActivity() {
  const reduce = useReducedMotion();
  const max = Math.max(...weeklyActivity.map((d) => d.minutes), 1);
  const total = totalWeeklyMinutes();
  return (
    <section className="cn-section" aria-label="Weekly activity">
      <SectionHead
        title="Weekly activity"
        subtitle={total ? `${total} minutes of practice this week.` : undefined}
        action={<DemoPill />}
      />
      <div className="cn-card">
        {total === 0 ? (
          <EmptyState
            icon={Flame}
            title="No activity yet this week"
            message="Complete a lesson to see your weekly practice appear here."
            actionLabel="Start a lesson"
            actionTo={paths.academy}
          />
        ) : (
          <ul className="cn-chart" aria-label="Minutes practised per day">
            {weeklyActivity.map((d, i) => (
              <li key={d.day} className="cn-bar-col" aria-label={`${d.day}: ${d.minutes} minutes`}>
                <span className="cn-bar-val">{d.minutes ? d.minutes : "–"}</span>
                <div className="cn-bar-track">
                  <motion.div
                    className="cn-bar"
                    data-zero={d.minutes === 0}
                    style={{ height: `${Math.max((d.minutes / max) * 100, 3)}%` }}
                    initial={reduce ? false : { scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
                  />
                </div>
                <span className="cn-bar-day">{d.day}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* 7 — Achievements preview --------------------------------------------- */
export function AchievementsPreview() {
  return (
    <section className="cn-section" aria-label="Achievements preview">
      <SectionHead
        title="Achievements"
        subtitle="A few sample badges you could earn."
        action={
          <Link to={paths.achievements} className="cn-link-arrow">
            All achievements <ArrowRight size={15} aria-hidden="true" />
          </Link>
        }
      />
      <ul className="cn-grid cn-grid-2">
        {badges.map((b) => {
          const Icon = b.icon;
          return (
            <li key={b.id} className="cn-card cn-badge" data-earned={b.earned}>
              <div className="cn-badge-icon">
                <Icon size={24} aria-hidden="true" />
              </div>
              <div>
                <h3>{b.title}</h3>
                <p className="cn-small cn-muted">{b.description}</p>
                <div className="cn-meta" style={{ marginTop: 8 }}>
                  <span className={`cn-pill ${b.earned ? "cn-pill-success" : ""}`}>
                    {b.earned ? "Earned (demo)" : "Locked (demo)"}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="cn-small cn-muted" style={{ marginTop: 12 }}>
        Badges are demonstration content only.
      </p>
    </section>
  );
}
