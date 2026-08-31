import { MeetingPageClient } from '@/components/meetings/MeetingPageClient';
import weeklyPlan from '@context/weekly-plan.json';

/**
 * Deep links for the meetings seeded from the weekly plan (ids are deterministic:
 * `meeting-w{week}`). Meetings created later are reachable from the master-detail
 * list at /meetings, which needs no route of its own.
 */
export function generateStaticParams() {
  return weeklyPlan.weeks
    .filter((w) => w.meeting)
    .map((w) => ({ id: `meeting-w${w.week}` }));
}

export default function MeetingPage({ params }: { params: { id: string } }) {
  return <MeetingPageClient id={params.id} />;
}
