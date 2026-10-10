import { Award, DoorOpen, Eye, Flame, Hand, Shield, Trophy } from "lucide-react";
import type {
  Badge,
  DayActivity,
  LevelDefinition,
  Lesson,
  TrainingCategory,
} from "../types";

/**
 * LOCAL DEMO DATA — Stage 1 only.
 * Nothing here is read from or written to a backend. Replace with real
 * data sources in a later stage.
 */

const L = (
  id: string,
  title: string,
  summary: string,
  durationMin: number,
  difficulty: Lesson["difficulty"],
  status: Lesson["status"] = "not-started",
  progress = 0,
): Lesson => ({ id, title, summary, durationMin, difficulty, status, progress });

export const categories: TrainingCategory[] = [
  {
    id: "basic-self-defence",
    title: "Basic Self-Defence",
    description:
      "Build a confident stance, learn to set firm boundaries, and practise simple protective movements.",
    icon: Shield,
    difficulty: "Beginner",
    lessons: [
      L("bsd-1", "Confident Stance & Balance", "Find a stable, ready posture you can hold comfortably.", 15, "Beginner", "completed"),
      L("bsd-2", "Setting Boundaries with Voice & Body", "Use clear words and body language to create space.", 15, "Beginner", "completed"),
      L("bsd-3", "Protective Blocking Basics", "Learn simple guarding positions to protect your head and body.", 15, "Beginner", "completed"),
      L("bsd-4", "Creating Space & Distance", "Practise movement that keeps distance between you and a threat.", 15, "Beginner", "completed"),
      L("bsd-5", "Palm Heel & Open-Hand Strikes", "Introduction to safe striking mechanics for practice drills.", 20, "Beginner", "in-progress", 50),
      L("bsd-6", "Putting It Together: Short Drills", "Link stance, voice, and movement into a short routine.", 20, "Beginner"),
    ],
  },
  {
    id: "situational-awareness",
    title: "Situational Awareness",
    description:
      "Notice your surroundings, trust your instincts, and plan ahead in everyday places.",
    icon: Eye,
    difficulty: "Beginner",
    lessons: [
      L("sa-1", "Reading Your Surroundings", "Build the habit of scanning your environment calmly.", 12, "Beginner", "completed"),
      L("sa-2", "Trusting Your Instincts", "Understand gut feelings and how to act on them early.", 12, "Beginner", "completed"),
      L("sa-3", "Safer Routes & Planning Ahead", "Plan journeys, share your plans, and know your exits.", 12, "Beginner", "completed"),
      L("sa-4", "Awareness in Transit & Crowds", "Stay alert on public transport and in busy places.", 12, "Beginner"),
      L("sa-5", "Awareness Online & On Your Phone", "Keep your location and personal details private.", 12, "Beginner"),
    ],
  },
  {
    id: "escape-techniques",
    title: "Escape Techniques",
    description:
      "Understand the principles behind getting out of holds and grabs, step by step.",
    icon: DoorOpen,
    difficulty: "Intermediate",
    lessons: [
      L("et-1", "Principles of Escaping", "Why leverage and timing matter more than strength.", 18, "Intermediate"),
      L("et-2", "Wrist Grab Responses", "Practise breaking free from a wrist grab.", 18, "Intermediate"),
      L("et-3", "Responding to Grabs from Behind", "Learn safe responses and how to create an exit.", 20, "Intermediate"),
      L("et-4", "Getting Up Safely", "Practise moving from the ground back to your feet.", 18, "Intermediate"),
      L("et-5", "Escape & Run: Making Distance", "Combine an escape with moving to safety.", 15, "Intermediate"),
      L("et-6", "Scenario Review & Reflection", "Walk through sample scenarios and talk through choices.", 16, "Intermediate"),
    ],
  },
  {
    id: "defensive-fundamentals",
    title: "Defensive Fundamentals",
    description:
      "Strengthen the core habits behind every technique: breathing, focus, fitness, and recovery.",
    icon: Hand,
    difficulty: "Beginner",
    lessons: [
      L("df-1", "Breathing & Staying Calm", "Use controlled breathing to steady your response.", 10, "Beginner"),
      L("df-2", "Warm-Up & Mobility", "Prepare your body safely before every practice session.", 14, "Beginner"),
      L("df-3", "Strength & Conditioning Basics", "Simple routines to build practical strength.", 18, "Beginner"),
      L("df-4", "Mindset: Confidence Under Pressure", "Build mental readiness and self-belief.", 12, "Beginner"),
      L("df-5", "Cool-Down & Recovery", "Recover well and prevent injury.", 10, "Beginner"),
    ],
  },
];

export const levels: LevelDefinition[] = [
  { name: "Bronze", minLessons: 0, blurb: "Foundations: stance, awareness, and boundaries." },
  { name: "Silver", minLessons: 10, blurb: "Consistent practice and basic escape principles." },
  { name: "Gold", minLessons: 16, blurb: "Confident application across varied scenarios." },
  { name: "Platinum", minLessons: 22, blurb: "Complete programme with all categories finished." },
];

export const badges: Badge[] = [
  { id: "first-lesson", title: "First Lesson", description: "Complete your first lesson.", icon: Award, earned: true },
  { id: "consistent-learner", title: "Consistent Learner", description: "Practise 3 days in a row.", icon: Flame, earned: true },
  { id: "training-milestone", title: "Training Milestone", description: "Complete 10 lessons.", icon: Trophy, earned: false },
];

export const weeklyActivity: DayActivity[] = [
  { day: "Mon", minutes: 20 },
  { day: "Tue", minutes: 35 },
  { day: "Wed", minutes: 0 },
  { day: "Thu", minutes: 25 },
  { day: "Fri", minutes: 40 },
  { day: "Sat", minutes: 15 },
  { day: "Sun", minutes: 0 },
];

export const demoUser = {
  firstName: "Learner",
  streakDays: 4,
  /** Lesson the dashboard recommends next. */
  continueLesson: { categoryId: "basic-self-defence", lessonId: "bsd-5" },
};

/* ---------- derived helpers (kept pure so a real backend can replace them) ---------- */

export const allLessons = (): Lesson[] => categories.flatMap((c) => c.lessons);

export const findCategory = (id?: string) => categories.find((c) => c.id === id);

export const findLesson = (categoryId?: string, lessonId?: string) => {
  const category = findCategory(categoryId);
  const lesson = category?.lessons.find((l) => l.id === lessonId);
  return category && lesson ? { category, lesson } : undefined;
};

export const completedCount = () =>
  allLessons().filter((l) => l.status === "completed").length;

export const overallProgress = () =>
  Math.round((completedCount() / allLessons().length) * 100);

export const categoryProgress = (c: TrainingCategory) =>
  Math.round(
    (c.lessons.filter((l) => l.status === "completed").length / c.lessons.length) * 100,
  );

export const currentLevelInfo = () => {
  const done = completedCount();
  let idx = 0;
  levels.forEach((lv, i) => {
    if (done >= lv.minLessons) idx = i;
  });
  const current = levels[idx];
  const next = levels[idx + 1];
  const percentToNext = next
    ? Math.round(((done - current.minLessons) / (next.minLessons - current.minLessons)) * 100)
    : 100;
  return { current, next, idx, done, percentToNext };
};

export const totalWeeklyMinutes = () =>
  weeklyActivity.reduce((sum, d) => sum + d.minutes, 0);
