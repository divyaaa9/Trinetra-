import {
  AchievementsPreview,
  AcademyPreview,
  ContinueLearningCard,
  TrainingLevels,
  TrainingOverview,
  Welcome,
  WeeklyActivity,
} from "../components/DashboardSections";
import { LeaderboardPreview } from "../components/leaderboard";
import { PageTransition } from "../components/ui";

export default function DashboardPage() {
  return (
    <PageTransition>
      <Welcome />
      <TrainingOverview />
      <ContinueLearningCard />
      <AcademyPreview />
      <TrainingLevels />
      <WeeklyActivity />
      <LeaderboardPreview />
      <AchievementsPreview />
    </PageTransition>
  );
}
