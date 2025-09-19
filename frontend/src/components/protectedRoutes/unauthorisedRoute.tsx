import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

export default function UnauthorisedRoute() {
  const { user, loadingUser } = useAuth();

  if (loadingUser) {
    return <div className="flex items-center justify-center h-screen"><span className="loading primary-text loading-xl"></span></div>;
  }

  if (user?.has_profile == false) {
    return <Navigate to={"/profile/setup"} replace />;
  }

  if (user?.is_bank_connected == false) {
    return <Navigate to={"/bank/connect"} replace />;
  }

  if (user) {
    return <Navigate to={`/${user.username}`} replace />;
  }

  return <Outlet />;
}