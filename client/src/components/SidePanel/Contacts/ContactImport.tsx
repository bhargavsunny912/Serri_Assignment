import React, { useState, useRef } from 'react';
import { OGDialog, OGDialogTemplate, Button, Label, Spinner, useToastContext } from '@librechat/client';
import { useImportContactsMutation } from '~/data-provider';
import { useLocalize } from '~/hooks';

interface ContactImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export default function ContactImport({ open, onOpenChange, children }: ContactImportProps) {
  const localize = useLocalize();
  const { showToast } = useToastContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const { mutate: importCsv, isLoading } = useImportContactsMutation({
    onSuccess: (data) => {
      showToast({ message: `Successfully imported ${data.importedCount} contacts`, status: 'success' });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onOpenChange(false);
    },
    onError: (e) => {
      showToast({ message: e.message || 'Error importing CSV', status: 'error' });
    }
  });

  const handleImport = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    importCsv(formData);
  };

  return (
    <OGDialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) setFile(null); }}>
      {children}
      <OGDialogTemplate
        title={localize('com_ui_import_contacts') || 'Import Contacts CSV'}
        showCloseButton={true}
        className="w-11/12 md:max-w-lg"
        main={
          <div className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="csv-upload" className="text-sm font-medium text-text-primary">Upload CSV File</Label>
               <input id="csv-upload" type="file" accept=".csv" ref={fileInputRef} onChange={e => setFile(e.target.files?.[0] || null)} className="w-full text-text-primary" />
               <p className="text-xs text-text-secondary">The CSV file must have a header row with fields like 'Name' (required), 'Email', 'Role', etc.</p>
             </div>
          </div>
        }
        buttons={
           <Button type="button" variant="submit" onClick={handleImport} disabled={isLoading || !file} className="text-white">
             {isLoading ? <Spinner className="size-4" /> : 'Upload & Import'}
           </Button>
        }
      />
    </OGDialog>
  );
}
