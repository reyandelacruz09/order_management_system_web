import { PackageOpen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/data-table";
import PermissionGate from "@/components/auth/PermissionGate";
import CreateOrderDialog from "@/components/orders/CreateOrderDialog";
import UpdateOrderDialog from "@/components/orders/UpdateOrderDialog";
import DeleteOrderDialog from "@/components/orders/DeleteOrderDialog";
import { useOrders } from "@/hooks/userOrders";
import { useCustomers } from "@/hooks/useCustomers";
import useAuth from "@/hooks/useAuth";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import type { OrderRow } from "@/services/orders";

const statusClassName: Record<string, string> = {
  Pending: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  Processing: "border-blue-500/30 bg-blue-500/10 text-blue-500",
  Completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
};

export default function Orders() {
  const { user } = useAuth();
  const canManage = hasPermission(user, PERMISSIONS.orders.manage);
  const {
    data,
    isPending,
    error,
  } = useOrders();
  const { data: customers = [] } = useCustomers();

  const orders = data?.items ?? [];

  const customerName = (id: number) => {
    const customer = customers.find((c) => c.id === id);
    return customer ? `${customer.first_name} ${customer.last_name}` : null;
  };

  const columns: DataTableColumn<OrderRow>[] = [
    {
      id: "id",
      header: "ID",
      cellClassName: "text-muted-foreground",
      cell: (order) => `#${order.id}`,
    },
    {
      id: "customer",
      header: "Customer",
      cellClassName: "font-medium",
      cell: (order) =>
        customerName(order.customer_id) ?? `Customer #${order.customer_id}`,
    },
    {
      id: "total",
      header: "Total",
      cellClassName: "tabular-nums",
      cell: (order) => `₱${Number(order.total_amount).toFixed(2)}`,
    },
    {
      id: "status",
      header: "Status",
      cell: (order) => (
        <Badge className={statusClassName[order.status] ?? ""}>
          {order.status}
        </Badge>
      ),
    },
    {
      id: "date",
      header: "Date",
      cellClassName: "text-muted-foreground",
      cell: (order) => new Date(order.created_at).toLocaleDateString(),
    },
    ...(canManage
      ? [
          {
            id: "actions",
            header: "Action",
            headerClassName: "text-right",
            cellClassName: "text-right",
            cell: (order: OrderRow) => (
              <div className="flex items-center justify-end gap-2">
                <UpdateOrderDialog orderId={order.id} />
                <DeleteOrderDialog orderId={order.id} />
              </div>
            ),
          },
        ]
      : []),
  ];

  if (isPending) {
    return <div className="p-6">Loading orders...</div>;
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
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track and manage customer orders.
        </p>
      </div>

      <DataTable
        data={orders}
        columns={columns}
        getRowKey={(order) => order.id}
        title="Order List"
        entityName="orders"
        searchable
        searchPlaceholder="Search orders..."
        getSearchText={(order) =>
          `${order.order_number} ${order.status}`
        }
        emptyIcon={PackageOpen}
        emptyTitle="No orders found."
        actions={
          <PermissionGate permission={PERMISSIONS.orders.manage}>
            <CreateOrderDialog />
          </PermissionGate>
        }
      />
    </div>
  );
}
