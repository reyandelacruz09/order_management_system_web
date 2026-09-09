import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/Dashboard";
import Orders from "../pages/Orders";
import Products from "../pages/Products";
import Customers from "../pages/Customers";
import Inventory from "../pages/Inventory";
import AuditLogs from "../pages/AuditLogs";
import Profile from "../pages/Profile";
import UserManagement from "../pages/UserManagement";
import FormTemplates from "../pages/FormTemplates";
import CustomerGroups from "../pages/CustomerGroups";
import Login from "../pages/login";
import CustomerLoginPage from "../pages/order/CustomerLoginPage";
import CustomerOrderPage from "../pages/order/CustomerOrderPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CustomerProtectedRoute from "@/components/auth/CustomerProtectedRoute";
import PermissionRoute from "@/components/auth/PermissionRoute";
import { PERMISSIONS } from "@/lib/permissions";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/order/login" element={<CustomerLoginPage />} />
        <Route element={<CustomerProtectedRoute />}>
          <Route path="/order" element={<CustomerOrderPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route
              element={
                <PermissionRoute permission={PERMISSIONS.dashboard.view} />
              }
            >
              <Route path="/" element={<Dashboard />} />
            </Route>
            <Route
              element={<PermissionRoute permission={PERMISSIONS.orders.view} />}
            >
              <Route path="/orders" element={<Orders />} />
            </Route>
            <Route
              element={
                <PermissionRoute permission={PERMISSIONS.products.view} />
              }
            >
              <Route path="/products" element={<Products />} />
            </Route>
            <Route
              element={
                <PermissionRoute permission={PERMISSIONS.customers.view} />
              }
            >
              <Route path="/customers" element={<Customers />} />
            </Route>
            <Route
              element={
                <PermissionRoute permission={PERMISSIONS.inventory.view} />
              }
            >
              <Route path="/inventory" element={<Inventory />} />
            </Route>
            <Route
              element={<PermissionRoute permission={PERMISSIONS.audit.view} />}
            >
              <Route path="/audit-logs" element={<AuditLogs />} />
            </Route>
            <Route path="/profile" element={<Profile />} />
            <Route
              element={<PermissionRoute permission={PERMISSIONS.users.manage} />}
            >
              <Route path="/users" element={<UserManagement />} />
            </Route>
            <Route
              element={
                <PermissionRoute permission={PERMISSIONS.orders.manage} />
              }
            >
              <Route path="/form-templates" element={<FormTemplates />} />
              <Route path="/customer-groups" element={<CustomerGroups />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}