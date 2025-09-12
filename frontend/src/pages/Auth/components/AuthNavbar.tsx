import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../../components/Logo";

interface AuthNavbarProps {
  linkText: string;
  linkUrl: string;
}

const AuthNavbar: React.FC<AuthNavbarProps> = (props: AuthNavbarProps) => {

    const navigate = useNavigate()

    const navigateLink = () => {
        navigate(props.linkUrl)
    }

    const navigateLanding = () => {
        navigate('/')
    }

    return (
        <nav className="w-full h-[150px] flex items-center justify-between px-14">
            <button onClick={navigateLanding} className="cursor-pointer">
                <Logo />
            </button>
            <button className="text-md font-light cursor-pointer hover:underline" onClick={navigateLink}>{props.linkText}</button>
        </nav>
    );
};

export default AuthNavbar;