import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateProduct } from "@/hooks/useProducts";
import type { Product } from "@/services/products";

type Props = {
  product: Product;
};

export default function UpdateProductDialog({ product }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: product.name,
    price: String(product.price),
    stock: String(product.stock),
    is_active: product.is_active ?? true,
  });
  const [error, setError] = useState("");

  const updateProduct = useUpdateProduct();

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen) {
      setForm({
        name: product.name,
        price: String(product.price),
        stock: String(product.stock),
        is_active: product.is_active ?? true,
      });
      setError("");
    }
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      setError("Price must be greater than zero.");
      return;
    }

    if (form.stock === "" || Number(form.stock) < 0) {
      setError("Stock must be zero or more.");
      return;
    }

    try {
      await updateProduct.mutateAsync({
        id: product.id,
        data: {
          name: form.name.trim(),
          price: Number(form.price),
          stock: Number(form.stock),
          is_active: form.is_active,
        },
      });

      setOpen(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update product. Please try again."
      );
    }
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => handleOpenChange(true)}>
        Update
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Product #{product.id}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="update-product-name">Name</Label>
              <Input
                id="update-product-name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-product-price">Price</Label>
              <Input
                id="update-product-price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-product-stock">Stock</Label>
              <Input
                id="update-product-stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: e.target.value })
                }
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-indigo-500"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
              />
              Visible in customer catalog
            </label>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button onClick={handleSave} disabled={updateProduct.isPending}>
              {updateProduct.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
