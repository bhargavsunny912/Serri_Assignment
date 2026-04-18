import { QueryKeys, dataService } from 'librechat-data-provider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions, UseMutationOptions, QueryObserverResult } from '@tanstack/react-query';
import type { 
  TContact, 
  ContactListParams, 
  ContactListResponse,
  CreateContactParams,
  UpdateContactParams 
} from 'librechat-data-provider';

export const useGetContactsQuery = (
  params: ContactListParams = { page: 1, limit: 10 },
  config?: UseQueryOptions<ContactListResponse>
): QueryObserverResult<ContactListResponse> => {
  return useQuery<ContactListResponse>(
    [QueryKeys.contacts, params.page, params.limit], 
    () => dataService.getContacts(params), 
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      ...config,
    }
  );
};

export const useSearchContactsQuery = (
  query: string,
  config?: UseQueryOptions<ContactListResponse>
): QueryObserverResult<ContactListResponse> => {
  return useQuery<ContactListResponse>(
    [QueryKeys.contacts, 'search', query], 
    () => dataService.searchContacts(query), 
    {
      enabled: !!query,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      ...config,
    }
  );
};

export const useGetContactByIdQuery = (
  id: string,
  config?: UseQueryOptions<TContact>
): QueryObserverResult<TContact> => {
  return useQuery<TContact>(
    [QueryKeys.contacts, id], 
    () => dataService.getContactById(id), 
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      ...config,
    }
  );
};

export const useCreateContactMutation = (
  options?: UseMutationOptions<TContact, Error, CreateContactParams>
) => {
  const queryClient = useQueryClient();
  return useMutation(
    (params: CreateContactParams) => dataService.createContact(params),
    {
      ...options,
      onSuccess: (...params) => {
        queryClient.invalidateQueries([QueryKeys.contacts]);
        options?.onSuccess?.(...params);
      },
    }
  );
};

export const useUpdateContactMutation = (
  options?: UseMutationOptions<TContact, Error, { id: string; data: UpdateContactParams }>
) => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, data }: { id: string; data: UpdateContactParams }) => dataService.updateContact(id, data),
    {
      ...options,
      onSuccess: (...params) => {
        queryClient.invalidateQueries([QueryKeys.contacts]);
        options?.onSuccess?.(...params);
      },
    }
  );
};

export const useDeleteContactMutation = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();
  return useMutation(
    (id: string) => dataService.deleteContact(id),
    {
      ...options,
      onSuccess: (...params) => {
        queryClient.invalidateQueries([QueryKeys.contacts]);
        options?.onSuccess?.(...params);
      },
    }
  );
};

export const useImportContactsMutation = (
  options?: UseMutationOptions<{ importedCount: number; errors: unknown[] }, Error, FormData>
) => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: FormData) => dataService.importContacts(data),
    {
      ...options,
      onSuccess: (...params) => {
        queryClient.invalidateQueries([QueryKeys.contacts]);
        options?.onSuccess?.(...params);
      },
    }
  );
};
