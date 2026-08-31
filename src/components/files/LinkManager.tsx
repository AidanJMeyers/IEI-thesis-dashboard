'use client';

import * as React from 'react';
import {
  Check,
  Copy,
  Database,
  ExternalLink,
  FileText,
  FolderOpen,
  Github,
  Library,
  Link2,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Field, Input, Select } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useFiles } from '@/hooks/useDashboard';
import type { LinkType, ResourceLink } from '@/lib/types';
import { cn } from '@/lib/utils';

export const LINK_TYPE_LABEL: Record<LinkType, string> = {
  document: 'Document',
  github: 'GitHub',
  drive: 'Drive',
  zotero: 'Zotero',
  redcap: 'REDCap',
  other: 'Other',
};

const LINK_TYPE_ICON: Record<LinkType, React.ComponentType<{ className?: string }>> = {
  document: FileText,
  github: Github,
  drive: FolderOpen,
  zotero: Library,
  redcap: Database,
  other: Link2,
};

/** Guesses the link type from the host so the picker is usually already right. */
function inferType(url: string): LinkType {
  const u = url.toLowerCase();
  if (u.includes('github.com')) return 'github';
  if (u.includes('drive.google.com')) return 'drive';
  if (u.includes('docs.google.com')) return 'document';
  if (u.includes('zotero.org')) return 'zotero';
  if (u.includes('redcap')) return 'redcap';
  return 'document';
}

export function AddLinkDialog({
  open,
  onOpenChange,
  target,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target?: { taskId?: string | null; componentId?: string | null };
}) {
  const { addLink } = useFiles();
  const [title, setTitle] = React.useState('');
  const [url, setUrl] = React.useState('');
  const [type, setType] = React.useState<LinkType>('document');
  const [touchedType, setTouchedType] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setTitle('');
    setUrl('');
    setType('document');
    setTouchedType(false);
  }, [open]);

  function handleUrlChange(value: string) {
    setUrl(value);
    if (!touchedType) setType(inferType(value));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;
    const normalized = /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
    addLink({
      title: title.trim() || normalized.replace(/^https?:\/\//, '').slice(0, 60),
      url: normalized,
      link_type: type,
      task_id: target?.taskId ?? null,
      evaluation_component_id: target?.componentId ?? null,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a link</DialogTitle>
          <DialogDescription>
            Google Docs, the analysis repo, a Zotero collection, REDCap — anything the committee
            might need to open.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <Field label="URL" htmlFor="link-url">
            <Input
              id="link-url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://docs.google.com/document/…"
              autoFocus
              required
            />
          </Field>
          <Field label="Title" htmlFor="link-title" hint="Left blank, the URL is used.">
            <Input
              id="link-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="IEI Annotated Bibliography (working draft)"
            />
          </Field>
          <Field label="Type" htmlFor="link-type">
            <Select
              id="link-type"
              value={type}
              onChange={(e) => {
                setTouchedType(true);
                setType(e.target.value as LinkType);
              }}
            >
              {(Object.keys(LINK_TYPE_LABEL) as LinkType[]).map((t) => (
                <option key={t} value={t}>
                  {LINK_TYPE_LABEL[t]}
                </option>
              ))}
            </Select>
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add link</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function LinkRow({ link, readOnly = false }: { link: ResourceLink; readOnly?: boolean }) {
  const { deleteLink } = useFiles();
  const Icon = LINK_TYPE_ICON[link.link_type];
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked; the link itself is still right there.
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-md border border-hairline/60 bg-white px-3 py-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-brand-50 text-accent">
        <Icon className="h-4 w-4" />
      </span>
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 flex-1 focus-visible:outline-none"
      >
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium text-ink hover:text-accent">{link.title}</span>
          <ExternalLink className="h-3 w-3 shrink-0 text-slate-400" />
        </span>
        <span className="block truncate text-xs text-muted-foreground">{link.url}</span>
      </a>
      <Badge variant="outline" size="sm" className="hidden shrink-0 sm:inline-flex">
        {LINK_TYPE_LABEL[link.link_type]}
      </Badge>
      <Button size="icon" variant="ghost" onClick={() => void copy()} aria-label="Copy URL">
        {copied ? <Check className="h-4 w-4 text-success-ink" /> : <Copy className="h-4 w-4" />}
      </Button>
      {!readOnly ? (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => deleteLink(link.id)}
          aria-label={`Remove ${link.title}`}
          className="text-slate-400 hover:bg-danger-soft hover:text-danger-ink"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}

export function LinkList({
  links,
  readOnly = false,
  emptyDescription = 'Add the Google Doc, repo, or Zotero collection you are working in.',
}: {
  links: ResourceLink[];
  readOnly?: boolean;
  emptyDescription?: string;
}) {
  if (!links.length) {
    return <EmptyState icon={Link2} title="No links yet" description={emptyDescription} />;
  }
  return (
    <div className="space-y-2">
      {links.map((l) => (
        <LinkRow key={l.id} link={l} readOnly={readOnly} />
      ))}
    </div>
  );
}

/** Compact "Add link" button for cards. */
export function AddLinkButton({
  target,
  className,
}: {
  target?: { taskId?: string | null; componentId?: string | null };
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} className={cn(className)}>
        <Plus className="h-3.5 w-3.5" />
        Link
      </Button>
      <AddLinkDialog open={open} onOpenChange={setOpen} target={target} />
    </>
  );
}
