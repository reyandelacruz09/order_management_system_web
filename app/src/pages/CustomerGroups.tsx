import { useState } from "react";
import { Pencil, Trash2, UsersRound } from "lucide-react";

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
import {
  useCreateCustomerGroup,
  useCustomerGroupMembers,
  useCustomerGroups,
  useDeleteCustomerGroup,
  useSetCustomerGroupMembers,
  useUpdateCustomerGroup,
} from "@/hooks/useCustomerGroups";
import { useCustomers } from "@/hooks/useCustomers";
import { useFormTemplates } from "@/hooks/useFormTemplates";
import type { CustomerGroup } from "@/services/customerGroups";

type GroupForm = {
  id?: number;
  name: string;
  template_id: number | null;
  active: boolean;
};

function emptyGroupForm(): GroupForm {
  return { name: "", template_id: null, active: true };
}

function groupFormFor(group: CustomerGroup): GroupForm {
  return {
    id: group.id,
    name: group.name,
    template_id: group.template_id,
    active: group.active,
  };
}

export default function CustomerGroups() {
  const { data: groups = [], isPending, error } = useCustomerGroups();
  const { data: templates = [] } = useFormTemplates();
  const createGroup = useCreateCustomerGroup();
  const updateGroup = useUpdateCustomerGroup();
  const deleteGroup = useDeleteCustomerGroup();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<GroupForm>(emptyGroupForm());
  const [formError, setFormError] = useState("");

  const [membersOpenFor, setMembersOpenFor] = useState<CustomerGroup | null>(
    null
  );

  function handleOpen(next: GroupForm | null) {
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
      setFormError("Group name is required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      template_id: form.template_id,
      active: form.active,
    };

    try {
      if (form.id != null) {
        await updateGroup.mutateAsync({ id: form.id, data: payload });
      } else {
        await createGroup.mutateAsync(payload);
      }

      setOpen(false);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Failed to save group. Please try again."
      );
    }
  }

  async function handleDelete(group: CustomerGroup) {
    if (!window.confirm(`Delete the customer group "${group.name}"?`)) {
      return;
    }

    try {
      await deleteGroup.mutateAsync(group.id);
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Failed to delete group."
      );
    }
  }

  const columns: DataTableColumn<CustomerGroup>[] = [
    {
      id: "id",
      header: "ID",
      cellClassName: "text-muted-foreground",
      cell: (group) => `#${group.id}`,
    },
    {
      id: "name",
      header: "Group",
      cellClassName: "font-medium",
      cell: (group) => group.name,
    },
    {
      id: "template",
      header: "Form Template",
      cell: (group) =>
        group.template ? (
          group.template.name
        ) : (
          <span className="text-muted-foreground">No template</span>
        ),
    },
    {
      id: "members",
      header: "Members",
      cell: (group) => group.member_count ?? 0,
    },
    {
      id: "status",
      header: "Status",
      cell: (group) =>
        group.active ? (
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
      cell: (group) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setMembersOpenFor(group)}
          >
            <UsersRound />
            Members
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpen(groupFormFor(group))}
          >
            <Pencil />
            Edit
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="text-destructive hover:bg-destructive/10"
            disabled={deleteGroup.isPending}
            onClick={() => handleDelete(group)}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  if (isPending) {
    return <div className="p-6">Loading customer groups...</div>;
  }

  if (error instanceof Error) {
    return <div className="p-6 text-red-500">{error.message}</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Groups</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Group customers together and give them a shared reusable order form.
        </p>
      </div>

      <DataTable
        data={groups}
        columns={columns}
        getRowKey={(group) => group.id}
        title="Customer Groups"
        entityName="groups"
        searchable
        searchPlaceholder="Search groups..."
        getSearchText={(group) => group.name}
        emptyIcon={UsersRound}
        emptyTitle="No customer groups yet."
        emptyDescription="Create a group and assign a reusable form template to it."
        actions={
          <Button onClick={() => handleOpen(emptyGroupForm())}>
            New Group
          </Button>
        }
      />

      <Dialog open={open} onOpenChange={() => handleOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {form.id != null ? "Edit Group" : "Create Group"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Name</Label>
              <Input
                id="group-name"
                value={form.name}
                placeholder="e.g. Wholesale"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="group-template">Form Template</Label>
              <select
                id="group-template"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={form.template_id ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    template_id: e.target.value ? Number(e.target.value) : null,
                  })
                }
              >
                <option value="">No template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
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
              disabled={createGroup.isPending || updateGroup.isPending}
            >
              {createGroup.isPending || updateGroup.isPending
                ? "Saving..."
                : form.id != null
                  ? "Save Group"
                  : "Create Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MembersDialog
        group={membersOpenFor}
        onClose={() => setMembersOpenFor(null)}
      />
    </div>
  );
}

type MembersDialogProps = {
  group: CustomerGroup | null;
  onClose: () => void;
};

function MembersDialog({ group, onClose }: MembersDialogProps) {
  const groupId = group?.id ?? null;
  const { data: members = [], isPending } = useCustomerGroupMembers(groupId);
  const { data: customers = [] } = useCustomers();
  const setMembers = useSetCustomerGroupMembers();

  const [selected, setSelected] = useState<number[]>([]);
  const [loadedFor, setLoadedFor] = useState<{
    groupId: number | null;
    isPending: boolean;
  }>({ groupId: null, isPending: true });

  if (
    loadedFor.groupId !== groupId ||
    (loadedFor.isPending && !isPending)
  ) {
    setLoadedFor({ groupId, isPending });
    setSelected(members.map((member) => member.id));
  }

  if (!group) {
    return null;
  }

  const currentGroup = group;

  function toggleCustomer(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }

  async function handleSave() {
    try {
      await setMembers.mutateAsync({
        groupId: currentGroup.id,
        customerIds: selected,
      });
      onClose();
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Failed to update members."
      );
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Members of {currentGroup.name}</DialogTitle>
          <DialogDescription>
            Select the customers that belong to this group.
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <p className="py-4 text-sm text-muted-foreground">
            Loading members...
          </p>
        ) : (
          <div className="max-h-80 space-y-1 overflow-y-auto border rounded-lg p-3">
            {customers.map((customer) => {
              const checked = selected.includes(customer.id);

              return (
                <label
                  key={customer.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    className="size-4 accent-indigo-500"
                    checked={checked}
                    onChange={() => toggleCustomer(customer.id)}
                  />
                  <span className="font-medium">
                    {customer.first_name} {customer.last_name}
                  </span>
                  <span className="ml-auto text-muted-foreground">
                    {customer.email}
                  </span>
                </label>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={handleSave} disabled={setMembers.isPending}>
            {setMembers.isPending ? "Saving..." : "Save Members"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}