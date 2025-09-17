import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function ConnectBankRoute() {
  const { user, loadingUser } = useAuth();

  if (loadingUser) return <div className="flex items-center justify-center h-screen"><span className="loading primary-text loading-xl"></span></div>;

  if (user?.is_bank_connected) {
    return <Navigate to={`/${user.username}`} replace />;
  }

  return <Outlet />;
}