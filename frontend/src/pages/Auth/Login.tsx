import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import AuthNavbar from "./components/AuthNavbar";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string | string>("");
  const [password, setPassword] = useState<string | string>("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { username, has_profile, is_bank_connected } = await loginUser({email: email, password: password});
      if (!has_profile) {
        navigate("/profile/setup");
      } else if (!is_bank_connected) {
        navigate("/bank/connect");
      } else {
        navigate(`/${username}`);
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <AuthNavbar
        linkText="Don't have an account? Sign up"
        linkUrl="/register"
      />

      <div className="flex flex-1 items-start justify-center w-[100%] pt-[10%]">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm"
        >
          <h2 className="text-4xl font-medium mb-10 text-center">Welcome back</h2>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <div className="form-control mb-8">
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="input input-lg w-full bg-base-200 rounded-lg text-[14px] font-medium  focus:outline-none focus:border-2 focus:bg-white"
            />
          </div>

          <div className="form-control mb-8">
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="input input-lg w-full bg-base-200 rounded-lg text-[14px] font-medium  focus:outline-none focus:border-2 focus:bg-white"
            />
          </div>

          <button type="submit" className="btn btn-lg primary-btn border-0 rounded-lg w-full font-normal text-md focus:outline-none" disabled={loading}>
            {
              loading ?
                <span className="loading loading-spinner"></span>
              : (
                "Continue"
              )
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;