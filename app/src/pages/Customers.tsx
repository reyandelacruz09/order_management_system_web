import { UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/data-table";
import PermissionGate from "@/components/auth/PermissionGate";
import CreateCustomerDialog from "@/components/customers/CreateCustomerDialog";
import CustomerDetailDialog from "@/components/customers/CustomerDetailDialog";
import UpdateCustomerDialog from "@/components/customers/UpdateCustomerDialog";
import FormBuilderDialog from "@/components/customers/FormBuilderDialog";
import FormAssignmentDialog from "@/components/customers/FormAssignmentDialog";
import SetPasswordDialog from "@/components/customers/SetPasswordDialog";
import { useCustomers } from "@/hooks/useCustomers";
import useAuth from "@/hooks/useAuth";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import type { Customer } from "@/services/customers";

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export default function Customers() {
  const { user } = useAuth();
  const canManage = hasPermission(user, PERMISSIONS.customers.manage);
  const canManageForms = hasPermission(user, PERMISSIONS.orders.manage);
  const {
    data: customers = [],
    isPending,
    error,
  } = useCustomers();

  function handleDelete(id: number) {
    console.log("Delete customer:", id);
  }

  const columns: DataTableColumn<Customer>[] = [
    {
      id: "id",
      header: "ID",
      cellClassName: "text-muted-foreground",
      cell: (customer) => `#${customer.id}`,
    },
    {
      id: "customer",
      header: "Customer",
      cellClassName: "font-medium",
      cell: (customer) => (
        <div className="flex items-center gap-3 py-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-semibold text-indigo-500">
            {getInitials(customer.first_name, customer.last_name)}
          </div>

          <CustomerDetailDialog customer={customer} />
        </div>
      ),
    },
    {
      id: "email",
      header: "Email",
      cell: (customer) => customer.email,
    },
    {
      id: "phone",
      header: "Phone",
      cell: (customer) => customer.phone,
    },
    ...(canManage || canManageForms
      ? [
          {
            id: "actions",
            header: "Action",
            headerClassName: "text-right",
            cellClassName: "text-right",
            cell: (customer: Customer) => (
              <div className="flex justify-end gap-2">
                {canManage && <UpdateCustomerDialog customer={customer} />}
                {canManage && <SetPasswordDialog customer={customer} />}
                {canManageForms && <FormBuilderDialog customer={customer} />}
                {canManageForms && (
                  <FormAssignmentDialog customer={customer} />
                )}
                {canManage && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(customer.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  if (isPending) {
    return <div className="p-6">Loading customers...</div>;
  }

  if (error instanceof Error) {
    return (
      <div className="p-6 text-red-500">
        {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your customers and their details.
        </p>
      </div>

      <DataTable
        data={customers}
        columns={columns}
        getRowKey={(customer) => customer.id}
        title="Customer List"
        entityName="customers"
        searchable
        searchPlaceholder="Search customers..."
        getSearchText={(customer) =>
          `${customer.first_name} ${customer.last_name} ${customer.email}`
        }
        emptyIcon={UsersRound}
        emptyTitle="No customers found."
        actions={
          <PermissionGate permission={PERMISSIONS.customers.manage}>
            <CreateCustomerDialog />
          </PermissionGate>
        }
      />
    </div>
  );
}
