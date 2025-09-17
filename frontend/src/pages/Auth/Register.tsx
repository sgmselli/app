import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { register } from "../../api/auth";
import { useAuth } from "../../contexts/AuthContext";
import AuthNavbar from "./components/AuthNavbar";
import Input, { InputLeftIcon } from "../../components/elements/input";
import MotionDiv from "../../components/divAnimation";

const Register: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
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
      console.log(err)
        const apiErrors = err?.response?.data?.errors || [];
        const newErrors: Record<string, string> = {};
        apiErrors.forEach((e: { field: string; message: string }) => {
          newErrors[e.field] = e.message;
        });
        setErrors(newErrors);
      }
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <AuthNavbar
        route="login"
      />

      <MotionDiv className="flex flex-1 items-center justify-center pb-40">
        <form 
          onSubmit={handleSubmit} 
          className="w-[90%] sm:w-full sm:max-w-md md:max-w-lg bg-white rounded-xl"
        >
          <div className="mb-10 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium mb-4">Create your account</h2>
          </div>
          <div className="form-control mb-8">
            <InputLeftIcon
              id="username"
              type="text"
              value={username}
              placeholder="Username"
              icon="www.tubetip.co/"
              onChange={setUsername}
              required={true}
              error={errors.username}
            />
          </div>

          <div className="form-control mb-8">
            <Input
              id="email"
              type="email"
              value={email}
              placeholder="Email"
              onChange={setEmail}
              required={true}
              error={errors.email}
            />
          </div>

          <div className="form-control mb-8">
            <Input
              id="password"
              type="password"
              value={password}
              placeholder="Password"
              onChange={setPassword}
              required={true}
              error={errors.password}
            />
          </div>

          <div className="form-control mb-8">
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              placeholder="Confirm Password"
              onChange={setConfirmPassword}
              required={true}
              error={errors.confirm_password}
            />
          </div>

        <button type="submit" className="btn btn-md sm:btn-lg primary-btn border-0 rounded-lg w-full font-normal text-md focus:outline-none" disabled={loading}>
            {
              loading ?
                <span className="loading loading-spinner"></span>
              : (
                "Sign up"
              )
            }
          </button>
        </form>
      </MotionDiv>
    </div>
  );
};

export default Register;