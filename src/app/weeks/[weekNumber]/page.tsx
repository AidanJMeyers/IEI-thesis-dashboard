import { WeekDetail } from '@/components/weeks/WeekDetail';
import weeklyPlan from '@context/weekly-plan.json';

/**
 * The plan has a fixed 33 weeks, so every week page can be generated at build
 * time. This is what lets the GitHub Pages static export carry the full planner.
 */
export function generateStaticParams() {
  return weeklyPlan.weeks.map((w) => ({ weekNumber: String(w.week) }));
}

export function generateMetadata({ params }: { params: { weekNumber: string } }) {
  const week = weeklyPlan.weeks.find((w) => String(w.week) === params.weekNumber);
  return { title: week ? `Week ${week.week} — ${week.title}` : `Week ${params.weekNumber}` };
}

export default function WeekPage({ params }: { params: { weekNumber: string } }) {
  return <WeekDetail weekNumber={Number(params.weekNumber)} />;
}
