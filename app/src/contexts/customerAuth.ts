import { createContext } from "react";

import type { CustomerAccount } from "@/services/customerPortal";

export type CustomerAuthContextValue = {
  customer: CustomerAccount | null;
  isAuthenticated: boolean;
  ready: boolean;
  login: (customer: CustomerAccount) => void;
  logout: () => void;
};

export const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(
  null
);