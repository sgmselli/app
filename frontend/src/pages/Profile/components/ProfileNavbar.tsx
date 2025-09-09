import React from "react";
import Logo from "../../../components/Logo";

interface ProfileNavbarProps {
  profilePictureUrl?: string;
  displayName?: string;
  numberOfTips?: number;
  bankConnected?: boolean | null;
  isAuthenticated: () => boolean
  logoutUser?: () => void;
  loginUser?: () => void;
}

const ProfileNavbar: React.FC<ProfileNavbarProps> = ({
  profilePictureUrl,
  displayName,
  numberOfTips,
  bankConnected,
  isAuthenticated,
  logoutUser,
  loginUser,
}) => {
  return (
    <nav className="w-full h-[150px] flex items-center justify-between px-14" >
      <div className="flex flex-row gap-6 items-center">
        {
          profilePictureUrl ?
            <img src={profilePictureUrl} className="h-[80px] w-[80px] object-cover rounded-xl  border-base-300" />
          :
            <Logo />
        }
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold">{displayName}</h1>
          {bankConnected && (
            <h3 className="text-md text-gray-500 font-light">{numberOfTips} {(numberOfTips === undefined || numberOfTips !== 1) ? "tips" : "tip"}</h3>
          )}
        </div>
      </div>

      <div>
        {isAuthenticated() ? (
          <button
            className="btn btn-outline btn-neutral btn-md"
            onClick={logoutUser}
          >
            Logout
          </button>
        ) : (
          <button
            className="cursor-pointer"
            onClick={loginUser}
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default ProfileNavbar;