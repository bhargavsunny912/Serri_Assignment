import React, { useState, useEffect } from 'react';
import { OGDialog, OGDialogTemplate, Button, Label, Input, Spinner, useToastContext } from '@librechat/client';
import { useCreateContactMutation, useUpdateContactMutation } from '~/data-provider';
import type { TContact } from 'librechat-data-provider';
import { useLocalize } from '~/hooks';

interface ContactCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  contact?: TContact;
}

export default function ContactCreateDialog({ open, onOpenChange, children, contact }: ContactCreateDialogProps) {
  const localize = useLocalize();
  const { showToast } = useToastContext();

  const [name, setName] = useState(contact?.name || '');
  const [company, setCompany] = useState(contact?.company || '');
  const [role, setRole] = useState(contact?.role || '');
  const [email, setEmail] = useState(contact?.email || '');
  const [notes, setNotes] = useState(contact?.notes || '');
  const [attributes, setAttributes] = useState<Record<string, string>>(contact?.attributes || {});

  useEffect(() => {
    if (open && contact) {
      setName(contact.name || '');
      setCompany(contact.company || '');
      setRole(contact.role || '');
      setEmail(contact.email || '');
      setNotes(contact.notes || '');
      setAttributes(contact.attributes || {});
    } else if (open && !contact) {
      setName('');
      setCompany('');
      setRole('');
      setEmail('');
      setNotes('');
      setAttributes({});
    }
  }, [open, contact]);

  const { mutate: createContact, isLoading: isCreating } = useCreateContactMutation({
    onSuccess: () => {
      showToast({ message: localize('com_ui_contact_created') || 'Contact created', status: 'success' });
      onOpenChange(false);
    },
    onError: (e) => showToast({ message: e.message, status: 'error' })
  });

  const { mutate: updateContact, isLoading: isUpdating } = useUpdateContactMutation({
    onSuccess: () => {
      showToast({ message: localize('com_ui_contact_updated') || 'Contact updated', status: 'success' });
      onOpenChange(false);
    },
    onError: (e) => showToast({ message: e.message, status: 'error' })
  });

  const isLoading = isCreating || isUpdating;

  const handleAttributeChange = (oldKey: string, newKey: string, value: string) => {
    const newAttrs = { ...attributes };
    if (oldKey !== newKey) {
      delete newAttrs[oldKey];
    }
    newAttrs[newKey] = value;
    setAttributes(newAttrs);
  };

  const removeAttribute = (key: string) => {
    const newAttrs = { ...attributes };
    delete newAttrs[key];
    setAttributes(newAttrs);
  };

  const addAttribute = () => {
    const newKey = `Attr ${Object.keys(attributes).length + 1}`;
    setAttributes({ ...attributes, [newKey]: '' });
  };

  const handleSave = () => {
    if (!name.trim()) {
      showToast({ message: localize('com_ui_field_required') || 'Name is required', status: 'error' });
      return;
    }

    const payload = { 
      name: name.trim(), 
      company: company.trim(), 
      role: role.trim(), 
      email: email.trim(), 
      notes: notes.trim(),
      attributes
    };

    if (contact && contact._id) {
       updateContact({ id: contact._id, data: payload });
    } else {
       createContact(payload);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  };

  return (
    <OGDialog open={open} onOpenChange={onOpenChange}>
      {children}
      <OGDialogTemplate
        title={contact ? (localize('com_ui_edit_contact') || 'Edit Contact') : (localize('com_ui_create_contact') || 'Create Contact')}
        showCloseButton={false}
        className="w-11/12 md:max-w-lg"
        main={
          <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1" onKeyDown={handleKeyPress}>
             <div className="space-y-2">
               <Label htmlFor="contact-name" className="text-sm font-medium text-text-primary">Name *</Label>
               <Input id="contact-name" value={name} onChange={e => setName(e.target.value)} className="w-full" />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-company" className="text-sm font-medium text-text-primary">Company</Label>
                  <Input id="contact-company" value={company} onChange={e => setCompany(e.target.value)} className="w-full" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-role" className="text-sm font-medium text-text-primary">Role</Label>
                  <Input id="contact-role" value={role} onChange={e => setRole(e.target.value)} className="w-full" />
                </div>
             </div>
             <div className="space-y-2">
               <Label htmlFor="contact-email" className="text-sm font-medium text-text-primary">Email</Label>
               <Input id="contact-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full" />
             </div>
             <div className="space-y-2">
               <Label htmlFor="contact-notes" className="text-sm font-medium text-text-primary">Notes</Label>
               <textarea id="contact-notes" value={notes} onChange={e => setNotes(e.target.value)} className="min-h-[60px] w-full resize-none rounded-lg border border-border-light bg-transparent px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-heavy" />
             </div>

             <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label  className="text-sm font-medium text-text-primary">Attributes</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addAttribute} className="h-7 px-2 text-xs">
                    + Add
                  </Button>
                </div>
                <div className="space-y-2">
                   {Object.entries(attributes).map(([key, value], idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input 
                          placeholder="Key" 
                          value={key} 
                          onChange={e => handleAttributeChange(key, e.target.value, value)} 
                          className="w-1/3 h-8 text-xs"
                        />
                        <Input 
                          placeholder="Value" 
                          value={value} 
                          onChange={e => handleAttributeChange(key, key, e.target.value)} 
                          className="flex-1 h-8 text-xs"
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeAttribute(key)} 
                          className="h-8 w-8 text-text-secondary hover:text-red-500"
                        >
                          ×
                        </Button>
                      </div>
                   ))}
                   {Object.keys(attributes).length === 0 && (
                     <div className="text-xs text-text-secondary italic">No custom attributes added.</div>
                   )}
                </div>
             </div>
          </div>
        }
        buttons={
           <Button type="button" variant="submit" onClick={handleSave} disabled={isLoading || !name.trim()} className="text-white">
             {isLoading ? <Spinner className="size-4" /> : (localize('com_ui_save') || 'Save')}
           </Button>
        }
      />
    </OGDialog>
  );
}
