import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

const Footer = () => {

    const { logoutUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        navigate('/login')
    }

    return (
        <button onClick={handleLogout}>
            Logout
        </button>
    )
}

export default Footer;