import { apiFetch, getApiErrorMessage } from "./api";

export type FormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "checkbox"
  | "email"
  | "phone";

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormField {
  id: number;
  customer_id: number;
  label: string;
  field_key: string;
  field_type: FormFieldType;
  options: FormFieldOption[] | null;
  required: boolean;
  placeholder: string | null;
  sort_order: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type CreateFormFieldPayload = {
  label: string;
  field_type: FormFieldType;
  options?: FormFieldOption[];
  required?: boolean;
  placeholder?: string;
  active?: boolean;
};

export type UpdateFormFieldPayload = Partial<CreateFormFieldPayload>;

export async function getCustomerFormFields(
  customerId: number
): Promise<FormField[]> {
  const response = await apiFetch(`/api/customers/${customerId}/form-fields`);

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to fetch form fields")
    );
  }

  return response.json();
}

export async function createFormField(
  customerId: number,
  data: CreateFormFieldPayload
) {
  const response = await apiFetch(`/api/customers/${customerId}/form-fields`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to create form field")
    );
  }

  return response.json();
}

export async function updateFormField(
  id: number,
  data: UpdateFormFieldPayload
) {
  const response = await apiFetch(`/api/form-fields/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to update form field")
    );
  }

  return response.json();
}

export async function deleteFormField(id: number) {
  const response = await apiFetch(`/api/form-fields/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to delete form field")
    );
  }

  return response.json();
}

export async function reorderFormFields(
  customerId: number,
  orderedIds: number[]
) {
  const response = await apiFetch(
    `/api/customers/${customerId}/form-fields/reorder`,
    {
      method: "PUT",
      body: JSON.stringify({ orderedIds }),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to reorder form fields")
    );
  }

  return response.json();
}