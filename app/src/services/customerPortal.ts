import { apiFetch, getApiErrorMessage } from "./api";
import type { FormField } from "./formFields";
import type { Product } from "./products";
import type { OrderRow, OrderWithItems } from "./orders";

export interface CustomerAccount {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

export type PortalFormField = FormField & {
  source_type?: "customer" | "template" | "group";
};

export interface PlaceCustomerOrderPayload {
  items: { product_id: number; quantity: number }[];
  custom_fields: Record<string, unknown>;
}

export async function loginCustomer(
  email: string,
  password: string
): Promise<{ message: string; customer: CustomerAccount }> {
  const response = await apiFetch("/auth/customer/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to sign in")
    );
  }

  return response.json();
}

export async function getCustomerMe(): Promise<{
  customer: CustomerAccount | null;
}> {
  const response = await apiFetch("/auth/customer/me", {
    credentials: "include",
  });

  if (response.status === 401) {
    return { customer: null };
  }

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to fetch account")
    );
  }

  return response.json();
}

export async function logoutCustomer() {
  const response = await apiFetch("/auth/customer/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to sign out")
    );
  }

  return response.json();
}

export async function getCustomerCatalog(): Promise<Product[]> {
  const response = await apiFetch("/api/customer/catalog", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to fetch catalog")
    );
  }

  return response.json();
}

export async function getCustomerPortalForm(): Promise<PortalFormField[]> {
  const response = await apiFetch("/api/customer/form", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to fetch form")
    );
  }

  return response.json();
}

export async function getCustomerOrders(): Promise<OrderRow[]> {
  const response = await apiFetch("/api/customer/orders", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to fetch orders")
    );
  }

  return response.json();
}

export async function getCustomerOrder(id: number): Promise<OrderWithItems> {
  const response = await apiFetch(`/api/customer/orders/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to fetch order")
    );
  }

  return response.json();
}

export async function placeCustomerOrder(
  data: PlaceCustomerOrderPayload
): Promise<{ message: string; order: OrderRow }> {
  const response = await apiFetch("/api/customer/orders", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to place order")
    );
  }

  return response.json();
}