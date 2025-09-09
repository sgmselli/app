import { useNavigate } from "react-router-dom"

import Logo from "./Logo";
import { useAuth } from "../contexts/AuthContext";

import profile from '../assets/images/youtube_profile.jpg'

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const { logoutUser } = useAuth();

    const navigateLanding = () => {
        navigate('/')
    }

    const handleLogout = async () => {
        await logoutUser();
        navigate('/login')
    }

    return (
        <nav className="w-full h-[150px] flex items-center justify-between px-14">
            <button onClick={navigateLanding} className="cursor-pointer">
                <Logo />
            </button>
            <button onClick={handleLogout} className="btn btn-outline">
                Logout
            </button>
        </nav>
    );
}

export default Navbar;