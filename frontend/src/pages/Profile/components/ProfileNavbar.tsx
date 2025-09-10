import React, { useState } from "react";
import Logo from "../../../components/Logo";
import EditProfileModal from "./EditProfileModal";

interface ProfileNavbarProps {
  myProfilePicture?: string;
  profilePictureUrl?: string;
  profileBannerUrl?: string;
  displayName?: string;
  bio?: string;
  numberOfTips?: number;
  bankConnected?: boolean | null;
  isLoggedInUser?: boolean | null;
  isAuthenticated: () => boolean
  logoutUser?: () => void;
  loginUser?: () => void;
  onSave: (formData: {
    displayName: string;
    bio: string;
    profilePictureUrl: string;
    profileBannerUrl: string;
  }) => void
}

const ProfileNavbar: React.FC<ProfileNavbarProps> = ({
  myProfilePicture,
  profilePictureUrl,
  profileBannerUrl,
  displayName,
  bio,
  numberOfTips,
  bankConnected,
  isLoggedInUser,
  isAuthenticated,
  logoutUser,
  loginUser,
  onSave
}) => {

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <nav className="w-full h-[150px] flex items-center justify-between px-14 pt-10 pb-6" >
      <div className="flex flex-row gap-6 items-center">
        {
          profilePictureUrl ?
            <img src={profilePictureUrl} className="h-[80px] w-[80px] object-cover rounded-xl  border-base-300" />
          :
            <h1>{profilePictureUrl}</h1>
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
          <div className="flex flex-row items-center justify-center gap-4">
            {
              isLoggedInUser && (
                <button
                  className="btn btn-neutral text-white rounded-full border-0 btn-md"
                  onClick={() => setIsModalOpen(true)}
                >
                  Edit Profile
                </button>
              )
            }
            <EditProfileModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              initialDisplayName={displayName}
              initialBio={bio}
              initialProfilePicture={profilePictureUrl}
              initialProfileBanner={profileBannerUrl}
              onSave={onSave}
            />
            <UserMenu logoutUser={logoutUser} profile_picture_url={myProfilePicture} />
          </div>
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

interface UserMenuProps {
  profile_picture_url?: string | null;
  logoutUser: () => void;
}

function UserMenu({ logoutUser, profile_picture_url }: UserMenuProps) {
  return (
    <div className="dropdown dropdown-end">
      {/* Avatar button */}
      <div
        tabIndex={0}
        role="button"
        className="w-11 h-11 rounded-full overflow-hidden cursor-pointer flex items-center justify-center bg-white shadow-xl"
      >
        {profile_picture_url ? (
          <img
            src={profile_picture_url}
            alt="User avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <Logo />
        )}
      </div>

      {/* Dropdown menu */}
      <ul
        tabIndex={0}
        className="dropdown-content menu mt-3 w-40 rounded-lg bg-base-100 shadow"
      >
        <li>
          <button onClick={logoutUser}>Logout</button>
        </li>
      </ul>
    </div>
  );
}

export default ProfileNavbar;