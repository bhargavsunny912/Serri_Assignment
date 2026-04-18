import { useState, useCallback } from 'react';
import { Plus, Upload } from 'lucide-react';
import {
  Button,
  Spinner,
  FilterInput,
  TooltipAnchor,
  useToastContext,
  OGDialogTrigger,
} from '@librechat/client';
import { useGetContactsQuery, useSearchContactsQuery } from '~/data-provider';
import { useLocalize, useDebounce } from '~/hooks';
import ContactList from './ContactList';
import ContactCreateDialog from './ContactCreateDialog';
import ContactImport from './ContactImport';

const pageSize = 10;

export default function ContactPanel() {
  const localize = useLocalize();
  const { showToast } = useToastContext();
  const [pageIndex, setPageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  // Determine which query to use based on search
  const isSearching = debouncedSearchQuery.trim().length > 0;

  const { data: pagedData, isLoading: isLoadingPaged } = useGetContactsQuery(
    { page: pageIndex + 1, limit: pageSize },
    { enabled: !isSearching }
  );

  const { data: searchData, isLoading: isLoadingSearch } = useSearchContactsQuery(debouncedSearchQuery, {
    enabled: isSearching,
  });

  const isLoading = isSearching ? isLoadingSearch : isLoadingPaged;
  const contacts = isSearching ? (searchData?.contacts || []) : (pagedData?.contacts || []);
  const totalPages = isSearching ? (searchData?.totalPages || 1) : (pagedData?.totalPages || 1);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPageIndex(0);
  }, []);

  return (
    <div className="flex h-full w-full flex-col">
      <div role="region" aria-label={localize('com_ui_contacts') || 'Contacts'} className="mt-2 space-y-3">
        {/* Header: Filter + Actions */}
        <div className="flex items-center gap-2">
          <FilterInput
            inputId="contact-search"
            label={localize('com_ui_contacts_filter') || 'Search contacts...'}
            value={searchQuery}
            onChange={handleSearchChange}
            containerClassName="flex-1"
          />
          <ContactImport open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <OGDialogTrigger asChild>
              <TooltipAnchor
                description={localize('com_ui_import_contacts') || 'Import CSV'}
                side="bottom"
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 bg-transparent"
                    aria-label={localize('com_ui_import_contacts') || 'Import CSV'}
                    onClick={() => setImportDialogOpen(true)}
                  >
                    <Upload className="size-4" aria-hidden="true" />
                  </Button>
                }
              />
            </OGDialogTrigger>
          </ContactImport>
          
          <ContactCreateDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <OGDialogTrigger asChild>
              <TooltipAnchor
                description={localize('com_ui_create_contact') || 'Add Contact'}
                side="bottom"
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 bg-transparent"
                    aria-label={localize('com_ui_create_contact') || 'Add Contact'}
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    <Plus className="size-4" aria-hidden="true" />
                  </Button>
                }
              />
            </OGDialogTrigger>
          </ContactCreateDialog>
        </div>

        {/* Contact List */}
        {isLoading ? (
          <div className="flex w-full items-center justify-center p-8">
            <Spinner />
          </div>
        ) : (
          <ContactList contacts={contacts} />
        )}

        {/* Pagination */ }
        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-2 mt-4" role="navigation" aria-label="Pagination">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
              disabled={pageIndex === 0}
            >
              {localize('com_ui_prev') || 'Prev'}
            </Button>
            <div className="whitespace-nowrap text-sm" aria-live="polite">
              {pageIndex + 1} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((prev) => (prev + 1 < totalPages ? prev + 1 : prev))}
              disabled={pageIndex + 1 >= totalPages}
            >
              {localize('com_ui_next') || 'Next'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
