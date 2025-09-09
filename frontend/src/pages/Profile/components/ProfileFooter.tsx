import React from "react";
import { useNavigate } from "react-router-dom";

const ProfileFooter: React.FC = () => {
  const navigate = useNavigate();

  const handleRegisterRedirect = () => {
    navigate("/register");
  };

  const text = "Start your own TubeTip page >"

  return (
    <footer className="w-full py-6 mt-12 flex flex-col items-center justify-center">
      <p 
        className="text-lg mb-2"
        onClick={handleRegisterRedirect}
      >
        {/* {text} */}
      </p>
    </footer>
  );
};

export default ProfileFooter;