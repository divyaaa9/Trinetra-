import { Navigate, Route, Routes } from "react-router-dom";
import "./styles/combat.css";
import CombatLayout from "./components/CombatLayout";
import DashboardPage from "./pages/DashboardPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import { AcademyPage, CategoryPage, LessonPage } from "./pages/AcademyPages";
import { AchievementsPage, AssessmentsPage, ProgressPage } from "./pages/PlaceholderPages";

/**
 * Netra 2 — Combat Training.
 *
 * Mount in the parent app (inside its existing <BrowserRouter>) with:
 *   <Route path="/netra-2/*" element={<CombatNetraRoutes />} />
 *
 * Child routes below are relative to that "/netra-2" mount point.
 */
export default function CombatNetraRoutes() {
  return (
    <Routes>
      <Route element={<CombatLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="academy" element={<AcademyPage />} />
        <Route path="academy/:categoryId" element={<CategoryPage />} />
        <Route path="academy/:categoryId/lessons/:lessonId" element={<LessonPage />} />
        <Route path="assessments" element={<AssessmentsPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="achievements" element={<AchievementsPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export { CombatNetraRoutes };
