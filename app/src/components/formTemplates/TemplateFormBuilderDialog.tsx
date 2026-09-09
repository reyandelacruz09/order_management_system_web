import { useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FieldBuilderForm from "@/components/forms/FieldBuilderForm";
import {
  draftForField,
  emptyDraft,
  type DraftField,
} from "@/components/forms/fieldDraft";
import {
  useCreateFormTemplateField,
  useDeleteFormTemplateField,
  useFormTemplate,
  useReorderFormTemplateFields,
  useUpdateFormTemplateField,
} from "@/hooks/useFormTemplates";
import { FIELD_LABELS } from "@/components/orders/CustomFieldsEditor";
import type { FormTemplate, FormTemplateField } from "@/services/formTemplates";
import type { FormField } from "@/services/formFields";

type Props = {
  template: FormTemplate;
};

export default function TemplateFormBuilderDialog({ template }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DraftField | null>(null);
  const [error, setError] = useState("");

  const { data: detail, isPending } = useFormTemplate(open ? template.id : null);
  const fields = detail?.fields ?? [];

  const createField = useCreateFormTemplateField();
  const updateField = useUpdateFormTemplateField();
  const deleteField = useDeleteFormTemplateField();
  const reorderFields = useReorderFormTemplateFields();

  const isSaving = createField.isPending || updateField.isPending;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setDraft(null);
      setError("");
    }
  }

  function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;

    if (target < 0 || target >= fields.length) {
      return;
    }

    const ids = fields.map((field) => field.id);
    ids[index] = fields[target].id;
    ids[target] = fields[index].id;

    reorderFields.mutate({
      templateId: template.id,
      orderedIds: ids,
    });
  }

  async function handleDelete(field: FormTemplateField) {
    if (!window.confirm(`Delete the field "${field.label}"?`)) {
      return;
    }

    try {
      await deleteField.mutateAsync({
        templateId: template.id,
        fieldId: field.id,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete template field."
      );
    }
  }

  async function handleSaveDraft() {
    if (!draft) {
      return;
    }

    if (!draft.label.trim()) {
      setError("A label is required.");
      return;
    }

    const isSelect = draft.field_type === "select";
    const validOptions = draft.options.filter(
      (option) => option.label.trim() && option.value.trim()
    );

    if (isSelect && validOptions.length === 0) {
      setError("Add at least one complete option for the dropdown.");
      return;
    }

    const data = {
      label: draft.label.trim(),
      field_type: draft.field_type,
      required: draft.required,
      active: draft.active,
      placeholder: isSelect ? undefined : draft.placeholder.trim() || undefined,
      ...(isSelect && validOptions.length > 0
        ? {
            options: validOptions.map((option) => ({
              label: option.label.trim(),
              value: option.value.trim(),
            })),
          }
        : {}),
    };

    try {
      if (draft.id != null) {
        await updateField.mutateAsync({
          fieldId: draft.id,
          templateId: template.id,
          data,
        });
      } else {
        await createField.mutateAsync({
          templateId: template.id,
          data,
        });
      }

      setDraft(null);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save template field."
      );
    }
  }

  const formField = (field: FormTemplateField): FormField => ({
    id: field.id,
    customer_id: field.template_id,
    label: field.label,
    field_key: field.field_key,
    field_type: field.field_type,
    options: field.options,
    required: field.required,
    placeholder: field.placeholder,
    sort_order: field.sort_order,
    active: field.active,
  });

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Fields
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Form Template Builder</DialogTitle>
            <DialogDescription>
              Define the reusable fields for the &ldquo;{template.name}&rdquo;
              template. Customers assigned this template (directly or through a
              group) will see these fields on their order form.
            </DialogDescription>
          </DialogHeader>

          {isPending ? (
            <p className="py-4 text-sm text-muted-foreground">
              Loading form fields...
            </p>
          ) : draft ? (
            <FieldBuilderForm
              draft={draft}
              onChange={setDraft}
              isSaving={isSaving}
              onSave={handleSaveDraft}
              onCancel={() => {
                setDraft(null);
                setError("");
              }}
            />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {fields.length === 0
                    ? "No fields yet in this template."
                    : `${fields.length} field${fields.length === 1 ? "" : "s"} defined.`}
                </p>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setDraft(emptyDraft());
                    setError("");
                  }}
                >
                  <Plus />
                  Add Field
                </Button>
              </div>

              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-2 rounded-lg border border-input px-3 py-2"
                  >
                    <div className="flex flex-col">
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        disabled={index === 0 || deleteField.isPending}
                        onClick={() => handleMove(index, -1)}
                        aria-label="Move field up"
                      >
                        <ChevronUp />
                      </Button>

                      <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        disabled={
                          index === fields.length - 1 || deleteField.isPending
                        }
                        onClick={() => handleMove(index, 1)}
                        aria-label="Move field down"
                      >
                        <ChevronDown />
                      </Button>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {field.label}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        key: {field.field_key} · type:{" "}
                        {FIELD_LABELS[field.field_type] ?? field.field_type}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      {!field.active && (
                        <Badge className="border-amber-300 bg-amber-500/10 text-amber-600 dark:border-amber-400/40 dark:text-amber-400">
                          Inactive
                        </Badge>
                      )}

                      {field.required && (
                        <Badge className="border-destructive/30 bg-destructive/10 text-destructive">
                          Required
                        </Badge>
                      )}

                      <Button
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        onClick={() => {
                          setDraft(draftForField(formField(field)));
                          setError("");
                        }}
                        aria-label={`Edit ${field.label}`}
                      >
                        <Pencil />
                      </Button>

                      <Button
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        className="text-destructive hover:bg-destructive/10"
                        disabled={deleteField.isPending}
                        onClick={() => handleDelete(field)}
                        aria-label={`Delete ${field.label}`}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <DialogFooter showCloseButton>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}