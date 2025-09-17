import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

export default function PrivateRoute() {
  const { user, loadingUser } = useAuth();

  if (loadingUser) {
    return <div className="flex items-center justify-center h-screen"><span className="loading primary-text loading-xl"></span></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.has_profile == false && location.pathname !== "/profile/setup" && location.pathname !== "/profile/setup/confirmation") {
    return <Navigate to={"/profile/setup"} replace />;
  }

  return <Outlet />;
}