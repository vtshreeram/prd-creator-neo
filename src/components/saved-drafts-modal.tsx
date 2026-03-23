'use client';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  loadDrafts,
  deleteDraft,
  StoredDraft,
  migrateLocalStorageToIndexedDB
} from '@/lib/drafts';
import { Save, Calendar, Bot, X, Trash2 } from 'lucide-react';
import { Button } from './button';

interface SavedDraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDraft: (draft: StoredDraft) => void;
}

export function SavedDraftsModal({
  isOpen,
  onClose,
  onLoadDraft
}: SavedDraftsModalProps) {
  const [drafts, setDrafts] = useState<StoredDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDraftsData();
      // Attempt migration on first load
      migrateLocalStorageToIndexedDB().catch(() => {});
    }
  }, [isOpen]);

  const loadDraftsData = async () => {
    setIsLoading(true);
    try {
      const loadedDrafts = await loadDrafts();
      setDrafts(loadedDrafts);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!confirm('Are you sure you want to delete this draft?')) {
      return;
    }

    setDeletingId(id);
    try {
      const updatedDrafts = await deleteDraft(id);
      setDrafts(updatedDrafts);
    } catch {
    } finally {
      setDeletingId(null);
    }
  };

  const handleLoadDraft = (draft: StoredDraft) => {
    onLoadDraft(draft);
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm transition-opacity" />
        <Dialog.Content className="fixed top-[50%] left-[50%] z-[101] max-h-[85vh] w-[95vw] max-w-2xl translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl focus:outline-none">
          <div className="flex h-full max-h-[85vh] flex-col">
            {/* Header */}
            <div className="border-b border-gray-100 bg-gray-50/50 p-6">
              <div className="flex items-center justify-between">
                <Dialog.Title className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                  <Save className="h-5 w-5 text-gray-500" />
                  Saved PRDs
                </Dialog.Title>
                <Dialog.Close className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900">
                  <X className="h-5 w-5" />
                </Dialog.Close>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {drafts.length} saved PRD{drafts.length !== 1 ? 's' : ''} (max
                12)
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                  <p className="text-sm font-medium text-gray-500">
                    Loading drafts...
                  </p>
                </div>
              ) : drafts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Save className="mb-4 h-12 w-12 text-gray-300" />
                  <h3 className="mb-1 text-lg font-medium text-gray-900">
                    No Saved PRDs
                  </h3>
                  <p className="text-sm text-gray-500">
                    Generate and save your first PRD to see it here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {drafts.map((draft) => (
                    <div
                      key={draft.id}
                      onClick={() => handleLoadDraft(draft)}
                      className="group relative flex cursor-pointer flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-blue-500 hover:shadow-md"
                    >
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <h3 className="line-clamp-2 font-semibold text-gray-900">
                          {draft.title}
                        </h3>
                        <button
                          onClick={(e) => handleDelete(draft.id, e)}
                          disabled={deletingId === draft.id}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          title="Delete draft"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {draft.inputs.problemStatement && (
                        <p className="mb-4 line-clamp-2 text-sm text-gray-500">
                          {draft.inputs.problemStatement}
                        </p>
                      )}

                      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {formatDate(draft.createdAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Bot className="h-3.5 w-3.5 text-gray-400" />
                          <span className="max-w-[100px] truncate">
                            {draft.model}
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 bg-gray-50/50 p-4 sm:px-6">
              <div className="flex justify-end">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
