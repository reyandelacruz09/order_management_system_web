import { apiFetch, getApiErrorMessage } from "./api";

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  cost_price: number | null;
  reorder_level: number | null;
  is_active?: boolean;
}

export type CreateProductPayload = {
  name: string;
  price: number;
  stock: number;
  cost_price?: number | null;
  reorder_level?: number | null;
  is_active?: boolean;
};

export async function getProducts(): Promise<Product[]> {
  const response = await apiFetch("/api/products");

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to fetch products")
    );
  }

  return response.json();
}

export async function createProduct(data: CreateProductPayload) {
  const response = await apiFetch("/api/products", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to create product")
    );
  }

  return response.json();
}

export async function updateProduct(
  id: number,
  data: Partial<CreateProductPayload>
) {
  const response = await apiFetch(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to update product")
    );
  }

  return response.json();
}
