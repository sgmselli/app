import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import AuthNavbar from "./components/AuthNavbar";
import Input from "../../components/elements/input";

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
      setError("Your email or password was incorrect");
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <AuthNavbar
        linkText="Don't have an account? Sign up"
        linkUrl="/register"
      />
      <div className="flex flex-1 items-start justify-center w-[100%] pt-[6%]">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md"
        >
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-medium mb-4">Welcome back</h2>
            <h4 className="text-lg font-normal mb-10 text-center text-gray-500">
              Enter your login credentials to access your TubeTip account.
            </h4>
            {error && <h5 className="text-red-500 text-md">{error}</h5>}
          </div>
          
          <div className="form-control mb-8">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Email"
              required={true}
            />
          </div>

          <div className="form-control mb-8">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Password"
              required={true}
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