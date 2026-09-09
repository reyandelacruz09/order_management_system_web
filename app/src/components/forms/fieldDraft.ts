import { FIELD_LABELS } from "@/components/orders/CustomFieldsEditor";
import type {
  FormField,
  FormFieldOption,
  FormFieldType,
} from "@/services/formFields";

export type DraftField = {
  id?: number;
  label: string;
  field_type: FormFieldType;
  required: boolean;
  placeholder: string;
  options: FormFieldOption[];
  active: boolean;
};

export const EMPTY_OPTION: FormFieldOption = { label: "", value: "" };
export const FIELD_TYPE_KEYS = Object.keys(FIELD_LABELS) as FormFieldType[];

export function emptyDraft(): DraftField {
  return {
    label: "",
    field_type: "text",
    required: false,
    placeholder: "",
    options: [{ ...EMPTY_OPTION }],
    active: true,
  };
}

export function draftForField(field: FormField): DraftField {
  return {
    id: field.id,
    label: field.label,
    field_type: field.field_type,
    required: field.required,
    placeholder: field.placeholder ?? "",
    options: field.options?.length ? field.options : [{ ...EMPTY_OPTION }],
    active: field.active,
  };
}