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
import { useCreateOrder } from "@/hooks/userOrders";
import { useCustomers } from "@/hooks/useCustomers";
import { useProducts } from "@/hooks/useProducts";
import { useCustomerFormFields } from "@/hooks/useFormFields";
import OrderItemsEditor from "./OrderItemsEditor";
import CustomFieldsEditor from "./CustomFieldsEditor";
import { emptyItemRow, type OrderItemFormRow } from "./orderItemsForm";

const ORDER_STATUSES = ["Pending", "Processing", "Completed"];

export default function CreateOrderDialog() {
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState("Pending");
  const [items, setItems] = useState<OrderItemFormRow[]>([{ ...emptyItemRow }]);
  const [customValues, setCustomValues] = useState<Record<string, unknown>>();
  const [error, setError] = useState("");

  const createOrder = useCreateOrder();
  const { data: customers = [] } = useCustomers();
  const { data: products = [] } = useProducts();
  const { data: formFields = [] } = useCustomerFormFields(
    customerId ? Number(customerId) : null
  );

  const activeFields = formFields.filter((field) => field.active);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen) {
      setCustomerId("");
      setStatus("Pending");
      setItems([{ ...emptyItemRow }]);
      setCustomValues(undefined);
      setError("");
    }
  }

  async function handleCreate() {
    if (!customerId) {
      setError("Please select a customer.");
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
      await createOrder.mutateAsync({
        customer_id: Number(customerId),
        status,
        items: items.map((row) => ({
          product_id: Number(row.product_id),
          quantity: Number(row.quantity),
        })),
        custom_fields: customValues ?? {},
      });

      setOpen(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create order. Please try again."
      );
    }
  }

  return (
    <>
      <Button onClick={() => handleOpenChange(true)}>Add Order</Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Order</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="order-customer">Customer</Label>
              <select
                id="order-customer"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={customerId}
                onChange={(e) => {
                  setCustomerId(e.target.value);
                  setCustomValues(undefined);
                }}
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.first_name} {customer.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order-status">Status</Label>
              <select
                id="order-status"
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
                values={customValues ?? {}}
                onChange={setCustomValues}
              />
            )}

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button onClick={handleCreate} disabled={createOrder.isPending}>
              {createOrder.isPending ? "Creating..." : "Create Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
