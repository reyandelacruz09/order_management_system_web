import { useState } from "react";
import { LayoutTemplate } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useFormTemplates } from "@/hooks/useFormTemplates";
import {
  useCustomerFormAssignment,
  useSetCustomerFormAssignment,
} from "@/hooks/useCustomers";
import type { Customer } from "@/services/customers";

type Props = {
  customer: Customer;
};

export default function FormAssignmentDialog({ customer }: Props) {
  const [open, setOpen] = useState(false);
  const { data: templates = [] } = useFormTemplates();
  const { data: assignment, isPending } = useCustomerFormAssignment(
    open ? customer.id : null
  );
  const setAssignment = useSetCustomerFormAssignment();

  const [templateId, setTemplateId] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState("");

  if (open && assignment && !initialized) {
    setInitialized(true);
    setTemplateId(assignment.template_id);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setInitialized(false);
      setError("");
    }
  }

  async function handleSave() {
    setError("");

    try {
      await setAssignment.mutateAsync({
        id: customer.id,
        template_id: templateId,
      });
      setOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update assignment."
      );
    }
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <LayoutTemplate />
        Form Template
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign a Form Template</DialogTitle>
            <DialogDescription>
              Choose a reusable form template for {customer.first_name}{" "}
              {customer.last_name}. Note: if this customer has their own custom
              fields from the Form Builder, those take priority and this
              template is ignored.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-form-template">Form Template</Label>

              {isPending ? (
                <p className="text-sm text-muted-foreground">
                  Loading assignment...
                </p>
              ) : (
                <select
                  id="customer-form-template"
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={templateId ?? ""}
                  onChange={(e) =>
                    setTemplateId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                >
                  <option value="">No template (use form builder fields)</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              disabled={isPending || setAssignment.isPending}
            >
              {setAssignment.isPending ? "Saving..." : "Save Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}