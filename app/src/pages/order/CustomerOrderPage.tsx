import { useMemo, useState } from "react";
import {
  LogOut,
  Minus,
  PackageOpen,
  Plus,
  ShoppingCart,
  Store,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CustomFieldsEditor from "@/components/orders/CustomFieldsEditor";
import {
  useCustomerCatalog,
  useCustomerOrders,
  useCustomerPortalForm,
  usePlaceCustomerOrder,
} from "@/hooks/useCustomerPortal";
import useCustomerAuth from "@/hooks/useCustomerAuth";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/services/products";

type CartItem = {
  product: Product;
  quantity: number;
};

export default function CustomerOrderPage() {
  const { customer, logout } = useCustomerAuth();
  const { data: catalog = [], isPending, error } = useCustomerCatalog();
  const { data: formFields = [] } = useCustomerPortalForm();
  const { data: orders = [] } = useCustomerOrders();
  const placeOrder = usePlaceCustomerOrder();

  const [cart, setCart] = useState<Record<number, CartItem>>({});
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errorMessage, setErrorMessage] = useState("");

  const cartItems = useMemo(
    () =>
      Object.values(cart).sort((a, b) => a.product.id - b.product.id),
    [cart]
  );

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev[product.id];
      const quantity = Math.min(
        (existing?.quantity ?? 0) + 1,
        product.stock
      );

      if (existing && quantity === existing.quantity) {
        return prev;
      }

      return { ...prev, [product.id]: { product, quantity } };
    });
  }

  function changeQuantity(productId: number, delta: -1 | 1) {
    setCart((prev) => {
      const current = prev[productId];

      if (!current) {
        return prev;
      }

      const quantity = Math.max(
        0,
        Math.min(current.quantity + delta, current.product.stock)
      );

      if (quantity === 0) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }

      return { ...prev, [productId]: { ...current, quantity } };
    });
  }

  function removeFromCart(productId: number) {
    setCart((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }

  async function handlePlaceOrder() {
    setErrorMessage("");

    if (cartItems.length === 0) {
      setErrorMessage("Add at least one product to your cart.");
      return;
    }

    try {
      await placeOrder.mutateAsync({
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        custom_fields: values,
      });

      setCart({});
      setValues({});
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to place order."
      );
    }
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <header className="sticky top-0 z-10 border-b bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Store className="size-4.5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Customer Order Portal</p>
              <p className="text-xs text-muted-foreground">
                {customer?.first_name} {customer?.last_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" onClick={logout}>
              <LogOut />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 p-4 sm:p-6 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Catalog</h1>
            <p className="text-sm text-muted-foreground">
              Add items to your cart and place an order.
            </p>
          </div>

          {isPending ? (
            <p className="text-sm text-muted-foreground">Loading catalog...</p>
          ) : error instanceof Error ? (
            <p className="text-sm text-red-500">{error.message}</p>
          ) : catalog.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
                <PackageOpen className="size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No products available right now.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {catalog.map((product) => {
                const inCart = cart[product.id]?.quantity ?? 0;
                const soldOut = inCart >= product.stock;

                return (
                  <Card key={product.id}>
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between text-base">
                        <span>{product.name}</span>
                        <Badge>{formatCurrency(Number(product.price))}</Badge>
                      </CardTitle>
                      <CardDescription>
                        {product.stock} in stock
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full"
                        disabled={soldOut}
                        onClick={() => addToCart(product)}
                      >
                        <Plus />
                        {soldOut ? "All stock in cart" : "Add to Cart"}
                        {inCart > 0 && ` (${inCart})`}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Order History
              </h2>
              <p className="text-sm text-muted-foreground">
                Your previously placed orders.
              </p>
            </div>

            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No orders yet.
                </CardContent>
              </Card>
            ) : (
              <Card>
                <div className="grid gap-4 p-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-wrap items-center gap-3 rounded-lg border border-input px-3 py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {order.order_number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(Number(order.total_amount))} ·{" "}
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge>{order.status}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </section>
        </section>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingCart />
                Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Your cart is empty.
                </p>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(Number(item.product.price))} each
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="icon-sm"
                          variant="outline"
                          onClick={() => changeQuantity(item.product.id, -1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus />
                        </Button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon-sm"
                          variant="outline"
                          disabled={item.quantity >= item.product.stock}
                          onClick={() => changeQuantity(item.product.id, 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus />
                        </Button>
                      </div>

                      <Button
                        size="icon-sm"
                        variant="outline"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => removeFromCart(item.product.id)}
                        aria-label="Remove item"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  ))}

                  <div className="flex items-center justify-between border-t pt-3 text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                </div>
              )}

              <CustomFieldsEditor
                fields={formFields}
                values={values}
                onChange={setValues}
              />

              {errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
              )}

              <Button
                className="w-full"
                onClick={handlePlaceOrder}
                disabled={placeOrder.isPending || cartItems.length === 0}
              >
                {placeOrder.isPending ? "Placing order..." : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}