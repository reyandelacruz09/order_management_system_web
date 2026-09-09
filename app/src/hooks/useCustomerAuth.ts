import { useContext } from "react";

import {
  CustomerAuthContext,
  type CustomerAuthContextValue,
} from "@/contexts/customerAuth";

export default function useCustomerAuth(): CustomerAuthContextValue {
  const ctx = useContext(CustomerAuthContext);

  if (!ctx) {
    throw new Error(
      "useCustomerAuth must be used within a CustomerAuthProvider"
    );
  }

  return ctx;
}