import React, { useState } from "react";
import { Copy } from "lucide-react";

import Logo from "../../../components/Logo";
import EditProfileModal from "./EditProfileModal";

interface ProfileNavbarProps {
  username?: string;
  myProfilePictureUrl?: string;
  profilePictureUrl: string | null;
  profileBannerUrl: string | null;
  displayName: string | null;
  bio: string | null;
  numberOfTips: number | null;
  bankConnected: boolean | null;
  isLoggedInUser: boolean | null;
  navigateMyProfile: () => void;
  isAuthenticated: () => boolean
  logoutUser: () => void;
  loginUser: () => void;
  onSave: (formData: {
    displayName: string;
    bio: string;
    profilePictureUrl: string;
    profileBannerUrl: string;
  }) => void
}

const ProfileNavbar: React.FC<ProfileNavbarProps> = ({
  username,
  myProfilePictureUrl,
  profilePictureUrl,
  profileBannerUrl,
  displayName,
  bio,
  numberOfTips,
  bankConnected,
  isLoggedInUser,
  navigateMyProfile,
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
          !!profilePictureUrl ?
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
          <div className="flex flex-row items-center justify-center gap-4">
            <CopyUrl username={username} />
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
            <UserMenu 
              myProfilePictureUrl={myProfilePictureUrl}
              navigateMyProfile={navigateMyProfile} 
              logoutUser={logoutUser} 
            />
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
  myProfilePictureUrl?: string;
  navigateMyProfile: () => void;
  logoutUser: () => void;
}

function UserMenu({ myProfilePictureUrl, navigateMyProfile, logoutUser }: UserMenuProps) {
  return (
    <div className="dropdown dropdown-end">
      {/* Avatar button */}
      <div
        tabIndex={0}
        role="button"
        className="w-11 h-11 rounded-full overflow-hidden cursor-pointer flex items-center justify-center bg-white shadow-xl"
      >
        {myProfilePictureUrl ? (
          <img
            src={myProfilePictureUrl}
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
          <button onClick={navigateMyProfile}>My profile</button>
        </li>
        <li>
          <button onClick={logoutUser}>Log out</button>
        </li>
      </ul>
    </div>
  );
}

type CopyUrlProps = {
  username?: string;
  urlPrefix?: string;
};

function CopyUrl({
  username,
  urlPrefix = "www.tubetip.co",
}: CopyUrlProps) {
  const [copied, setCopied] = useState(false);
  const url = `${urlPrefix}/${username}`;

  const handleCopy = async () => {
    try {
      if (!username) return;
      // Prefer modern API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers
        const el = document.createElement("textarea");
        el.value = url;
        el.setAttribute("readonly", "");
        el.style.position = "absolute";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      window.getSelection()?.removeAllRanges();
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleFocusSelect = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  };

  return (
    <div className={`flex items-center gap-0 cursor-pointer`} onClick={handleCopy}>
      <div
        aria-label="Profile URL"
        className="flex justify-center items-center text-sm bg-base-200 rounded-l-lg rounded-r-none border border-gray-200 
                  focus:outline-none focus:ring-offset-0 h-10 px-4"
        onFocus={handleFocusSelect}
        onClick={(e) => (e.currentTarget as HTMLInputElement).select()}
      >
        {url}
      </div>

      <button
        type="button"
        aria-label={copied ? "Copied" : "Copy profile URL"}
        className={`flex items-center gap-2 px-4 rounded-l-none rounded-r-lg border border-l-0 border-gray-200 
                    bg-white hover:bg-gray-50 focus:outline-none h-10`}
      >
        {copied ? (
          <span className="text-sm font-medium">Copied!</span>
        ) : (
          <>
            <span className="text-sm font-medium">Share</span>
            <Copy size={16} />
          </>
        )}
      </button>
    </div>
  );
}

export default ProfileNavbar;