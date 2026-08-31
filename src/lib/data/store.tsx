'use client';

import * as React from 'react';
import type {
  ActionItem,
  ActivityAction,
  ActivityEntry,
  BackendMode,
  ComponentStatus,
  DashboardState,
  EvaluationComponent,
  LinkType,
  Meeting,
  Note,
  Priority,
  Profile,
  ResourceLink,
  StoredFile,
  Task,
  TaskStatus,
  Week,
} from '@/lib/types';
import { buildSeedState, markCurrentWeek, SEED_VERSION } from './seed';
import { getSupabaseClient, isSupabaseConfigured, STORAGE_BUCKETS } from '@/lib/supabase/client';
import { uid } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Persistence                                                                 */
/* -------------------------------------------------------------------------- */

const STORAGE_KEY = `tcc:state:v${SEED_VERSION}`;

type TableName =
  | 'tasks'
  | 'weeks'
  | 'evaluation_components'
  | 'files'
  | 'links'
  | 'meetings'
  | 'notes'
  | 'activity_log';

type Mutation =
  | { table: TableName; op: 'upsert'; rows: Record<string, unknown>[] }
  | { table: TableName; op: 'delete'; ids: Array<string | number> };

/** Columns that only exist in the browser and must never be sent to Postgres. */
function stripLocalOnly(table: TableName, row: Record<string, unknown>) {
  if (table !== 'files') return row;
  const { local_data_url: _omit, ...rest } = row as Record<string, unknown>;
  return rest;
}

function readLocalState(): DashboardState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DashboardState;
    if (!parsed || !Array.isArray(parsed.weeks) || !parsed.weeks.length) return null;
    return parsed;
  } catch {
    // A corrupt or quota-blocked store should fall back to seed data, not crash.
    return null;
  }
}

function writeLocalState(state: DashboardState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Most likely the 5 MB quota, hit by base64 file previews. The in-memory
    // state stays correct for this session; surfaced in Settings.
    window.dispatchEvent(new CustomEvent('tcc:storage-full'));
  }
}

/* -------------------------------------------------------------------------- */
/*  Context                                                                     */
/* -------------------------------------------------------------------------- */

export interface AuthState {
  /** Null in local mode, and in Supabase mode until someone signs in. */
  userId: string | null;
  email: string | null;
  profile: Profile | null;
  /** True once the initial session lookup has settled. */
  checked: boolean;
}

export interface StoreValue extends DashboardState {
  mode: BackendMode;
  ready: boolean;
  error: string | null;

  auth: AuthState;
  signIn(email: string, password: string): Promise<string | null>;
  signOut(): Promise<void>;
  sendPasswordReset(email: string): Promise<string | null>;

  // Tasks
  addTask(input: Partial<Task> & { title: string }): Task;
  updateTask(id: string, patch: Partial<Task>): void;
  setTaskStatus(id: string, status: TaskStatus): void;
  moveTaskToWeek(id: string, weekId: number | null): void;
  deleteTask(id: string): void;
  reorderTask(id: string, targetSortOrder: number): void;

  // Evaluation components
  updateComponent(id: string, patch: Partial<EvaluationComponent>): void;

  // Weeks / meetings
  updateWeek(id: number, patch: Partial<Week>): void;
  addMeeting(input: Partial<Meeting> & { date: string }): Meeting;
  updateMeeting(id: string, patch: Partial<Meeting>): void;
  deleteMeeting(id: string): void;
  toggleActionItem(meetingId: string, index: number): void;
  promoteActionItemToTask(meetingId: string, index: number): void;

  // Files & links
  addFile(file: File, target: { taskId?: string | null; componentId?: string | null }): Promise<void>;
  deleteFile(id: string): Promise<void>;
  getFileUrl(file: StoredFile): Promise<string | null>;
  addLink(input: { title: string; url: string; link_type: LinkType; task_id?: string | null; evaluation_component_id?: string | null }): void;
  deleteLink(id: string): void;

  // Notes
  addNote(input: { title: string; content?: string; week_id?: number | null }): Note;
  updateNote(id: string, patch: Partial<Note>): void;
  deleteNote(id: string): void;

