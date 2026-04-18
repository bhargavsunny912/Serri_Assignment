import { useState } from 'react';
import { Trash2, Pencil } from 'lucide-react';
import { Button, TooltipAnchor, useToastContext, OGDialogTrigger } from '@librechat/client';
import type { TContact } from 'librechat-data-provider';
import { useDeleteContactMutation } from '~/data-provider';
import { useLocalize } from '~/hooks';
import ContactCreateDialog from './ContactCreateDialog';
import ContactDetailModal from './ContactDetailModal';

export default function ContactCard({ contact }: { contact: TContact }) {
  const localize = useLocalize();
  const { showToast } = useToastContext();
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const deleteMutation = useDeleteContactMutation({
    onSuccess: () => {
      showToast({ message: localize('com_ui_contact_deleted') || 'Contact deleted', status: 'success' });
    },
    onError: () => {
      showToast({ message: localize('com_ui_error') || 'Error', status: 'error' });
    }
  });

  const attributeKeys = contact.attributes ? Object.keys(contact.attributes) : [];

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setDetailOpen(true)}
        onKeyDown={(e) => e.key === 'Enter' && setDetailOpen(true)}
        className="group relative flex cursor-pointer flex-col gap-1 rounded-lg border border-border-light bg-surface-secondary p-3 shadow-sm transition-all hover:border-border-medium hover:shadow-md"
      >
        <div className="flex w-full items-start justify-between">
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-text-primary">{contact.name}</span>
            {contact.role && <span className="truncate text-xs text-text-secondary">{contact.role}</span>}
            {contact.company && <span className="truncate text-xs text-text-secondary">{contact.company}</span>}
            {contact.email && <span className="truncate text-xs text-text-tertiary">{contact.email}</span>}
            {/* Show first 2 attribute keys as pills */}
            {attributeKeys.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {attributeKeys.slice(0, 2).map((key) => (
                  <span
                    key={key}
                    className="inline-flex items-center rounded-full bg-surface-active px-1.5 py-0.5 text-[10px] font-medium text-text-secondary"
                    title={`${key}: ${contact.attributes![key]}`}
                  >
                    {key}: <span className="ml-1 max-w-[60px] truncate text-text-primary">{String(contact.attributes![key])}</span>
                  </span>
                ))}
                {attributeKeys.length > 2 && (
                  <span className="inline-flex items-center rounded-full bg-surface-active px-1.5 py-0.5 text-[10px] text-text-tertiary">
                    +{attributeKeys.length - 2} more
                  </span>
                )}
              </div>
            )}
          </div>
          <div
            className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <ContactCreateDialog open={editOpen} onOpenChange={setEditOpen} contact={contact}>
              <OGDialogTrigger asChild>
                <TooltipAnchor
                  description={localize('com_ui_edit') || 'Edit'}
                  side="bottom"
                  render={
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditOpen(true)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  }
                />
              </OGDialogTrigger>
            </ContactCreateDialog>
            <TooltipAnchor
              description={localize('com_ui_delete') || 'Delete'}
              side="bottom"
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-red-500 hover:bg-red-500/10 hover:text-red-700"
                  onClick={() => deleteMutation.mutate(contact._id)}
                  disabled={deleteMutation.isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
            />
          </div>
        </div>
        {contact.notes && (
          <p className="mt-1 line-clamp-2 min-h-[1.5rem] break-all break-words hyphens-auto whitespace-normal text-xs text-text-secondary">
            {contact.notes}
          </p>
        )}
      </div>

      {/* Detail modal rendered outside the clickable card to avoid event conflicts */}
      <ContactDetailModal contact={contact} open={detailOpen} onOpenChange={setDetailOpen}>
        <span />
      </ContactDetailModal>
    </>
  );
}
