import { useState } from "react";
import { PackageSearch, Search } from "lucide-react";

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
import PermissionGate from "@/components/auth/PermissionGate";
import CreateProductDialog from "@/components/products/CreateProductDialog";
import UpdateProductDialog from "@/components/products/UpdateProductDialog";
import { useProducts } from "@/hooks/useProducts";
import useAuth from "@/hooks/useAuth";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";

function getStockBadge(stock: number) {
  if (stock === 0) {
    return {
      label: "Out of stock",
      className: "border-red-500/30 bg-red-500/10 text-red-500",
    };
  }

  if (stock < 20) {
    return {
      label: "Low stock",
      className: "border-amber-500/30 bg-amber-500/10 text-amber-600",
    };
  }

  return {
    label: "In stock",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  };
}

export default function Products() {
  const { user } = useAuth();
  const canManage = hasPermission(user, PERMISSIONS.products.manage);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const {
    data: products = [],
    isPending,
    error,
  } = useProducts();

  const pageSize = 10;

  const filtered = products.filter((product) =>
    product.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  function handleDelete(id: number) {
    console.log("Delete product:", id);
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  if (isPending) {
    return <div className="p-6">Loading products...</div>;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your product catalog and inventory.
          </p>
        </div>

        <PermissionGate permission={PERMISSIONS.products.manage}>
          <CreateProductDialog />
        </PermissionGate>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>{filtered.length} products</CardDescription>

          <CardAction>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search products..."
                className="w-56 pl-8"
              />
            </div>
          </CardAction>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Catalog</TableHead>
                {canManage && (
                  <TableHead className="text-right">Action</TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canManage ? 7 : 6}
                    className="py-12"
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <PackageSearch className="size-8" />
                      <p>No products found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((product) => {
                  const badge = getStockBadge(product.stock);

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="text-muted-foreground">
                        #{product.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        ₱{Number(product.price).toFixed(2)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {product.stock}
                      </TableCell>
                      <TableCell>
                        <Badge className={badge.className}>
                          {badge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.is_active === false ? (
                          <Badge className="border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground">
                            Hidden
                          </Badge>
                        ) : (
                          <Badge className="border-indigo-300 bg-indigo-500/10 text-indigo-600 dark:border-indigo-400/40 dark:text-indigo-400">
                            Visible
                          </Badge>
                        )}
                      </TableCell>
                      {canManage && (
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <UpdateProductDialog product={product} />

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(product.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {filtered.length === 0 ? 0 : start + 1}–
                {Math.min(start + pageSize, filtered.length)}
              </span>{" "}
              of {filtered.length}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
