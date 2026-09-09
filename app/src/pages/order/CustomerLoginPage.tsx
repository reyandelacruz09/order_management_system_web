import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Lock,
  Mail,
  Store,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCustomerLogin } from "@/hooks/useCustomerPortal";
import useCustomerAuth from "@/hooks/useCustomerAuth";

export default function CustomerLoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useCustomerAuth();
  const loginCustomer = useCustomerLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      const data = await loginCustomer.mutateAsync({
        email: email.trim().toLowerCase(),
        password,
      });
      login(data.customer);
      navigate("/order", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to sign in. Try again."
      );
    }
  }

  if (isAuthenticated) {
    return <Navigate to="/order" replace />;
  }

  return (
    <div className="relative min-h-screen bg-muted/50">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -right-40 -bottom-40 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-md border-transparent shadow-xl shadow-primary/5 sm:border-border sm:ring-foreground/10">
          <CardContent className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                  <Store className="size-5" />
                </div>
                <p className="text-base font-semibold">Customer Order Portal</p>
              </div>

              <h2 className="pt-4 text-3xl font-semibold tracking-tight">
                Welcome back
              </h2>
              <p className="text-sm text-muted-foreground">
                Sign in to place an order with your company.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="customer-email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="customer-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    className="h-11 rounded-lg pl-10"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={loginCustomer.isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="customer-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="h-11 rounded-lg pl-10"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={loginCustomer.isPending}
                  />
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" size="lg" className="h-11 w-full">
                {loginCustomer.isPending ? "Signing in..." : "Sign In"}
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}