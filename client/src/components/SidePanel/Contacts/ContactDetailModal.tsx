import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Pencil } from 'lucide-react';
import {
  Button,
  OGDialog,
  OGDialogContent,
  OGDialogHeader,
  OGDialogTitle,
  OGDialogTrigger,
} from '@librechat/client';
import type { TContact } from 'librechat-data-provider';
import { useLocalize } from '~/hooks';
import ContactCreateDialog from './ContactCreateDialog';

interface ContactDetailModalProps {
  contact: TContact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-border-light last:border-0">
      <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">{label}</span>
      <span className="text-sm text-text-primary break-words">{value}</span>
    </div>
  );
}

export default function ContactDetailModal({ contact, open, onOpenChange, children }: ContactDetailModalProps) {
  const localize = useLocalize();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);

  const handleAskAbout = () => {
    const prompt = encodeURIComponent(`Tell me about ${contact.name}${contact.company ? ` from ${contact.company}` : ''}. Use my contacts data.`);
    onOpenChange(false);
    navigate(`/c/new?q=${prompt}`);
  };

  const hasAttributes = contact.attributes && Object.keys(contact.attributes).length > 0;

  return (
    <>
      <OGDialog open={open} onOpenChange={onOpenChange}>
        {children}
        <OGDialogContent className="w-11/12 md:max-w-md p-0 overflow-hidden">
          {/* Header */}
          <OGDialogHeader className="px-5 pt-5 pb-3 bg-surface-secondary border-b border-border-light">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-0.5 overflow-hidden">
                <OGDialogTitle className="text-base font-semibold text-text-primary truncate">
                  {contact.name}
                </OGDialogTitle>
                {contact.role && (
                  <span className="text-xs text-text-secondary">
                    {contact.role}{contact.company ? ` · ${contact.company}` : ''}
                  </span>
                )}
              </div>
            </div>
          </OGDialogHeader>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto px-5 py-2">
            {contact.email && <DetailRow label="Email" value={contact.email} />}
            {contact.company && <DetailRow label="Company" value={contact.company} />}
            {contact.role && <DetailRow label="Role" value={contact.role} />}
            {contact.notes && <DetailRow label="Notes" value={contact.notes} />}

            {hasAttributes && (
              <div className="mt-3">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary mb-1">Attributes</h4>
                {Object.entries(contact.attributes!).map(([key, value]) => (
                  <DetailRow key={key} label={key} value={String(value)} />
                ))}
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex items-center gap-2 px-5 py-3 border-t border-border-light bg-surface-secondary">
            <Button
              variant="submit"
              size="sm"
              onClick={handleAskAbout}
              className="flex-1 text-white gap-1.5"
            >
              <MessageSquare className="size-3.5" />
              {'Ask about this contact'}
            </Button>
            <ContactCreateDialog open={editOpen} onOpenChange={setEditOpen} contact={contact}>
              <OGDialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-1.5">
                  <Pencil className="size-3.5" />
                  {localize('com_ui_edit') || 'Edit'}
                </Button>
              </OGDialogTrigger>
            </ContactCreateDialog>
          </div>
        </OGDialogContent>
      </OGDialog>
    </>
  );
}
