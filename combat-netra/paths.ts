/** All routes live under /netra-2. Change BASE here if the parent mounts it elsewhere. */
export const BASE = "/netra-2";

export const paths = {
  home: "/",
  dashboard: `${BASE}/dashboard`,
  academy: `${BASE}/academy`,
  category: (categoryId: string) => `${BASE}/academy/${categoryId}`,
  lesson: (categoryId: string, lessonId: string) =>
    `${BASE}/academy/${categoryId}/lessons/${lessonId}`,
  assessments: `${BASE}/assessments`,
  progress: `${BASE}/progress`,
  achievements: `${BASE}/achievements`,
  leaderboard: `${BASE}/leaderboard`,
};
