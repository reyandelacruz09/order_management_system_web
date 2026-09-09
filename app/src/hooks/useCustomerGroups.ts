import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCustomerGroup,
  deleteCustomerGroup,
  getCustomerGroupMembers,
  getCustomerGroups,
  setCustomerGroupMembers,
  updateCustomerGroup,
  type CreateCustomerGroupPayload,
  type UpdateCustomerGroupPayload,
} from "@/services/customerGroups";

export function useCustomerGroups() {
  return useQuery({
    queryKey: ["customer-groups"],
    queryFn: getCustomerGroups,
  });
}

export function useCustomerGroupMembers(groupId: number | null) {
  return useQuery({
    queryKey: ["customer-groups", groupId, "members"],
    queryFn: () => getCustomerGroupMembers(groupId as number),
    enabled: groupId !== null,
  });
}

export function useCreateCustomerGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerGroupPayload) => createCustomerGroup(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customer-groups"],
      });
    },
  });
}

export function useUpdateCustomerGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateCustomerGroupPayload;
    }) => updateCustomerGroup(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customer-groups"],
      });
    },
  });
}

export function useDeleteCustomerGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCustomerGroup(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customer-groups"],
      });
    },
  });
}

export function useSetCustomerGroupMembers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      customerIds,
    }: {
      groupId: number;
      customerIds: number[];
    }) => setCustomerGroupMembers(groupId, customerIds),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customer-groups"],
      });
    },
  });
}