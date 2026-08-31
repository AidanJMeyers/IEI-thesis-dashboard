'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/layout/PageHeader';
import { MeetingDetail, MeetingNotFound } from './MeetingDetail';
import { useStore } from '@/hooks/useDashboard';
import { formatDateLong } from '@/lib/utils';

export function MeetingPageClient({ id }: { id: string }) {
  const { ready, meetings } = useStore();
  if (!ready) return <LoadingState />;

  const meeting = meetings.find((m) => m.id === id);

  return (
    <>
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/meetings">
          <ArrowLeft className="h-4 w-4" />
          All meetings
        </Link>
      </Button>

      {meeting ? (
        <>
          <PageHeader title={`Meeting — ${formatDateLong(meeting.date)}`} />
          <MeetingDetail meeting={meeting} />
        </>
      ) : (
        <MeetingNotFound />
      )}
    </>
  );
}
