import AuthProvider from "./contexts/AuthProvider";
import CustomerAuthProvider from "./contexts/CustomerAuthProvider";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <AuthProvider>
      <CustomerAuthProvider>
        <AppRoutes />
      </CustomerAuthProvider>
    </AuthProvider>
  );
}