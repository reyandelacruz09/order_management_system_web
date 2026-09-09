import { apiFetch, getApiErrorMessage } from "./api";

export interface CustomerGroup {
  id: number;
  name: string;
  template_id: number | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  member_count?: number;
  template?: { id: number; name: string; active: boolean } | null;
}

export type CreateCustomerGroupPayload = {
  name: string;
  template_id?: number | null;
  active?: boolean;
};

export type UpdateCustomerGroupPayload = Partial<CreateCustomerGroupPayload>;

export async function getCustomerGroups(): Promise<CustomerGroup[]> {
  const response = await apiFetch("/api/groups");

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to fetch customer groups")
    );
  }

  return response.json();
}

export async function createCustomerGroup(data: CreateCustomerGroupPayload) {
  const response = await apiFetch("/api/groups", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to create customer group")
    );
  }

  return response.json();
}

export async function updateCustomerGroup(
  id: number,
  data: UpdateCustomerGroupPayload
) {
  const response = await apiFetch(`/api/groups/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to update customer group")
    );
  }

  return response.json();
}

export async function deleteCustomerGroup(id: number) {
  const response = await apiFetch(`/api/groups/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to delete customer group")
    );
  }

  return response.json();
}

export async function getCustomerGroupMembers(
  groupId: number
): Promise<{ id: number; first_name: string; last_name: string; email: string; phone: string }[]> {
  const response = await apiFetch(`/api/groups/${groupId}/members`);

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to fetch group members")
    );
  }

  return response.json();
}

export async function setCustomerGroupMembers(
  groupId: number,
  customerIds: number[]
) {
  const response = await apiFetch(`/api/groups/${groupId}/members`, {
    method: "PUT",
    body: JSON.stringify({ customerIds }),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to update group members")
    );
  }

  return response.json();
}