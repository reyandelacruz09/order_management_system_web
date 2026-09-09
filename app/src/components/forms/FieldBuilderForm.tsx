import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FIELD_LABELS } from "@/components/orders/CustomFieldsEditor";
import {
  EMPTY_OPTION,
  FIELD_TYPE_KEYS,
  type DraftField,
} from "./fieldDraft";
import type {
  FormFieldOption,
  FormFieldType,
} from "@/services/formFields";

type FormProps = {
  draft: DraftField;
  onChange: (draft: DraftField) => void;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
};

export default function FieldBuilderForm({
  draft,
  onChange,
  isSaving,
  onSave,
  onCancel,
}: FormProps) {
  const isSelect = draft.field_type === "select";
  const showPlaceholder =
    draft.field_type !== "select" && draft.field_type !== "checkbox";

  function updateOptions(optionIndex: number, patch: Partial<FormFieldOption>) {
    const next = draft.options.map((option, index) =>
      index === optionIndex ? { ...option, ...patch } : option
    );
    onChange({ ...draft, options: next });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="field-builder-label">Label</Label>
          <Input
            id="field-builder-label"
            placeholder="e.g. Delivery Date"
            value={draft.label}
            onChange={(e) => onChange({ ...draft, label: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="field-builder-type">Type</Label>
          <select
            id="field-builder-type"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={draft.field_type}
            onChange={(e) =>
              onChange({
                ...draft,
                field_type: e.target.value as FormFieldType,
              })
            }
          >
            {FIELD_TYPE_KEYS.map((key) => (
              <option key={key} value={key}>
                {FIELD_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showPlaceholder && (
        <div className="space-y-2">
          <Label htmlFor="field-builder-placeholder">Placeholder</Label>
          <Input
            id="field-builder-placeholder"
            value={draft.placeholder}
            onChange={(e) =>
              onChange({ ...draft, placeholder: e.target.value })
            }
          />
        </div>
      )}

      {isSelect && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Options</Label>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                onChange({
                  ...draft,
                  options: [...draft.options, { ...EMPTY_OPTION }],
                })
              }
            >
              <Plus />
              Add Option
            </Button>
          </div>

          <div className="space-y-2">
            {draft.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Label (shown to customer)"
                    value={option.label}
                    onChange={(e) =>
                      updateOptions(index, { label: e.target.value })
                    }
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Value (stored)"
                    value={option.value}
                    onChange={(e) =>
                      updateOptions(index, { value: e.target.value })
                    }
                  />
                </div>

                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10"
                  disabled={draft.options.length === 1}
                  onClick={() =>
                    onChange({
                      ...draft,
                      options: draft.options.filter((_, i) => i !== index),
                    })
                  }
                  aria-label="Remove option"
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 accent-indigo-500"
            checked={draft.required}
            onChange={(e) => onChange({ ...draft, required: e.target.checked })}
          />
          Required
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 accent-indigo-500"
            checked={draft.active}
            onChange={(e) => onChange({ ...draft, active: e.target.checked })}
          />
          Active
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? "Saving..." : draft.id != null ? "Save Field" : "Add Field"}
        </Button>
      </div>
    </div>
  );
}