import React from "react"
import { useNavigate } from "react-router-dom"

import { useAuth } from "../../contexts/AuthContext";

const SetUpConfirmation: React.FC = () => {

    const navigate = useNavigate();
    const { user } = useAuth();
    const username = user?.username

    const handleNavigate = () => {
        navigate(`/${username}`);
    }

    return (
        <div>
            <h2>You have successfully set up your account!</h2>
            <button 
                onClick={handleNavigate}
            >
                Continue to your profile
            </button>
        </div>
    )
}

export default SetUpConfirmation;