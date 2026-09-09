import { useState } from "react";
import {
  ClipboardList,
  FilePlus2,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TemplateFormBuilderDialog from "@/components/formTemplates/TemplateFormBuilderDialog";
import {
  useCreateFormTemplate,
  useDeleteFormTemplate,
  useFormTemplates,
  useUpdateFormTemplate,
} from "@/hooks/useFormTemplates";
import type {
  CreateFormTemplatePayload,
  FormTemplate,
} from "@/services/formTemplates";

type TemplateForm = {
  id?: number;
  name: string;
  description: string;
  active: boolean;
};

function emptyTemplateForm(): TemplateForm {
  return { name: "", description: "", active: true };
}

function templateFormFor(template: FormTemplate): TemplateForm {
  return {
    id: template.id,
    name: template.name,
    description: template.description ?? "",
    active: template.active,
  };
}

export default function FormTemplates() {
  const { data: templates = [], isPending, error } = useFormTemplates();
  const createTemplate = useCreateFormTemplate();
  const updateTemplate = useUpdateFormTemplate();
  const deleteTemplate = useDeleteFormTemplate();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TemplateForm>(emptyTemplateForm());
  const [formError, setFormError] = useState("");

  function handleOpen(next: TemplateForm | null) {
    if (!next) {
      setOpen(false);
      setFormError("");
      return;
    }

    setForm(next);
    setFormError("");
    setOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setFormError("Template name is required.");
      return;
    }

    const payload: CreateFormTemplatePayload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      active: form.active,
    };

    try {
      if (form.id != null) {
        await updateTemplate.mutateAsync({ id: form.id, data: payload });
      } else {
        await createTemplate.mutateAsync(payload);
      }

      setOpen(false);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Failed to save template. Please try again."
      );
    }
  }

  async function handleDelete(template: FormTemplate) {
    if (
      !window.confirm(
        `Delete the form template "${template.name}"? Customers using it will fall back to their per-customer fields or group templates.`
      )
    ) {
      return;
    }

    try {
      await deleteTemplate.mutateAsync(template.id);
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Failed to delete template."
      );
    }
  }

  const columns: DataTableColumn<FormTemplate>[] = [
    {
      id: "id",
      header: "ID",
      cellClassName: "text-muted-foreground",
      cell: (template) => `#${template.id}`,
    },
    {
      id: "name",
      header: "Template",
      cellClassName: "font-medium",
      cell: (template) => template.name,
    },
    {
      id: "fields",
      header: "Fields",
      cell: (template) => template.fields?.length ?? 0,
    },
    {
      id: "description",
      header: "Description",
      cell: (template) => (
        <span className="text-muted-foreground">
          {template.description || "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (template) =>
        template.active ? (
          <Badge className="border-emerald-300 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/40 dark:text-emerald-400">
            Active
          </Badge>
        ) : (
          <Badge className="border-amber-300 bg-amber-500/10 text-amber-600 dark:border-amber-400/40 dark:text-amber-400">
            Inactive
          </Badge>
        ),
    },
    {
      id: "actions",
      header: "Action",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (template) => (
        <div className="flex justify-end gap-2">
          <TemplateFormBuilderDialog template={template} />

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpen(templateFormFor(template))}
          >
            <Pencil />
            Edit
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="text-destructive hover:bg-destructive/10"
            disabled={deleteTemplate.isPending}
            onClick={() => handleDelete(template)}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  if (isPending) {
    return <div className="p-6">Loading form templates...</div>;
  }

  if (error instanceof Error) {
    return <div className="p-6 text-red-500">{error.message}</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Form Templates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reusable order forms you can assign to customers or customer groups.
        </p>
      </div>

      <DataTable
        data={templates}
        columns={columns}
        getRowKey={(template) => template.id}
        title="Reusable Form Templates"
        entityName="templates"
        searchable
        searchPlaceholder="Search templates..."
        getSearchText={(template) => template.name}
        emptyIcon={ClipboardList}
        emptyTitle="No form templates yet."
        emptyDescription="Create a reusable form and assign it to a customer or group."
        actions={
          <Button onClick={() => handleOpen(emptyTemplateForm())}>
            <FilePlus2 />
            New Template
          </Button>
        }
      />

      <Dialog open={open} onOpenChange={() => handleOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {form.id != null ? "Edit Template" : "Create Template"}
            </DialogTitle>
            <DialogDescription>
              {form.id != null
                ? "Update the details of this reusable form template."
                : "Create a reusable form template for customers or groups."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Name</Label>
              <Input
                id="template-name"
                value={form.name}
                placeholder="e.g. Wholesale Order"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-description">Description</Label>
              <Input
                id="template-description"
                value={form.description}
                placeholder="Short description of when to use this form"
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-indigo-500"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Active
            </label>

            {formError && <p className="text-sm text-red-500">{formError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpen(null)}>
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              disabled={createTemplate.isPending || updateTemplate.isPending}
            >
              {createTemplate.isPending || updateTemplate.isPending
                ? "Saving..."
                : form.id != null
                  ? "Save Template"
                  : "Create Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}