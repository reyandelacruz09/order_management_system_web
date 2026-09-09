import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createFormTemplate,
  createFormTemplateField,
  deleteFormTemplate,
  deleteFormTemplateField,
  getFormTemplate,
  getFormTemplates,
  reorderFormTemplateFields,
  updateFormTemplate,
  updateFormTemplateField,
  type CreateFormTemplateFieldPayload,
  type CreateFormTemplatePayload,
  type UpdateFormTemplateFieldPayload,
  type UpdateFormTemplatePayload,
} from "@/services/formTemplates";

export function useFormTemplates() {
  return useQuery({
    queryKey: ["form-templates"],
    queryFn: getFormTemplates,
  });
}

export function useFormTemplate(id: number | null) {
  return useQuery({
    queryKey: ["form-templates", id],
    queryFn: () => getFormTemplate(id as number),
    enabled: id !== null,
  });
}

export function useCreateFormTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFormTemplatePayload) => createFormTemplate(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["form-templates"],
      });
    },
  });
}

export function useUpdateFormTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateFormTemplatePayload;
    }) => updateFormTemplate(id, data),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["form-templates"],
      });
      queryClient.invalidateQueries({
        queryKey: ["form-templates", variables.id],
      });
    },
  });
}

export function useDeleteFormTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteFormTemplate(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["form-templates"],
      });
    },
  });
}

export function useCreateFormTemplateField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      data,
    }: {
      templateId: number;
      data: CreateFormTemplateFieldPayload;
    }) => createFormTemplateField(templateId, data),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["form-templates", variables.templateId],
      });
    },
  });
}

export function useUpdateFormTemplateField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fieldId,
      data,
    }: {
      fieldId: number;
      templateId: number;
      data: UpdateFormTemplateFieldPayload;
    }) => updateFormTemplateField(fieldId, data),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["form-templates", variables.templateId],
      });
    },
  });
}

export function useDeleteFormTemplateField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, fieldId }: { templateId: number; fieldId: number }) =>
      deleteFormTemplateField(templateId, fieldId),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["form-templates", variables.templateId],
      });
    },
  });
}

export function useReorderFormTemplateFields() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      orderedIds,
    }: {
      templateId: number;
      orderedIds: number[];
    }) => reorderFormTemplateFields(templateId, orderedIds),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["form-templates", variables.templateId],
      });
    },
  });
}