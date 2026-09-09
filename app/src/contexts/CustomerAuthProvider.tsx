import { useEffect, useState, type ReactNode } from "react";

import {
  CustomerAuthContext,
  type CustomerAuthContextValue,
} from "./customerAuth";
import {
  getCustomerMe,
  logoutCustomer,
  type CustomerAccount,
} from "@/services/customerPortal";

export default function CustomerAuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [customer, setCustomer] = useState<CustomerAccount | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    getCustomerMe()
      .then(({ customer: current }) => {
        if (active) setCustomer(current);
      })
      .catch(() => {
        if (active) setCustomer(null);
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  function login(current: CustomerAccount) {
    setCustomer(current);
  }

  async function logout() {
    try {
      await logoutCustomer();
    } finally {
      setCustomer(null);
    }
  }

  const value: CustomerAuthContextValue = {
    customer,
    isAuthenticated: !!customer,
    ready,
    login,
    logout,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}