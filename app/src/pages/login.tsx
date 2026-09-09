import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  ChartNoAxesColumnIncreasing,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Package,
  ShoppingCart,
  Store,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/services/auth";
import useAuth from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: ChartNoAxesColumnIncreasing,
    label: "Real-time dashboard",
    description: "Track orders, revenue, and stock at a glance.",
  },
  {
    icon: ShoppingCart,
    label: "Order management",
    description: "Create and fulfill orders with a few clicks.",
  },
  {
    icon: Package,
    label: "Inventory tracking",
    description: "Never run out of stock with live updates.",
  },
  {
    icon: Users,
    label: "Customer insights",
    description: "Manage customers and purchase history in one place.",
  },
];

function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser({
        email,
        password,
      });

      login(data.user);

      navigate("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to login.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="relative min-h-screen bg-muted/50">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-40 -bottom-40 h-[28rem] w-[28rem] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute top-1/3 right-1/3 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
        <aside className="hidden lg:flex flex-col justify-between p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <Store className="size-5" />
            </div>
            <p className="text-base font-semibold leading-tight">
              Order Management System
            </p>
          </div>

          <div className="space-y-8">
            <h1 className="max-w-md text-4xl leading-tight font-semibold tracking-tight text-balance">
              Run your business from one{" "}
              <span className="bg-linear-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                simple dashboard
              </span>
              .
            </h1>

            <ul className="grid max-w-md gap-4">
              {FEATURES.map(({ icon: Icon, label, description }) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-primary ring-1 ring-foreground/10">
                    <Icon className="size-4.5" />
                  </span>
                  <div>
                    <p className="text-sm leading-none font-medium">{label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Order Management System
          </p>
        </aside>

        <main className="flex items-center justify-center p-4 sm:p-8">
          <Card className="w-full max-w-md border-transparent shadow-xl shadow-primary/5 ring-foreground/5 sm:border-border sm:ring-foreground/10">
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <div className="flex items-center gap-3 lg:hidden">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                    <Store className="size-5" />
                  </div>
                  <p className="text-base leading-tight font-semibold">
                    Order Management System
                  </p>
                </div>

                <h2 className="pt-4 text-3xl font-semibold tracking-tight">
                  Welcome back
                </h2>
                <p className="text-sm text-muted-foreground">
                  Sign in to your account to continue.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      className="h-11 rounded-lg pl-10"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="h-11 rounded-lg pr-10 pl-10"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4.5" />
                      ) : (
                        <Eye className="size-4.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground select-none">
                    <span className="relative inline-flex">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(event) => setRememberMe(event.target.checked)}
                        className="peer sr-only"
                      />
                      <span
                        className={cn(
                          "flex size-4 items-center justify-center rounded border border-input bg-background transition-colors peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 peer-focus-visible:ring-offset-2",
                          rememberMe && "border-primary bg-primary"
                        )}
                      >
                        <Check
                          className={cn(
                            "size-3 text-primary-foreground transition-opacity",
                            rememberMe ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </span>
                    </span>
                    Remember me
                  </label>

                  <button
                    type="button"
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </button>
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

                <Button
                  type="submit"
                  size="lg"
                  className="h-11 w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="size-4 transition-transform group-hover/button:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

export default Login;