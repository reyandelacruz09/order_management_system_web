import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCustomerPasswordStatus,
  useSetCustomerPassword,
} from "@/hooks/useCustomers";
import type { Customer } from "@/services/customers";

type Props = {
  customer: Customer;
};

const CHARACTERS =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";

function generatePassword(): string {
  const length = 12;
  let password = "";

  for (let i = 0; i < length; i++) {
    password += CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
  }

  return password;
}

export default function SetPasswordDialog({ customer }: Props) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<{ email: string; password: string } | null>(
    null
  );

  const { data: status, isPending } = useCustomerPasswordStatus(
    open ? customer.id : null
  );
  const setPasswordMutation = useSetCustomerPassword();

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen) {
      setPassword("");
      setShowPassword(false);
      setError("");
      setSaved(null);
    }
  }

  async function handleSave() {
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      await setPasswordMutation.mutateAsync({
        id: customer.id,
        password,
      });

      setSaved({
        email: customer.email,
        password,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to set customer password. Please try again."
      );
    }
  }

  async function handleCopy() {
    if (!saved) {
      return;
    }

    try {
      await navigator.clipboard.writeText(saved.password);
    } catch {
      // clipboard not available; ignore
    }
  }

  const displayName = `${customer.first_name} ${customer.last_name}`;

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <KeyRound />
        Set Password
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Portal Password</DialogTitle>
            <DialogDescription>
              Set the password {displayName} uses to sign in to the customer
              order portal with their email.
            </DialogDescription>
          </DialogHeader>

          {saved ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-emerald-300 bg-emerald-500/10 p-3.5 text-sm text-emerald-600 dark:border-emerald-400/40 dark:text-emerald-400">
                <CheckCircle2 className="mt-0.5 size-4.5 shrink-0" />
                <div>
                  <p className="font-medium">Password saved.</p>
                  <p>
                    Send this once to {saved.email} — the password is only shown
                    now.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={saved.email} readOnly />
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <div className="flex gap-2">
                  <Input value={saved.password} readOnly />
                  <Button
                    variant="outline"
                    onClick={handleCopy}
                    aria-label="Copy password"
                  >
                    <Copy />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {isPending ? (
                <p className="text-sm text-muted-foreground">
                  Checking current status...
                </p>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Current password:
                  </span>
                  {status?.has_password ? (
                    <Badge className="border-emerald-300 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/40 dark:text-emerald-400">
                      Set
                    </Badge>
                  ) : (
                    <Badge className="border-amber-300 bg-amber-500/10 text-amber-600 dark:border-amber-400/40 dark:text-amber-400">
                      Not set yet
                    </Badge>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="customer-password">New password</Label>
                <div className="relative">
                  <Input
                    id="customer-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
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

              <Button
                variant="outline"
                onClick={() => {
                  const next = generatePassword();
                  setPassword(next);
                  setShowPassword(true);
                }}
              >
                <RefreshCw />
                Generate password
              </Button>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              {saved ? "Done" : "Cancel"}
            </Button>

            {!saved && (
              <Button
                onClick={handleSave}
                disabled={setPasswordMutation.isPending}
              >
                {setPasswordMutation.isPending ? "Saving..." : "Set Password"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}