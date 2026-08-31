'use client';

import * as React from 'react';
import { AlertTriangle, Database, Download, HardDrive, RotateCcw, Upload } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Field, Input } from '@/components/ui/form';
import { LoadingState } from '@/components/ui/empty-state';
import { AuthPanel } from '@/components/auth/AuthPanel';
import { useStore } from '@/hooks/useDashboard';
import { COMMITTEE, EXTERNAL_GUIDANCE, STUDENT, THESIS } from '@/lib/thesis';
import { formatDateLong, toISODate, today } from '@/lib/utils';

export default function SettingsPage() {
  const store = useStore();
  const { ready, mode, weeks, tasks, components, files, links, meetings, notes } = store;
  const [importError, setImportError] = React.useState<string | null>(null);
  const [confirmReset, setConfirmReset] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  if (!ready) return <LoadingState />;

  function download(filename: string, content: string, type = 'application/json') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportJson() {
    download(`thesis-command-center-${toISODate(today())}.json`, store.exportState());
  }

  function exportTasksCsv() {
    const weekById = new Map(weeks.map((w) => [w.id, w]));
    const componentById = new Map(components.map((c) => [c.id, c]));
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = [
      'week_number',
      'week_title',
      'phase',
      'task',
      'component',
      'priority',
      'status',
      'due_date',
      'completed_at',
    ];
    const rows = tasks.map((t) => {
      const w = t.week_id != null ? weekById.get(t.week_id) : undefined;
      const c = t.evaluation_component_id ? componentById.get(t.evaluation_component_id) : undefined;
      return [
        w?.week_number ?? '',
        w?.title ?? '',
        w?.phase ?? '',
        t.title,
        c?.name ?? '',
        t.priority,
        t.status,
        t.due_date ?? '',
        t.completed_at ?? '',
      ].map(esc).join(',');
    });
    download(
      `thesis-tasks-${toISODate(today())}.csv`,
      [header.join(','), ...rows].join('\n'),
      'text/csv',
    );
  }

  function exportTimelineCsv() {
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = ['week_number', 'start_date', 'end_date', 'phase', 'title', 'meeting', 'deliverables'];
    const rows = weeks.map((w) =>
      [
        w.week_number,
        w.start_date,
        w.end_date,
        w.phase,
        w.title,
        w.has_meeting ? 'yes' : 'no',
        w.deliverables.join('; '),
      ].map(esc).join(','),
    );
    download(
      `thesis-timeline-${toISODate(today())}.csv`,
      [header.join(','), ...rows].join('\n'),
      'text/csv',
    );
  }

  async function handleImport(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    const text = await file.text();
    setImportError(store.importState(text) ? null : 'That file is not a valid dashboard export.');
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="How this dashboard stores its data, who can see it, and how to get the data back out."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              {mode === 'supabase' ? (
                <Database className="h-4 w-4 text-accent" />
              ) : (
                <HardDrive className="h-4 w-4 text-accent" />
              )}
              Storage mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge variant={mode === 'supabase' ? 'success' : 'warning'}>
              {mode === 'supabase' ? 'Supabase — shared and live' : 'Local — this browser only'}
            </Badge>

            {mode === 'local' ? (
              <>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  The dashboard seeded itself from the plan files and saves your edits in this
                  browser&rsquo;s localStorage. Nothing is shared, nothing syncs between devices, and
                  clearing site data wipes it. That is fine for solo use and for showing the plan on
                  a screen — but committee members will each see a fresh copy of the seed.
                </p>
                <div className="rounded-md border border-hairline/60 bg-surface p-3 text-sm">
                  <p className="font-medium text-brand-800">To make it shared and live</p>
                  <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-muted-foreground">
                    <li>Create a free Supabase project.</li>
                    <li>
                      Run <code className="text-xs">supabase/migrations/001_initial_schema.sql</code> in
                      the SQL editor.
                    </li>
                    <li>
                      Put the URL and anon key in <code className="text-xs">.env.local</code>.
                    </li>
                    <li>
                      Run <code className="text-xs">pnpm setup:storage</code> then{' '}
                      <code className="text-xs">pnpm seed</code>.
                    </li>
                  </ol>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Export your local data first if you have edits worth keeping.
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Connected to Supabase. Row Level Security controls who can read and write; realtime
                is enabled on tasks, components, files, and the activity log, so committee members
                see changes without refreshing.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>What is in here</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <Stat label="Weeks" value={weeks.length} />
              <Stat label="Tasks" value={tasks.length} />
              <Stat label="Components" value={components.length} />
              <Stat label="Meetings" value={meetings.length} />
              <Stat label="Files" value={files.length} />
              <Stat label="Links" value={links.length} />
              <Stat label="Notes" value={notes.length} />
              <Stat label="Today" value={formatDateLong(toISODate(today()))} />
            </dl>
          </CardContent>
        </Card>

        <AuthPanel />

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Export</CardTitle>
            <p className="text-xs text-muted-foreground">
              Take the plan into Excel, or keep a backup you can restore from.
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportTasksCsv}>
              <Download className="h-4 w-4" />
              Tasks (CSV)
            </Button>
            <Button variant="outline" onClick={exportTimelineCsv}>
              <Download className="h-4 w-4" />
              Timeline (CSV)
            </Button>
            <Button variant="outline" onClick={exportJson}>
              <Download className="h-4 w-4" />
              Full backup (JSON)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Restore &amp; reset</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4" />
                Import a backup
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => void handleImport(e.target.files)}
              />

              {confirmReset ? (
                <>
                  <Button
                    variant="danger"
                    onClick={() => {
                      store.resetToSeed();
                      setConfirmReset(false);
                    }}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Yes, discard my changes
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmReset(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button variant="ghost" onClick={() => setConfirmReset(true)}>
                  <RotateCcw className="h-4 w-4" />
                  Reset to the seeded plan
                </Button>
              )}
            </div>

            {importError ? <p className="text-sm text-danger-ink">{importError}</p> : null}
            {confirmReset ? (
              <p className="text-sm text-danger-ink">
                This replaces everything with the original 33-week plan. Export a backup first if you
                have edits worth keeping.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>People &amp; access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Student">
                <Input readOnly value={`${STUDENT.name} — ${STUDENT.email}`} className="bg-surface" />
              </Field>
              <Field label="Program">
                <Input readOnly value={`${THESIS.program} · ${THESIS.course_fall} / ${THESIS.course_spring}`} className="bg-surface" />
              </Field>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Roles the database enforces
              </p>
              <div className="space-y-2 text-sm">
                <RoleRow role="student" who={STUDENT.name} access="Full read and write on everything." />
                {COMMITTEE.map((m) => (
                  <RoleRow
                    key={m.name}
                    role={m.role === 'Thesis Sponsor' ? 'sponsor' : 'committee'}
                    who={m.name}
                    access="Read everything; can add meeting notes."
                  />
                ))}
                <RoleRow
                  role="external"
                  who={EXTERNAL_GUIDANCE.name}
                  access="Read evaluation components, tasks, and files only."
                />
              </div>
            </div>

            <div className="rounded-md border border-hairline/60 bg-surface p-3 text-sm">
              <p className="font-medium text-brand-800">Inviting committee members</p>
              <p className="mt-1 leading-relaxed text-muted-foreground">
                {mode === 'supabase'
                  ? 'Invite them from the Supabase dashboard under Authentication → Users → Invite. A trigger creates their profile with the read-only committee role; promote anyone who needs more with a single UPDATE. Keep public signups turned off so the trigger only ever fires for people you invited.'
                  : 'Not available in local mode — there are no accounts. Connect Supabase first, then invite from Authentication → Users. Until then, share the read-only committee view URL.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between border-b border-hairline/40 pb-1">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums text-brand-800">{value}</dd>
    </div>
  );
}

function RoleRow({ role, who, access }: { role: string; who: string; access: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-2 rounded-md border border-hairline/50 px-3 py-2">
      <Badge variant="outline" size="sm">
        {role}
      </Badge>
      <span className="font-medium text-ink">{who}</span>
      <span className="text-xs text-muted-foreground">{access}</span>
    </div>
  );
}
