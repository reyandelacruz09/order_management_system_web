import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCustomer,
  getCustomerFormAssignment,
  getCustomerPasswordStatus,
  getCustomers,
  setCustomerFormAssignment,
  setCustomerPassword,
  updateCustomer,
  type CreateCustomerPayload,
  type UpdateCustomerPayload,
} from "@/services/customers";

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });
}

export function useCustomerFormAssignment(customerId: number | null) {
  return useQuery({
    queryKey: ["customers", customerId, "form-assignment"],
    queryFn: () => getCustomerFormAssignment(customerId as number),
    enabled: customerId !== null,
  });
}

export function useCustomerPasswordStatus(customerId: number | null) {
  return useQuery({
    queryKey: ["customers", customerId, "password-status"],
    queryFn: () => getCustomerPasswordStatus(customerId as number),
    enabled: customerId !== null,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerPayload) => createCustomer(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateCustomerPayload;
    }) => updateCustomer(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
    },
  });
}

export function useSetCustomerFormAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      template_id,
    }: {
      id: number;
      template_id: number | null;
    }) => setCustomerFormAssignment(id, template_id),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
      queryClient.invalidateQueries({
        queryKey: ["customers", variables.id, "form-assignment"],
      });
    },
  });
}

export function useSetCustomerPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      setCustomerPassword(id, password),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
      queryClient.invalidateQueries({
        queryKey: ["customers", variables.id, "password-status"],
      });
    },
  });
}
