// Types mirror the Supabase schema in supabase/migrations/001_initial_schema.sql.
// The same shapes are used by the local (localStorage) adapter so the UI never
// needs to know which backend it is talking to.

export type Semester = 'fall_2026' | 'spring_2027';
export type ComponentStatus = 'not_started' | 'in_progress' | 'submitted' | 'graded';
export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type LinkType = 'document' | 'github' | 'drive' | 'zotero' | 'redcap' | 'other';
export type Role = 'student' | 'sponsor' | 'committee' | 'external';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  avatar_url?: string | null;
  created_at: string;
}

export interface EvaluationComponent {
  id: string;
  semester: Semester;
  name: string;
  weight: number;
  description: string | null;
  due_date: string | null;
  status: ComponentStatus;
  grade_notes: string | null;
  sort_order: number;
}

export interface Week {
  id: number;
  week_number: number;
  start_date: string;
  end_date: string;
  phase: string;
  title: string;
  has_meeting: boolean;
  meeting_agenda: string | null;
  meeting_notes: string | null;
  meeting_action_items: string | null;
  key_decisions: string[];
  deliverables: string[];
  is_current: boolean;
}

export interface Task {
  id: string;
  week_id: number | null;
  evaluation_component_id: string | null;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  due_date: string | null;
  completed_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface StoredFile {
  id: string;
  task_id: string | null;
  evaluation_component_id: string | null;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
  /** Local mode only: data URL so the file stays previewable without Storage. */
  local_data_url?: string | null;
  /**
   * Seeded deliverables that ship with the app, served from /public. Checked
   * before Storage so they open in either backend mode without an upload.
   */
  public_url?: string | null;
}

export interface ResourceLink {
  id: string;
  task_id: string | null;
  evaluation_component_id: string | null;
  title: string;
  url: string;
  link_type: LinkType;
  created_at: string;
}

export interface ActionItem {
  item: string;
  owner: string;
  due: string | null;
  done: boolean;
}

export interface Meeting {
  id: string;
  week_id: number | null;
  date: string;
  attendees: string[];
  agenda: string | null;
  notes: string | null;
  action_items: ActionItem[];
  created_at: string;
}

export type ActivityAction =
  | 'task_created'
  | 'task_completed'
  | 'task_updated'
  | 'task_deleted'
  | 'file_uploaded'
  | 'file_deleted'
  | 'link_added'
  | 'link_deleted'
  | 'meeting_logged'
  | 'meeting_updated'
  | 'component_updated'
  | 'note_created'
  | 'note_updated';

export interface ActivityEntry {
  id: string;
  user_id: string | null;
  action: ActivityAction;
  entity_type: 'task' | 'file' | 'link' | 'meeting' | 'component' | 'note' | null;
  entity_id: string | null;
  details: string | null;
  created_at: string;
}

export interface Note {
  id: string;
  week_id: number | null;
  title: string;
  content: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardState {
  components: EvaluationComponent[];
  weeks: Week[];
  tasks: Task[];
  files: StoredFile[];
  links: ResourceLink[];
  meetings: Meeting[];
  activity: ActivityEntry[];
  notes: Note[];
}

export type BackendMode = 'local' | 'supabase';
