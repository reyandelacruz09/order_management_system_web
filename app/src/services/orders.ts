import { apiFetch, getApiErrorMessage } from "./api";

export interface OrderItemRow {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: string | number;
}

export interface OrderRow {
  id: number;
  customer_id: number;
  order_number: string;
  status: string;
  total_amount: string | number;
  created_at: string;
  custom_fields?: Record<string, unknown>;
}

export type OrderWithItems = OrderRow & {
  items: OrderItemRow[];
};

export type OrderItemPayload = {
  product_id: number;
  quantity: number;
};

export type CreateOrderPayload = {
  customer_id: number;
  status?: string;
  items: OrderItemPayload[];
  custom_fields?: Record<string, unknown>;
};

export type UpdateOrderPayload = {
  status?: string;
  items?: OrderItemPayload[];
  custom_fields?: Record<string, unknown>;
};

export type OrdersPage = {
  items: OrderRow[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export async function getOrders(): Promise<OrdersPage> {
  const response = await apiFetch("/api/orders");

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to fetch orders")
    );
  }

  return response.json();
}

export async function getOrder(id: number): Promise<OrderWithItems> {
  const response = await apiFetch(`/api/orders/${id}`);

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to fetch order")
    );
  }

  return response.json();
}

export async function createOrder(data: CreateOrderPayload) {
  const response = await apiFetch("/api/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to create order")
    );
  }

  return response.json();
}

export async function updateOrder(id: number, data: UpdateOrderPayload) {
  const response = await apiFetch(`/api/orders/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to update order")
    );
  }

  return response.json();
}

export async function deleteOrder(id: number) {
  const response = await apiFetch(`/api/orders/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to delete order")
    );
  }

  return response.json();
}
