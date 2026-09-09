import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { FormField } from "@/services/formFields";

type Props = {
  fields: FormField[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
};

const FIELD_LABELS: Record<string, string> = {
  text: "Text",
  textarea: "Long Text",
  number: "Number",
  date: "Date",
  select: "Dropdown",
  checkbox: "Checkbox",
  email: "Email",
  phone: "Phone",
};

export default function CustomFieldsEditor({
  fields,
  values,
  onChange,
}: Props) {
  if (fields.length === 0) {
    return null;
  }

  function setValue(key: string, value: unknown) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-muted-foreground">
        Custom Fields
      </div>

      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={`custom-field-${field.field_key}`}>
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </Label>

          {field.field_type === "textarea" ? (
            <textarea
              id={`custom-field-${field.field_key}`}
              className="w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              rows={3}
              placeholder={field.placeholder ?? undefined}
              value={String(values[field.field_key] ?? "")}
              onChange={(e) => setValue(field.field_key, e.target.value)}
            />
          ) : field.field_type === "checkbox" ? (
            <label className="flex items-center gap-2 text-sm">
              <input
                id={`custom-field-${field.field_key}`}
                type="checkbox"
                className="size-4 accent-indigo-500"
                checked={Boolean(values[field.field_key])}
                onChange={(e) => setValue(field.field_key, e.target.checked)}
              />
              <span className="text-muted-foreground">
                {field.placeholder || "Enable"}
              </span>
            </label>
          ) : field.field_type === "select" ? (
            <select
              id={`custom-field-${field.field_key}`}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={String(values[field.field_key] ?? "")}
              onChange={(e) => setValue(field.field_key, e.target.value)}
            >
              <option value="">{field.placeholder || "Select..."}</option>
              {(field.options ?? []).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <Input
              id={`custom-field-${field.field_key}`}
              type={
                field.field_type === "number"
                  ? "number"
                  : field.field_type === "date"
                    ? "date"
                    : field.field_type === "email"
                      ? "email"
                      : field.field_type === "phone"
                        ? "tel"
                        : "text"
              }
              placeholder={field.placeholder ?? undefined}
              value={String(values[field.field_key] ?? "")}
              onChange={(e) => setValue(field.field_key, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export { FIELD_LABELS };