  // Housekeeping
  resetToSeed(): void;
  exportState(): string;
  importState(json: string): boolean;
  refresh(): Promise<void>;
}

const StoreContext = React.createContext<StoreValue | null>(null);

export function useStore(): StoreValue {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <DashboardProvider>');
  return ctx;
}

const EMPTY: DashboardState = {
  components: [],
  weeks: [],
  tasks: [],
  files: [],
  links: [],
  meetings: [],
  activity: [],
  notes: [],
};

/* -------------------------------------------------------------------------- */
/*  Provider                                                                    */
/* -------------------------------------------------------------------------- */

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const mode: BackendMode = isSupabaseConfigured ? 'supabase' : 'local';
  const [state, setState] = React.useState<DashboardState>(EMPTY);
  const [ready, setReady] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Latest state, readable from callbacks without adding it to every dep array.
  const stateRef = React.useRef(state);
  stateRef.current = state;

  /* ----- auth (Supabase mode only) ----- */

  const [auth, setAuth] = React.useState<AuthState>({
    userId: null,
    email: null,
    profile: null,
    // Local mode has no accounts, so the check is already done.
    checked: !isSupabaseConfigured,
  });

  React.useEffect(() => {
    if (mode !== 'supabase') return;
    const sb = getSupabaseClient();
    if (!sb) return;

    let active = true;

    void sb.auth.getSession().then(({ data }) => {
      if (!active) return;
      setAuth((a) => ({
        ...a,
        userId: data.session?.user.id ?? null,
        email: data.session?.user.email ?? null,
        checked: true,
      }));
    });

    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setAuth((a) => ({
        ...a,
        userId: session?.user.id ?? null,
        email: session?.user.email ?? null,
        checked: true,
      }));
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [mode]);

  // The profile row carries the role that RLS keys off. Without it every read
  // is denied, so surfacing its absence matters more than most fetch failures.
  React.useEffect(() => {
    if (mode !== 'supabase' || !auth.userId) {
      setAuth((a) => (a.profile ? { ...a, profile: null } : a));
      return;
    }
    const sb = getSupabaseClient();
    if (!sb) return;
    let active = true;
    void sb
      .from('profiles')
      .select('*')
      .eq('id', auth.userId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setAuth((a) => ({ ...a, profile: (data as Profile | null) ?? null }));
      });
    return () => {
      active = false;
    };
  }, [mode, auth.userId]);

  const signIn = React.useCallback<StoreValue['signIn']>(async (email, password) => {
    const sb = getSupabaseClient();
    if (!sb) return 'Supabase is not configured for this deployment.';
    const { error: err } = await sb.auth.signInWithPassword({ email, password });
    return err ? err.message : null;
  }, []);

  const signOut = React.useCallback<StoreValue['signOut']>(async () => {
    await getSupabaseClient()?.auth.signOut();
  }, []);

  const sendPasswordReset = React.useCallback<StoreValue['sendPasswordReset']>(async (email) => {
    const sb = getSupabaseClient();
    if (!sb) return 'Supabase is not configured for this deployment.';
    const { error: err } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/settings` : undefined,
    });
    return err ? err.message : null;
  }, []);

  /* ----- loading ----- */

  const loadFromSupabase = React.useCallback(async (): Promise<DashboardState> => {
    const sb = getSupabaseClient();
    if (!sb) return buildSeedState();

    const [components, weeks, tasks, files, links, meetings, activity, notes] = await Promise.all([
      sb.from('evaluation_components').select('*').order('sort_order'),
      sb.from('weeks').select('*').order('week_number'),
      sb.from('tasks').select('*').order('sort_order'),
      sb.from('files').select('*').order('uploaded_at', { ascending: false }),
      sb.from('links').select('*').order('created_at', { ascending: false }),
      sb.from('meetings').select('*').order('date'),
      sb.from('activity_log').select('*').order('created_at', { ascending: false }).limit(100),
      sb.from('notes').select('*').order('updated_at', { ascending: false }),
    ]);

    const firstError = [components, weeks, tasks, files, links, meetings, activity, notes].find(
      (r) => r.error,
    );
    if (firstError?.error) throw new Error(firstError.error.message);

    return {
      components: (components.data ?? []) as EvaluationComponent[],
      weeks: markCurrentWeek(((weeks.data ?? []) as Week[]).map(normalizeWeek)),
      tasks: (tasks.data ?? []) as Task[],
      files: (files.data ?? []) as StoredFile[],
      links: (links.data ?? []) as ResourceLink[],
      meetings: ((meetings.data ?? []) as Meeting[]).map((m) => ({
        ...m,
        attendees: m.attendees ?? [],
        action_items: (m.action_items ?? []) as ActionItem[],
      })),
      activity: (activity.data ?? []) as ActivityEntry[],
      notes: (notes.data ?? []) as Note[],
    };
  }, []);

  const refresh = React.useCallback(async () => {
    try {
      if (mode === 'supabase') {
        // Wait for the session lookup: querying before it settles hits RLS with
        // no identity and returns empty tables that look like real data.
        if (!auth.checked) return;
        if (!auth.userId) {
          // Signed out. Show the plan as seeded rather than a blank dashboard.
          setState(buildSeedState());
          setReady(true);
          return;
        }
        const next = await loadFromSupabase();
        setState(next);
      } else {
        const stored = readLocalState();
        const next = stored ? { ...stored, weeks: markCurrentWeek(stored.weeks) } : buildSeedState();
        setState(next);
      }
      setError(null);
    } catch (e) {
      // A failed remote load must not leave a blank dashboard in front of the
      // committee: fall back to seed data and say so plainly.
      setError(e instanceof Error ? e.message : 'Could not load data');
      setState(buildSeedState());
    } finally {
      setReady(true);
    }
  }, [mode, loadFromSupabase, auth.checked, auth.userId]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  /* ----- realtime (Supabase mode only) ----- */

  React.useEffect(() => {
    if (mode !== 'supabase') return;
    const sb = getSupabaseClient();
    if (!sb) return;

    const channel = sb.channel('tcc-dashboard');
    for (const table of ['tasks', 'evaluation_components', 'activity_log', 'files']) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        void refresh();
      });
    }
    channel.subscribe();
    return () => {
      void sb.removeChannel(channel);
    };
  }, [mode, refresh]);

  /* ----- writing ----- */

  const persist = React.useCallback(
    async (next: DashboardState, mutations: Mutation[]) => {
      if (mode === 'local') {
        writeLocalState(next);
        return;
      }
      const sb = getSupabaseClient();
      if (!sb) return;
      try {
        for (const m of mutations) {
          if (m.op === 'upsert') {
            const rows = m.rows.map((r) => stripLocalOnly(m.table, r));
            const { error: err } = await sb.from(m.table).upsert(rows);
            if (err) throw new Error(`${m.table}: ${err.message}`);
          } else {
            const { error: err } = await sb.from(m.table).delete().in('id', m.ids);
            if (err) throw new Error(`${m.table}: ${err.message}`);
          }
        }
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Save failed');
      }
    },
    [mode],
  );

  /**
   * Single write path. Every action produces the next state and the list of rows
   * that changed, then hands both to `persist` — so local and Supabase modes can
   * never drift apart.
   */
  const commit = React.useCallback(
    (
      producer: (draft: DashboardState) => { next: DashboardState; mutations: Mutation[] },
    ) => {
      const { next, mutations } = producer(stateRef.current);
      stateRef.current = next;
      setState(next);
      void persist(next, mutations);
    },
    [persist],
  );

  const logActivity = React.useCallback(
    (
      draft: DashboardState,
      action: ActivityAction,
      entityType: ActivityEntry['entity_type'],
      entityId: string | null,
      details: string,
    ): { activity: ActivityEntry[]; mutation: Mutation } => {
      const entry: ActivityEntry = {
        id: uid(),
        user_id: null,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
        created_at: new Date().toISOString(),
      };
      return {
        activity: [entry, ...draft.activity].slice(0, 100),
        mutation: { table: 'activity_log', op: 'upsert', rows: [entry as unknown as Record<string, unknown>] },
      };
    },
    [],
  );

  /* ----- task actions ----- */

  const addTask = React.useCallback<StoreValue['addTask']>(
    (input) => {
      const now = new Date().toISOString();
      const weekId = input.week_id ?? null;
      const siblings = stateRef.current.tasks.filter((t) => t.week_id === weekId);
      const task: Task = {
        id: uid(),
        week_id: weekId,
        evaluation_component_id: input.evaluation_component_id ?? null,
        title: input.title,
        description: input.description ?? null,
        priority: input.priority ?? 'medium',
        status: input.status ?? 'todo',
        due_date: input.due_date ?? null,
        completed_at: null,
        sort_order: siblings.length ? Math.max(...siblings.map((t) => t.sort_order)) + 1 : 0,
        created_at: now,
        updated_at: now,
      };
      commit((draft) => {
        const log = logActivity(draft, 'task_created', 'task', task.id, `Added task “${task.title}”`);
        return {
          next: { ...draft, tasks: [...draft.tasks, task], activity: log.activity },
          mutations: [
            { table: 'tasks', op: 'upsert', rows: [task as unknown as Record<string, unknown>] },
            log.mutation,
          ],
        };
      });
      return task;
    },
    [commit, logActivity],
  );

  const applyTaskPatch = React.useCallback(
    (id: string, patch: Partial<Task>, activityDetail?: { action: ActivityAction; details: string }) => {
      commit((draft) => {
        const existing = draft.tasks.find((t) => t.id === id);
        if (!existing) return { next: draft, mutations: [] };

        const becameDone = patch.status === 'done' && existing.status !== 'done';
        const leftDone = patch.status && patch.status !== 'done' && existing.status === 'done';
        const updated: Task = {
          ...existing,
          ...patch,
          completed_at: becameDone
            ? new Date().toISOString()
            : leftDone
              ? null
              : (patch.completed_at ?? existing.completed_at),
          updated_at: new Date().toISOString(),
        };

        const tasks = draft.tasks.map((t) => (t.id === id ? updated : t));
        const detail =
          activityDetail ??
          (becameDone
            ? { action: 'task_completed' as ActivityAction, details: `Completed “${updated.title}”` }
            : { action: 'task_updated' as ActivityAction, details: `Updated “${updated.title}”` });

        const log = logActivity(draft, detail.action, 'task', id, detail.details);
        return {
          next: { ...draft, tasks, activity: log.activity },
          mutations: [
            { table: 'tasks', op: 'upsert', rows: [updated as unknown as Record<string, unknown>] },
            log.mutation,
          ],
        };
      });
    },
    [commit, logActivity],
  );

  const updateTask = React.useCallback<StoreValue['updateTask']>(
    (id, patch) => applyTaskPatch(id, patch),
    [applyTaskPatch],
  );

  const setTaskStatus = React.useCallback<StoreValue['setTaskStatus']>(
    (id, status) => applyTaskPatch(id, { status }),
    [applyTaskPatch],
  );

  const moveTaskToWeek = React.useCallback<StoreValue['moveTaskToWeek']>(
    (id, weekId) => {
      const week = stateRef.current.weeks.find((w) => w.id === weekId);
      applyTaskPatch(
        id,
        { week_id: weekId, due_date: week?.end_date ?? null },
        {
          action: 'task_updated',
          details: week ? `Moved a task to Week ${week.week_number}` : 'Moved a task to the backlog',
        },
      );
    },
    [applyTaskPatch],
  );

  const reorderTask = React.useCallback<StoreValue['reorderTask']>(
    (id, targetSortOrder) => applyTaskPatch(id, { sort_order: targetSortOrder }),
    [applyTaskPatch],
  );

  const deleteTask = React.useCallback<StoreValue['deleteTask']>(
    (id) => {
      commit((draft) => {
        const task = draft.tasks.find((t) => t.id === id);
        if (!task) return { next: draft, mutations: [] };
        const log = logActivity(draft, 'task_deleted', 'task', id, `Deleted “${task.title}”`);
        return {
          next: {
            ...draft,
            tasks: draft.tasks.filter((t) => t.id !== id),
            files: draft.files.filter((f) => f.task_id !== id),
            links: draft.links.filter((l) => l.task_id !== id),
            activity: log.activity,
          },
          mutations: [{ table: 'tasks', op: 'delete', ids: [id] }, log.mutation],
        };
      });
    },
    [commit, logActivity],
  );

  /* ----- component actions ----- */

  const updateComponent = React.useCallback<StoreValue['updateComponent']>(
    (id, patch) => {
      commit((draft) => {
        const existing = draft.components.find((c) => c.id === id);
        if (!existing) return { next: draft, mutations: [] };
        const updated = { ...existing, ...patch };
        const log = logActivity(
          draft,
          'component_updated',
          'component',
          id,
          `${updated.name}: ${patch.status ? `status → ${patch.status.replace('_', ' ')}` : 'notes updated'}`,
        );
        return {
          next: {
            ...draft,
            components: draft.components.map((c) => (c.id === id ? updated : c)),
            activity: log.activity,
          },
          mutations: [
            {
              table: 'evaluation_components',
              op: 'upsert',
              rows: [updated as unknown as Record<string, unknown>],
            },
            log.mutation,
          ],
        };
      });
    },
    [commit, logActivity],
  );

  /* ----- week & meeting actions ----- */

  const updateWeek = React.useCallback<StoreValue['updateWeek']>(
    (id, patch) => {
      commit((draft) => {
        const existing = draft.weeks.find((w) => w.id === id);
        if (!existing) return { next: draft, mutations: [] };
        const updated = { ...existing, ...patch };
        return {
          next: { ...draft, weeks: draft.weeks.map((w) => (w.id === id ? updated : w)) },
          mutations: [
            { table: 'weeks', op: 'upsert', rows: [serializeWeek(updated) as unknown as Record<string, unknown>] },
          ],
        };
      });
    },
    [commit],
  );

  const addMeeting = React.useCallback<StoreValue['addMeeting']>(
    (input) => {
      const meeting: Meeting = {
        id: uid(),
        week_id: input.week_id ?? null,
        date: input.date,
        attendees: input.attendees ?? ['Aidan Meyers', 'Dr. Shan-Estelle Brown'],
        agenda: input.agenda ?? null,
        notes: input.notes ?? null,
        action_items: input.action_items ?? [],
        created_at: new Date().toISOString(),
      };
      commit((draft) => {
        const log = logActivity(draft, 'meeting_logged', 'meeting', meeting.id, `Logged a meeting for ${meeting.date}`);
        return {
          next: { ...draft, meetings: [...draft.meetings, meeting], activity: log.activity },
          mutations: [
            { table: 'meetings', op: 'upsert', rows: [meeting as unknown as Record<string, unknown>] },
            log.mutation,
          ],
        };
      });
      return meeting;
    },
    [commit, logActivity],
  );

  const updateMeeting = React.useCallback<StoreValue['updateMeeting']>(
    (id, patch) => {
      commit((draft) => {
        const existing = draft.meetings.find((m) => m.id === id);
        if (!existing) return { next: draft, mutations: [] };
        const updated = { ...existing, ...patch };
        const log = logActivity(draft, 'meeting_updated', 'meeting', id, `Updated meeting notes for ${updated.date}`);
        return {
          next: {
            ...draft,
            meetings: draft.meetings.map((m) => (m.id === id ? updated : m)),
            activity: log.activity,
          },
          mutations: [
            { table: 'meetings', op: 'upsert', rows: [updated as unknown as Record<string, unknown>] },
            log.mutation,
          ],
        };
      });
    },
    [commit, logActivity],
  );

  const deleteMeeting = React.useCallback<StoreValue['deleteMeeting']>(
    (id) => {
      commit((draft) => ({
        next: { ...draft, meetings: draft.meetings.filter((m) => m.id !== id) },
        mutations: [{ table: 'meetings', op: 'delete', ids: [id] }],
      }));
    },
    [commit],
  );

  const toggleActionItem = React.useCallback<StoreValue['toggleActionItem']>(
    (meetingId, index) => {
      const meeting = stateRef.current.meetings.find((m) => m.id === meetingId);
      if (!meeting) return;
      const items = meeting.action_items.map((it, i) => (i === index ? { ...it, done: !it.done } : it));
      updateMeeting(meetingId, { action_items: items });
    },
    [updateMeeting],
  );

  const promoteActionItemToTask = React.useCallback<StoreValue['promoteActionItemToTask']>(
    (meetingId, index) => {
      const meeting = stateRef.current.meetings.find((m) => m.id === meetingId);
      const item = meeting?.action_items[index];
      if (!meeting || !item) return;
      const week = stateRef.current.weeks.find((w) => w.id === meeting.week_id) ??
        stateRef.current.weeks.find((w) => w.is_current);
      addTask({
        title: item.item,
        description: `Action item from the ${meeting.date} meeting.`,
        week_id: week?.id ?? null,
        due_date: item.due ?? week?.end_date ?? null,
        priority: 'high',
      });
    },
    [addTask],
  );

  /* ----- files ----- */

  const addFile = React.useCallback<StoreValue['addFile']>(
    async (file, target) => {
      const id = uid();
      const path = `${target.componentId ?? target.taskId ?? 'general'}/${id}-${file.name}`;
      let dataUrl: string | null = null;

      if (mode === 'supabase') {
        const sb = getSupabaseClient();
        if (sb) {
          const { error: upErr } = await sb.storage
            .from(STORAGE_BUCKETS.deliverables)
            .upload(path, file, { upsert: false });
          if (upErr) {
            setError(`Upload failed: ${upErr.message}`);
            return;
          }
        }
      } else {
        // Local mode keeps a data URL so the file is still previewable and
        // downloadable with no backend. Capped to keep localStorage usable.
        const MAX_INLINE_BYTES = 2 * 1024 * 1024;
        if (file.size <= MAX_INLINE_BYTES) {
          dataUrl = await new Promise<string | null>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
          });
        }
      }

      const record: StoredFile = {
        id,
        task_id: target.taskId ?? null,
        evaluation_component_id: target.componentId ?? null,
        file_name: file.name,
        file_path: path,
        file_size: file.size,
        file_type: file.type || null,
        uploaded_by: null,
        uploaded_at: new Date().toISOString(),
        local_data_url: dataUrl,
      };

      commit((draft) => {
        const log = logActivity(draft, 'file_uploaded', 'file', id, `Uploaded ${file.name}`);
        return {
          next: { ...draft, files: [record, ...draft.files], activity: log.activity },
          mutations: [
            { table: 'files', op: 'upsert', rows: [record as unknown as Record<string, unknown>] },
            log.mutation,
          ],
        };
      });
    },
    [commit, logActivity, mode],
  );

  const deleteFile = React.useCallback<StoreValue['deleteFile']>(
    async (id) => {
      const file = stateRef.current.files.find((f) => f.id === id);
      if (!file) return;
      if (mode === 'supabase') {
        const sb = getSupabaseClient();
        await sb?.storage.from(STORAGE_BUCKETS.deliverables).remove([file.file_path]);
      }
      commit((draft) => {
        const log = logActivity(draft, 'file_deleted', 'file', id, `Removed ${file.file_name}`);
        return {
          next: { ...draft, files: draft.files.filter((f) => f.id !== id), activity: log.activity },
          mutations: [{ table: 'files', op: 'delete', ids: [id] }, log.mutation],
        };
      });
    },
    [commit, logActivity, mode],
  );

  const getFileUrl = React.useCallback<StoreValue['getFileUrl']>(
    async (file) => {
      if (file.local_data_url) return file.local_data_url;
      const sb = getSupabaseClient();
      if (!sb) return null;
      const { data } = await sb.storage
        .from(STORAGE_BUCKETS.deliverables)
        .createSignedUrl(file.file_path, 60 * 60);
      return data?.signedUrl ?? null;
    },
    [],
  );

  /* ----- links ----- */

  const addLink = React.useCallback<StoreValue['addLink']>(
    (input) => {
      const link: ResourceLink = {
        id: uid(),
        task_id: input.task_id ?? null,
        evaluation_component_id: input.evaluation_component_id ?? null,
        title: input.title,
        url: input.url,
        link_type: input.link_type,
        created_at: new Date().toISOString(),
      };
      commit((draft) => {
        const log = logActivity(draft, 'link_added', 'link', link.id, `Linked “${link.title}”`);
        return {
          next: { ...draft, links: [link, ...draft.links], activity: log.activity },
          mutations: [
            { table: 'links', op: 'upsert', rows: [link as unknown as Record<string, unknown>] },
            log.mutation,
          ],
        };
      });
    },
    [commit, logActivity],
  );

  const deleteLink = React.useCallback<StoreValue['deleteLink']>(
    (id) => {
      commit((draft) => ({
        next: { ...draft, links: draft.links.filter((l) => l.id !== id) },
        mutations: [{ table: 'links', op: 'delete', ids: [id] }],
      }));
    },
    [commit],
  );

  /* ----- notes ----- */

  const addNote = React.useCallback<StoreValue['addNote']>(
    (input) => {
      const now = new Date().toISOString();
      const note: Note = {
        id: uid(),
        week_id: input.week_id ?? null,
        title: input.title,
        content: input.content ?? null,
        is_pinned: false,
        created_at: now,
        updated_at: now,
      };
      commit((draft) => {
        const log = logActivity(draft, 'note_created', 'note', note.id, `Added note “${note.title}”`);
        return {
          next: { ...draft, notes: [note, ...draft.notes], activity: log.activity },
          mutations: [
            { table: 'notes', op: 'upsert', rows: [note as unknown as Record<string, unknown>] },
            log.mutation,
          ],
        };
      });
      return note;
    },
    [commit, logActivity],
  );

  const updateNote = React.useCallback<StoreValue['updateNote']>(
    (id, patch) => {
      commit((draft) => {
        const existing = draft.notes.find((n) => n.id === id);
        if (!existing) return { next: draft, mutations: [] };
        const updated = { ...existing, ...patch, updated_at: new Date().toISOString() };
        return {
          next: { ...draft, notes: draft.notes.map((n) => (n.id === id ? updated : n)) },
          mutations: [
            { table: 'notes', op: 'upsert', rows: [updated as unknown as Record<string, unknown>] },
          ],
        };
      });
    },
    [commit],
  );

  const deleteNote = React.useCallback<StoreValue['deleteNote']>(
    (id) => {
      commit((draft) => ({
        next: { ...draft, notes: draft.notes.filter((n) => n.id !== id) },
        mutations: [{ table: 'notes', op: 'delete', ids: [id] }],
      }));
    },
    [commit],
  );

  /* ----- housekeeping ----- */

  const resetToSeed = React.useCallback(() => {
    const fresh = buildSeedState();
    stateRef.current = fresh;
    setState(fresh);
    if (mode === 'local') writeLocalState(fresh);
  }, [mode]);

  const exportState = React.useCallback(() => JSON.stringify(stateRef.current, null, 2), []);

  const importState = React.useCallback(
    (json: string) => {
      try {
        const parsed = JSON.parse(json) as DashboardState;
        if (!parsed.weeks || !Array.isArray(parsed.weeks)) return false;
        const next = { ...EMPTY, ...parsed, weeks: markCurrentWeek(parsed.weeks) };
        stateRef.current = next;
        setState(next);
        if (mode === 'local') writeLocalState(next);
        return true;
      } catch {
        return false;
      }
    },
    [mode],
  );

  const value: StoreValue = {
    ...state,
    mode,
    ready,
    error,
    auth,
    signIn,
    signOut,
    sendPasswordReset,
    addTask,
    updateTask,
    setTaskStatus,
    moveTaskToWeek,
    deleteTask,
    reorderTask,
    updateComponent,
    updateWeek,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    toggleActionItem,
    promoteActionItemToTask,
    addFile,
    deleteFile,
    getFileUrl,
    addLink,
    deleteLink,
    addNote,
    updateNote,
    deleteNote,
    resetToSeed,
    exportState,
    importState,
    refresh,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

/* -------------------------------------------------------------------------- */
/*  Row shape helpers                                                           */
/* -------------------------------------------------------------------------- */

function normalizeWeek(w: Week): Week {
  return {
    ...w,
    key_decisions: w.key_decisions ?? [],
    deliverables: w.deliverables ?? [],
  };
}

/** `is_current` is derived from today's date, never stored. */
function serializeWeek(w: Week) {
  const { is_current: _derived, ...rest } = w;
  return rest;
}

export type { Priority, TaskStatus, ComponentStatus };
