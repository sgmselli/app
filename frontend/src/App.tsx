import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/protectedRoutes/protectedRoutes";
import UnauthorisedRoute from "./components/protectedRoutes/unauthorisedRoute";
import ProfileSetupRoute from "./components/protectedRoutes/ProfileSetUpRoute";
import ConnectBankRoute from "./components/protectedRoutes/ConnectBankRoute";
import Layout from "./components/Layout";

import Landing from "./pages/Landing/Landing";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ConnectBank from "./pages/ConnectBank/ConnectBank";
import ConnectBankSuccess from "./pages/ConnectBank/ConnectBankSuccess";
import ProfileSetUp from "./pages/ProfileSetUp/ProfileSetUp";
import SetUpConfirmation from "./pages/ProfileSetUp/SetUpConfirmation";
import Profile from "./pages/Profile/Profile";
import CheckoutSuccess from "./pages/Checkout/CheckoutSuccess";
import CheckoutFailure from "./pages/Checkout/CheckoutFailure";
import NotFound from "./pages/NotFound";


export default function App() {
  return (
    <Router>
        <AuthProvider>
          <Routes>
              <Route path="/" element={<Landing />} />

              {/* Unauthorised Routes */}
              <Route element={<UnauthorisedRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Protected Routes */}
              <Route element={<PrivateRoute />}>
                <Route element={<ProfileSetupRoute />}>
                  <Route path="/profile/setup" element={<ProfileSetUp />} />
                </Route>
                <Route element={<ConnectBankRoute />}>
                  <Route path="/bank/connect" element={<ConnectBank />} />
                </Route>
                <Route path="/bank/connect/success" element={<ConnectBankSuccess />} />
              </Route>

              <Route path="/:username" element={<Profile />} />
              <Route path="/bank/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/bank/checkout/failure" element={<CheckoutFailure />} />

              {/* 404 page */}
              <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
    </Router>
  );
}