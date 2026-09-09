import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getCustomerCatalog,
  getCustomerOrder,
  getCustomerOrders,
  getCustomerPortalForm,
  loginCustomer,
  placeCustomerOrder,
  type PlaceCustomerOrderPayload,
} from "@/services/customerPortal";

export function useCustomerLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginCustomer(email, password),
  });
}

export function useCustomerCatalog() {
  return useQuery({
    queryKey: ["customer-catalog"],
    queryFn: getCustomerCatalog,
  });
}

export function useCustomerPortalForm() {
  return useQuery({
    queryKey: ["customer-form"],
    queryFn: getCustomerPortalForm,
  });
}

export function useCustomerOrders() {
  return useQuery({
    queryKey: ["customer-orders"],
    queryFn: getCustomerOrders,
  });
}

export function useCustomerOrder(id: number | null) {
  return useQuery({
    queryKey: ["customer-orders", id],
    queryFn: () => getCustomerOrder(id as number),
    enabled: id !== null,
  });
}

export function usePlaceCustomerOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PlaceCustomerOrderPayload) => placeCustomerOrder(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customer-orders"],
      });
    },
  });
}