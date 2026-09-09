import { useState } from "react";
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PermissionGate from "@/components/auth/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import { useProducts } from "@/hooks/useProducts";
import {
  useStockTransactions,
  useLowStock,
  useCreateStockTransaction,
} from "@/hooks/useStockTransactions";

const typeBadge: Record<string, string> = {
  in: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  out: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  adjust: "border-blue-500/30 bg-blue-500/10 text-blue-500",
};

export default function Inventory() {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");

  const { data: products = [], isPending: productsPending } = useProducts();
  const { data: lowStock = [], isPending: lowStockPending } = useLowStock();
  const { data: transactions = [], isPending: txPending } =
    useStockTransactions(selectedProduct ? Number(selectedProduct) : undefined);

  const productName = (id: number) =>
    products.find((p) => p.id === id)?.name ?? `Product #${id}`;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track stock levels and movement history.
          </p>
        </div>

        <PermissionGate permission={PERMISSIONS.inventory.manage}>
          <Button onClick={() => setOpen(true)}>
            <ArrowDownToLine className="size-4" />
            Stock In / Out
          </Button>
        </PermissionGate>
      </div>

      {/* Low stock alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-500" />
            Low Stock Alerts
          </CardTitle>
          <CardDescription>
            Products at or below their reorder level.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lowStockPending ? (
            <p className="text-sm text-muted-foreground">Loading alerts...</p>
          ) : lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No products are low on stock.
            </p>
          ) : (
            <div className="space-y-2">
              {lowStock.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Reorder level: {item.reorder_level ?? 0}
                    </p>
                  </div>
                  <Badge className="border-red-500/30 bg-red-500/10 text-red-500">
                    {item.stock} left
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction history */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Movements</CardTitle>
          <CardDescription>Latest stock transactions.</CardDescription>
          <CardAction>
            <select
              aria-label="Filter by product"
              className="h-8 w-44 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">All products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </CardAction>
        </CardHeader>
        <CardContent>
          {txPending ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No stock movements recorded.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">
                      {productName(tx.product_id)}
                    </TableCell>
                    <TableCell>
                      <Badge className={typeBadge[tx.type] ?? ""}>
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`text-right tabular-nums ${
                        tx.quantity > 0 ? "text-emerald-500" : "text-amber-600"
                      }`}
                    >
                      {tx.quantity > 0 ? "+" : ""}
                      {tx.quantity}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {tx.cost_price != null
                        ? `₱${Number(tx.cost_price).toFixed(2)}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {tx.note ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <StockTransactionDialog
        open={open}
        onOpenChange={setOpen}
        products={products}
        productsPending={productsPending}
      />
    </div>
  );
}

function StockTransactionDialog({
  open,
  onOpenChange,
  products,
  productsPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  products: { id: number; name: string; stock: number }[];
  productsPending: boolean;
}) {
  const [productId, setProductId] = useState("");
  const [type, setType] = useState("in");
  const [quantity, setQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const createTx = useCreateStockTransaction();

  function reset() {
    setProductId("");
    setType("in");
    setQuantity("");
    setCostPrice("");
    setNote("");
    setError("");
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (next) reset();
  }

  async function handleSubmit() {
    if (!productId) {
      setError("Please select a product.");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    try {
      await createTx.mutateAsync({
        product_id: Number(productId),
        quantity: Number(quantity),
        type,
        cost_price:
          type === "in" && costPrice !== "" ? Number(costPrice) : null,
        note: note.trim() || null,
      });

      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update stock. Please try again."
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Stock</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tx-product">Product</Label>
            <select
              id="tx-product"
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              disabled={productsPending}
            >
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.stock} in stock)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="tx-type"
                  value="in"
                  checked={type === "in"}
                  onChange={() => setType("in")}
                />
                <ArrowDownToLine className="size-4 text-emerald-500" />
                Stock In
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="tx-type"
                  value="out"
                  checked={type === "out"}
                  onChange={() => setType("out")}
                />
                <ArrowUpFromLine className="size-4 text-amber-500" />
                Stock Out
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx-qty">Quantity</Label>
            <Input
              id="tx-qty"
              type="number"
              min="1"
              step="1"
              value={quantity}
              placeholder="0"
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {type === "in" && (
            <div className="space-y-2">
              <Label htmlFor="tx-cost">Cost Per Unit (₱)</Label>
              <Input
                id="tx-cost"
                type="number"
                min="0"
                step="0.01"
                value={costPrice}
                placeholder="0.00"
                onChange={(e) => setCostPrice(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tx-note">Note</Label>
            <Input
              id="tx-note"
              value={note}
              placeholder="e.g. Stock received from supplier"
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createTx.isPending}>
            {createTx.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
