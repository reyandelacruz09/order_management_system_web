import { apiFetch, getApiErrorMessage } from "./api";
import type { FormFieldOption, FormFieldType } from "./formFields";

export interface FormTemplateField {
  id: number;
  template_id: number;
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

export interface FormTemplate {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  fields?: FormTemplateField[];
}

export type CreateFormTemplatePayload = {
  name: string;
  description?: string | null;
  active?: boolean;
};

export type UpdateFormTemplatePayload = Partial<CreateFormTemplatePayload>;

export type CreateFormTemplateFieldPayload = {
  label: string;
  field_type: FormFieldType;
  options?: FormFieldOption[];
  required?: boolean;
  placeholder?: string;
  active?: boolean;
};

export type UpdateFormTemplateFieldPayload = Partial<CreateFormTemplateFieldPayload>;

export async function getFormTemplates(): Promise<FormTemplate[]> {
  const response = await apiFetch("/api/form-templates");

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to fetch form templates")
    );
  }

  return response.json();
}

export async function getFormTemplate(id: number): Promise<FormTemplate> {
  const response = await apiFetch(`/api/form-templates/${id}`);

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to fetch form template")
    );
  }

  return response.json();
}

export async function createFormTemplate(data: CreateFormTemplatePayload) {
  const response = await apiFetch("/api/form-templates", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to create form template")
    );
  }

  return response.json();
}

export async function updateFormTemplate(
  id: number,
  data: UpdateFormTemplatePayload
) {
  const response = await apiFetch(`/api/form-templates/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to update form template")
    );
  }

  return response.json();
}

export async function deleteFormTemplate(id: number) {
  const response = await apiFetch(`/api/form-templates/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to delete form template")
    );
  }

  return response.json();
}

export async function createFormTemplateField(
  templateId: number,
  data: CreateFormTemplateFieldPayload
) {
  const response = await apiFetch(`/api/form-templates/${templateId}/fields`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to create template field")
    );
  }

  return response.json();
}

export async function updateFormTemplateField(
  fieldId: number,
  data: UpdateFormTemplateFieldPayload
) {
  const response = await apiFetch(`/api/form-templates/fields/${fieldId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to update template field")
    );
  }

  return response.json();
}

export async function deleteFormTemplateField(
  templateId: number,
  fieldId: number
) {
  const response = await apiFetch(
    `/api/form-templates/${templateId}/fields/${fieldId}`,
    { method: "DELETE" }
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to delete template field")
    );
  }

  return response.json();
}

export async function reorderFormTemplateFields(
  templateId: number,
  orderedIds: number[]
) {
  const response = await apiFetch(
    `/api/form-templates/${templateId}/fields/reorder`,
    {
      method: "PUT",
      body: JSON.stringify({ orderedIds }),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to reorder template fields")
    );
  }

  return response.json();
}