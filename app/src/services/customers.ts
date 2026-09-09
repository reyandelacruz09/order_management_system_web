import { apiFetch, getApiErrorMessage } from "./api";

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string | null;
  created_at?: string;
}

export type CreateCustomerPayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

export type UpdateCustomerPayload = Partial<CreateCustomerPayload>;

export interface CustomerFormAssignment {
  template_id: number;
  template_name: string;
}

export async function getCustomerFormAssignment(
  id: number
): Promise<CustomerFormAssignment> {
  const response = await apiFetch(`/api/customers/${id}/form-assignment`);

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to fetch form assignment")
    );
  }

  return response.json();
}

export async function setCustomerFormAssignment(
  id: number,
  template_id: number | null
) {
  const response = await apiFetch(`/api/customers/${id}/form-assignment`, {
    method: "PUT",
    body: JSON.stringify({ template_id }),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to update form assignment")
    );
  }

  return response.json();
}

export async function setCustomerPassword(id: number, password: string) {
  const response = await apiFetch(`/api/customers/${id}/password`, {
    method: "PUT",
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to set customer password")
    );
  }

  return response.json();
}

export async function getCustomerPasswordStatus(
  id: number
): Promise<{ has_password: boolean; email: string }> {
  const response = await apiFetch(`/api/customers/${id}/password-status`);

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to fetch password status")
    );
  }

  return response.json();
}

export async function getCustomers(): Promise<Customer[]> {
  const response = await apiFetch("/api/customers");

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to fetch customers")
    );
  }

  return response.json();
}

export async function createCustomer(data: CreateCustomerPayload) {
  const response = await apiFetch("/api/customers", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to create customer")
    );
  }

  return response.json();
}

export async function updateCustomer(
  id: number,
  data: UpdateCustomerPayload
) {
  const response = await apiFetch(`/api/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to update customer")
    );
  }

  return response.json();
}
