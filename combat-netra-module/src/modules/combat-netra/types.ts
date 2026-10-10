import type { LucideIcon } from "lucide-react";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type LessonStatus = "completed" | "in-progress" | "not-started";
export type LevelName = "Bronze" | "Silver" | "Gold" | "Platinum";

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  durationMin: number;
  difficulty: Difficulty;
  status: LessonStatus;
  /** 0–100, only meaningful for in-progress lessons. */
  progress: number;
}

export interface TrainingCategory {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  difficulty: Difficulty;
  lessons: Lesson[];
}

export interface LevelDefinition {
  name: LevelName;
  /** Lessons completed needed to reach this level (demo thresholds). */
  minLessons: number;
  blurb: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  earned: boolean;
}

export interface DayActivity {
  day: string;
  minutes: number;
}
