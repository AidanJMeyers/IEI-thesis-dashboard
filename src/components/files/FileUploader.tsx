'use client';

import * as React from 'react';
import { Download, FileText, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useFiles, useStore } from '@/hooks/useDashboard';
import type { StoredFile } from '@/lib/types';
import { cn, formatBytes, formatTimestamp } from '@/lib/utils';

export const ACCEPTED_TYPES =
  '.pdf,.docx,.doc,.xlsx,.xls,.csv,.pptx,.ppt,.md,.txt,.R,.r,.Rmd,.sas,.py,.ipynb,.json,.zip,.png,.jpg,.jpeg';

export interface AttachTarget {
  taskId?: string | null;
  componentId?: string | null;
}

/** Drag-and-drop upload area. */
export function FileUploader({
  target,
  className,
  compact = false,
}: {
  target: AttachTarget;
  className?: string;
  compact?: boolean;
}) {
  const { addFile } = useFiles();
  const { mode } = useStore();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  async function handleFiles(list: FileList | null) {
    if (!list?.length) return;
    setBusy(true);
    try {
      for (const file of Array.from(list)) {
        await addFile(file, target);
      }
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  if (compact) {
    return (
      <>
        <Button
          size="sm"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={className}
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
          File
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        'rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors',
        dragging ? 'border-accent bg-brand-50' : 'border-hairline bg-surface/60',
        className,
      )}
    >
      <UploadCloud className={cn('mx-auto h-7 w-7', dragging ? 'text-accent' : 'text-slate-400')} />
      <p className="mt-2 text-sm font-medium text-brand-800">
        Drop deliverables here, or{' '}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-accent underline underline-offset-2"
        >
          browse
        </button>
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        PDF, Word, Excel, PowerPoint, Markdown, R, SAS, Python, ZIP, images.
      </p>
      {mode === 'local' ? (
        <p className="mx-auto mt-2 max-w-md text-xs text-warning-ink">
          Local mode stores files in this browser only, up to 2 MB each. Connect Supabase to share
          them with your committee.
        </p>
      ) : null}
      {busy ? (
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
        </p>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
    </div>
  );
}

export function FileCard({ file, onDelete }: { file: StoredFile; onDelete?: () => void }) {
  const { getFileUrl } = useFiles();
  const [busy, setBusy] = React.useState(false);

  async function open() {
    setBusy(true);
    try {
      const url = await getFileUrl(file);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-start gap-3 rounded-md border border-hairline/60 bg-white px-3 py-2.5">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded bg-brand-50 text-accent">
        <FileText className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink" title={file.file_name}>
          {file.file_name}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatBytes(file.file_size)}
          <span className="mx-1.5 text-slate-300">·</span>
          {formatTimestamp(file.uploaded_at)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button size="icon" variant="ghost" onClick={() => void open()} disabled={busy} aria-label="Open file">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        </Button>
        {onDelete ? (
          <Button
            size="icon"
            variant="ghost"
            onClick={onDelete}
            aria-label={`Remove ${file.file_name}`}
            className="text-slate-400 hover:bg-danger-soft hover:text-danger-ink"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function FileList({
  files,
  emptyTitle = 'No files uploaded yet',
  emptyDescription = 'Upload your first deliverable to start tracking it here.',
  readOnly = false,
}: {
  files: StoredFile[];
  emptyTitle?: string;
  emptyDescription?: string;
  readOnly?: boolean;
}) {
  const { deleteFile } = useFiles();

  if (!files.length) {
    return <EmptyState icon={FileText} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="space-y-2">
      {files.map((f) => (
        <FileCard key={f.id} file={f} onDelete={readOnly ? undefined : () => void deleteFile(f.id)} />
      ))}
    </div>
  );
}
