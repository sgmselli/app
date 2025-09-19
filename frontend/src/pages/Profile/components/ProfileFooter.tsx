import React from "react";
import { useNavigate } from "react-router-dom";

interface ProfileFooterProps {
  isAuthenticated: () => boolean
}

const ProfileFooter: React.FC<ProfileFooterProps> = ({
  isAuthenticated
}) => {
  const navigate = useNavigate();

  const handleRegisterRedirect = () => {
    if (isAuthenticated()) return;
    navigate("/register");
  };

  return (
    <footer className="footer sm:footer-horizontal footer-center bg-base-300 text-base-content py-4 mt-auto w-full">
      <aside className="w-fit text-center whitespace-normal break-words">
        <p className="w-fit">
          Copyright © {new Date().getFullYear()} - Start your own{" "}
          <span
            onClick={handleRegisterRedirect}
            data-tip="You already have an account 🙂"
            className={`${isAuthenticated() && "md:tooltip"} font-medium cursor-pointer underline hover:no-underline`}
          >
            TubeTip.co page
          </span>
        </p>
      </aside>
    </footer>
  );
};

export default ProfileFooter;