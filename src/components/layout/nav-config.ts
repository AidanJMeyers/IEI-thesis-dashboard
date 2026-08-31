import type * as React from 'react';
import {
  CalendarDays,
  ClipboardList,
  FileText,
  FlaskConical,
  GanttChartSquare,
  LayoutDashboard,
  Settings,
  Target,
  Users,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const NAV_SECTIONS: Array<{ heading: string; items: NavItem[] }> = [
  {
    heading: 'Overview',
    items: [
      {
        href: '/',
        label: 'Dashboard',
        icon: LayoutDashboard,
        description: 'Where the thesis stands today',
      },
      {
        href: '/timeline',
        label: 'Timeline',
        icon: GanttChartSquare,
        description: 'All 33 weeks against every deliverable',
      },
    ],
  },
  {
    heading: 'Work',
    items: [
      {
        href: '/weeks',
        label: 'Weekly Planner',
        icon: CalendarDays,
        description: 'Week-by-week plan and meeting prep',
      },
      {
        href: '/tasks',
        label: 'Task Board',
        icon: ClipboardList,
        description: 'Kanban across the whole thesis',
      },
      {
        href: '/evaluation',
        label: 'Evaluation',
        icon: Target,
        description: 'Graded components and weights',
      },
      {
        href: '/files',
        label: 'Files & Links',
        icon: FileText,
        description: 'Deliverables and reference material',
      },
      {
        href: '/meetings',
        label: 'Meetings',
        icon: Users,
        description: 'Agendas, notes, action items',
      },
    ],
  },
  {
    heading: 'Context',
    items: [
      {
        href: '/study',
        label: 'BREATHE-CC Study',
        icon: FlaskConical,
        description: 'The cohort this thesis is embedded in',
      },
      {
        href: '/committee',
        label: 'Committee View',
        icon: Users,
        description: 'Read-only progress summary',
      },
      {
        href: '/settings',
        label: 'Settings',
        icon: Settings,
        description: 'Data, export, and access',
      },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);
