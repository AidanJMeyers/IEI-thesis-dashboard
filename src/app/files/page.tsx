'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, SectionTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState, LoadingState } from '@/components/ui/empty-state';
import { FileList, FileUploader } from '@/components/files/FileUploader';
import { AddLinkDialog, LINK_TYPE_LABEL, LinkList } from '@/components/files/LinkManager';
import { useFiles, useStore } from '@/hooks/useDashboard';
import type { LinkType } from '@/lib/types';
import { formatBytes } from '@/lib/utils';

export default function FilesPage() {
  const { ready, components, canEdit } = useStore();
  const { files, links } = useFiles();
  const [componentFilter, setComponentFilter] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');
  const [linkDialog, setLinkDialog] = React.useState(false);

  if (!ready) return <LoadingState />;

  const visibleFiles = files.filter(
    (f) => !componentFilter || f.evaluation_component_id === componentFilter,
  );
  const visibleLinks = links.filter((l) => !typeFilter || l.link_type === typeFilter);

  const totalBytes = files.reduce((sum, f) => sum + (f.file_size ?? 0), 0);

  // Group files under the component they belong to, unattached ones last.
  const grouped = components
    .map((c) => ({ component: c, items: visibleFiles.filter((f) => f.evaluation_component_id === c.id) }))
    .filter((g) => g.items.length);
  const ungrouped = visibleFiles.filter((f) => !f.evaluation_component_id);

  return (
    <>
      <PageHeader
        title="Files & links"
        description={`${files.length} file${files.length === 1 ? '' : 's'} (${formatBytes(totalBytes)}) and ${links.length} link${links.length === 1 ? '' : 's'}. Everything the committee might want to open, in one place.`}
      />

      <Tabs defaultValue="files">
        <TabsList>
          <TabsTrigger value="files">File library</TabsTrigger>
          <TabsTrigger value="links">Link directory</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-5">
          {canEdit ? <FileUploader target={{}} /> : null}

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={componentFilter}
              onChange={(e) => setComponentFilter(e.target.value)}
              aria-label="Filter files by component"
              className="w-auto min-w-[200px]"
            >
              <option value="">All components</option>
              {components.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          {visibleFiles.length === 0 ? (
            <EmptyState
              title="No files uploaded yet"
              description="Upload your first deliverable to start tracking it. Files attached to an evaluation component show up on that component's card too."
            />
          ) : (
            <div className="space-y-6">
              {grouped.map(({ component, items }) => (
                <section key={component.id}>
                  <SectionTitle
                    title={component.name}
                    description={`${items.length} file${items.length === 1 ? '' : 's'} · ${component.weight}% of the semester grade`}
                  />
                  <FileList files={items} />
                </section>
              ))}

              {ungrouped.length ? (
                <section>
                  <SectionTitle
                    title="Unattached"
                    description="Not linked to a component yet — attach these from the evaluation tracker so they count toward progress."
                  />
                  <FileList files={ungrouped} />
                </section>
              ) : null}
            </div>
          )}
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter links by type"
              className="w-auto"
            >
              <option value="">All types</option>
              {(Object.keys(LINK_TYPE_LABEL) as LinkType[]).map((t) => (
                <option key={t} value={t}>
                  {LINK_TYPE_LABEL[t]}
                </option>
              ))}
            </Select>
            {canEdit ? (
              <Button onClick={() => setLinkDialog(true)} className="ml-auto">
                <Plus className="h-4 w-4" />
                Add link
              </Button>
            ) : null}
          </div>

          <LinkList
            links={visibleLinks}
            emptyDescription="Add the Google Doc you are drafting in, the analysis repo, your Zotero collection, or the REDCap project."
          />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Where things live</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              {(Object.keys(LINK_TYPE_LABEL) as LinkType[]).map((t) => {
                const count = links.filter((l) => l.link_type === t).length;
                return (
                  <div
                    key={t}
                    className="flex items-center justify-between rounded-md border border-hairline/60 px-3 py-2"
                  >
                    <span className="text-ink">{LINK_TYPE_LABEL[t]}</span>
                    <span className="tabular-nums text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddLinkDialog open={linkDialog} onOpenChange={setLinkDialog} />
    </>
  );
}
