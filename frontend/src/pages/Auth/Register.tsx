import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { register } from "../../api/auth";
import { useAuth } from "../../contexts/AuthContext";
import AuthNavbar from "./components/AuthNavbar";

const Register: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const navigateLogin = () => {
    navigate('/login')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register({username: username, email: email, password: password, confirm_password: confirmPassword});
      try {
        setLoading(true);
        const {username, has_profile, is_bank_connected} = await loginUser({email: email, password: password})
        if (!has_profile) {
          navigate("/profile/setup");
        } else if (is_bank_connected) {
          navigate('/bank/connect')
        } else {
          navigate(`/${username}`)
        }
      } catch (err: any) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Register failed");
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <AuthNavbar
        linkText="Have an account? Sign in"
        linkUrl="/login"
      />

      <div className="flex flex-1 items-start justify-center w-[100%] pt-[10%]">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <h2 className="text-4xl font-medium mb-10 text-center">Create your account</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className="form-control mb-8">
            <input
              id="username"
              type="text"
              value={username}
              placeholder="Username"
              onChange={e => setUsername(e.target.value)}
              required
              className="input input-lg w-full bg-base-200 rounded-lg text-[14px] font-medium focus:outline-none focus:border-2 focus:bg-white"
            />
          </div>

          <div className="form-control mb-8">
            <input
              id="email"
              type="email"
              value={email}
              placeholder="Email"
              onChange={e => setEmail(e.target.value)}
              required
              className="input input-lg w-full bg-base-200 rounded-lg text-[14px] font-medium focus:outline-none focus:border-2 focus:bg-white"
            />
          </div>

          <div className="form-control mb-8">
            <input
              id="password"
              type="password"
              value={password}
              placeholder="Password"
              onChange={e => setPassword(e.target.value)}
              required
              className="input input-lg w-full bg-base-200 rounded-lg text-[14px] font-medium  focus:outline-none focus:border-2 focus:bg-white"
            />
          </div>

          <div className="form-control mb-8">
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              placeholder="Confirm Password"
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="input input-lg w-full bg-base-200 rounded-lg text-[14px] font-medium focus:outline-none focus:border-2 focus:bg-white"
            />
          </div>

        <button type="submit" className="btn btn-lg primary-btn border-0 rounded-lg w-full font-normal text-md focus:outline-none" disabled={loading}>
            {
              loading ?
                <span className="loading loading-spinner"></span>
              : (
                "Sign up"
              )
            }
          </button>
      </form>
      </div>
    </div>
  );
};

export default Register;