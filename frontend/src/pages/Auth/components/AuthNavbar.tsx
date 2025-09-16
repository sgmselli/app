import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../../components/Logo";

interface AuthNavbarProps {
  route: string;
}

const AuthNavbar: React.FC<AuthNavbarProps> = ({route}: AuthNavbarProps) => {

    const navigate = useNavigate()

    const navigateLink = () => {
        if (route == "register") {
            navigate("/register")
        } if (route == "login") {
            navigate("/login")
        }
    }

    const navigateLanding = () => {
        navigate('/')
    }

    return (
        <nav className="w-full h-[90px] flex items-center justify-between px-6">
            <button onClick={navigateLanding} className="cursor-pointer">
                <Logo />
            </button>
            <div className="text-md font-light">
                {route === "register" && (
                    <h4><span className="hidden sm:inline">Have an account?</span> <span tabIndex={0} onClick={navigateLink} className="underline cursor-pointer hover:no-underline">Sign in</span></h4>
                )}
                {route === "login" && (
                    <h4><span className="hidden sm:inline">Don't have an account?</span> <span tabIndex={0} onClick={navigateLink} className="underline cursor-pointer hover:no-underline">Sign up</span></h4>
                )}
            </div>
        </nav>
    );
};

export default AuthNavbar;