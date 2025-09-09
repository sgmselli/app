import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function ProfileSetupRoute() {
  const { user, loadingUser } = useAuth();

  if (loadingUser) return <div>Loading...</div>;

  if (user?.has_profile) {
    return <Navigate to={`/${user.username}`} replace />;
  }

  return <Outlet />;
}