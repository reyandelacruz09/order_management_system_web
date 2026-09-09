import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useOrder, useUpdateOrder } from "@/hooks/userOrders";
import { useProducts } from "@/hooks/useProducts";
import { useCustomerFormFields } from "@/hooks/useFormFields";
import OrderItemsEditor from "./OrderItemsEditor";
import CustomFieldsEditor from "./CustomFieldsEditor";
import type { OrderItemFormRow } from "./orderItemsForm";
import type { OrderWithItems } from "@/services/orders";
import type { Product } from "@/services/products";

const ORDER_STATUSES = ["Pending", "Processing", "Completed"];

type Props = {
  orderId: number;
};

export default function UpdateOrderDialog({ orderId }: Props) {
  const [open, setOpen] = useState(false);

  const { data: products = [] } = useProducts();
  const { data: order, isPending } = useOrder(open ? orderId : null);

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
      >
        Update
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order #{orderId}</DialogTitle>
          </DialogHeader>

          {isPending || !order ? (
            <p className="py-4 text-sm text-muted-foreground">
              Loading order...
            </p>
          ) : (
            <UpdateOrderForm
              order={order}
              products={products}
              onSaved={() => setOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

type FormProps = {
  order: OrderWithItems;
  products: Product[];
  onSaved: () => void;
};

function UpdateOrderForm({ order, products, onSaved }: FormProps) {
  const [status, setStatus] = useState(order.status);
  const [items, setItems] = useState<OrderItemFormRow[]>(
    order.items.map((item) => ({
      product_id: String(item.product_id),
      quantity: String(item.quantity),
    }))
  );
  const [customValues, setCustomValues] = useState<Record<string, unknown>>(
    () => ({ ...(order.custom_fields ?? {}) })
  );
  const [error, setError] = useState("");

  const updateOrder = useUpdateOrder();
  const { data: formFields = [] } = useCustomerFormFields(order.customer_id);

  const activeFields = formFields.filter((field) => field.active);

  async function handleSave() {
    if (items.length === 0) {
      setError("An order needs at least one item.");
      return;
    }

    for (const row of items) {
      if (!row.product_id) {
        setError("Please select a product for every item.");
        return;
      }

      if (
        !row.quantity ||
        !Number.isInteger(Number(row.quantity)) ||
        Number(row.quantity) <= 0
      ) {
        setError("Quantity must be a whole number greater than zero.");
        return;
      }
    }

    try {
      await updateOrder.mutateAsync({
        id: order.id,
        data: {
          status,
          items: items.map((row) => ({
            product_id: Number(row.product_id),
            quantity: Number(row.quantity),
          })),
          custom_fields: customValues,
        },
      });

      onSaved();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update order. Please try again."
      );
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`order-status-${order.id}`}>Status</Label>
          <select
            id={`order-status-${order.id}`}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {ORDER_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <OrderItemsEditor
          products={products}
          rows={items}
          onChange={setItems}
        />

        {activeFields.length > 0 && (
          <CustomFieldsEditor
            fields={activeFields}
            values={customValues}
            onChange={setCustomValues}
          />
        )}

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onSaved}>
          Cancel
        </Button>

        <Button onClick={handleSave} disabled={updateOrder.isPending}>
          {updateOrder.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </>
  );
}
