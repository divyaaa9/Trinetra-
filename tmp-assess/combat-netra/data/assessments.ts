import type { Difficulty } from "../types";

export interface McqQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  topic: string;
  explanation: string;
}
export interface Assessment {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  topics: string[];
  categoryId: string;
  questions: McqQuestion[];
  poseIds: string[];
}

export const assessments: Assessment[] = [
  {
    id: "foundations-check",
    title: "Foundations Check",
    description:
      "Test your understanding of stance, awareness and escape principles, then copy three safe, beginner-friendly postures in front of your camera.",
    difficulty: "Beginner",
    topics: ["Stance & balance", "Situational awareness", "Escape principles", "Guard & boundary posture"],
    categoryId: "basic-self-defence",
    poseIds: ["ready-guard", "wide-stance", "goalpost"],
    questions: [
      {
        id: "q1", topic: "Stance & balance",
        prompt: "Why is a balanced, shoulder-width stance a good starting point?",
        options: [
          "It keeps you stable and ready to move in any direction",
          "It makes you look taller",
          "It lets you stand still for hours without effort",
          "It is only useful for kicking",
        ],
        correctIndex: 0,
        explanation: "A stable base lets you move, protect yourself and create distance.",
      },
      {
        id: "q2", topic: "Situational awareness",
        prompt: "You sense an unsafe situation. What is usually the best first step?",
        options: [
          "Confront the person to show you aren't afraid",
          "Create distance and move toward a safe, public place",
          "Ignore the feeling and keep walking the same way",
        ],
        correctIndex: 1,
        explanation: "Early distance and getting to people or light is safer than confrontation.",
      },
      {
        id: "q3", topic: "Situational awareness",
        prompt: "What does good situational awareness involve?",
        options: [
          "Looking at your phone while you walk",
          "Wearing headphones at full volume",
          "Regularly scanning your surroundings and noting exits",
          "Only paying attention at night",
        ],
        correctIndex: 2,
        explanation: "Noticing people, exits and changes around you gives you time to act.",
      },
      {
        id: "q4", topic: "Escape principles",
        prompt: "What is the main goal of an escape technique?",
        options: [
          "To win a fight",
          "To create an opportunity to get away and reach safety",
          "To injure the other person",
          "To prove how strong you are",
        ],
        correctIndex: 1,
        explanation: "Escape techniques exist to get you out and to safety, not to fight.",
      },
    ],
  },
];

export const findAssessment = (id?: string) => assessments.find((a) => a.id === id);

// Structure guard: every assessment must have exactly 4 MCQs and 3 postures.
for (const a of assessments) {
  if (a.questions.length !== 4 || a.poseIds.length !== 3) {
    throw new Error(`Assessment "${a.id}" must have 4 questions and 3 postures.`);
  }
}
