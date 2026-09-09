import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createFormField,
  deleteFormField,
  getCustomerFormFields,
  reorderFormFields,
  updateFormField,
  type CreateFormFieldPayload,
  type UpdateFormFieldPayload,
} from "@/services/formFields";

export function useCustomerFormFields(customerId: number | null) {
  return useQuery({
    queryKey: ["form-fields", customerId],
    queryFn: () => getCustomerFormFields(customerId as number),
    enabled: customerId != null,
  });
}

export function useCreateFormField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      data,
    }: {
      customerId: number;
      data: CreateFormFieldPayload;
    }) => createFormField(customerId, data),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["form-fields", variables.customerId],
      });
    },
  });
}

export function useUpdateFormField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateFormFieldPayload;
    }) => updateFormField(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-fields"] });
    },
  });
}

export function useDeleteFormField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteFormField(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-fields"] });
    },
  });
}

export function useReorderFormFields() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      orderedIds,
    }: {
      customerId: number;
      orderedIds: number[];
    }) => reorderFormFields(customerId, orderedIds),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["form-fields", variables.customerId],
      });
    },
  });
}