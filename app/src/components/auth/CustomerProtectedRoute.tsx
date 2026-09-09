import { Navigate, Outlet, useLocation } from "react-router-dom";
import useCustomerAuth from "@/hooks/useCustomerAuth";

function CustomerProtectedRoute() {
  const { isAuthenticated, ready } = useCustomerAuth();
  const location = useLocation();

  if (!ready) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/order/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}

export default CustomerProtectedRoute;