import React, { useState, useEffect } from 'react';
import { useParams, Params, useNavigate, useLocation } from 'react-router-dom';
import { Link as LinkIcon, ChevronDown } from "lucide-react";

import { getCreatorProfile } from '../../api/profile';
import Donate from './components/Donate';
import Tips from './components/Tips';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrencySymbol } from '../../components/currencySymbolConverter';
import ProfileFooter from './components/ProfileFooter';
import ProfileNavbar from './components/ProfileNavbar';
import TipsModal from './components/TipModal';
import type { Tip } from '../../types/tip';
import MotionDiv from '../../components/divAnimation';

interface SucessCheckoutModalProps {
    setIsThanksModalOpen: (isOpen: boolean) => void;
}

interface ErrorCheckoutModalProps {
    setIsErrorModalOpen: (isOpen: boolean) => void;
}

const Profile: React.FC = () => {
    const { username }: Readonly<Params<string>> = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Profile state
    const [id, setId] = useState<number | null>(null);
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [bio, setBio] = useState<string | null>(null);
    const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
    const [profileBannerUrl, setProfileBannerUrl] = useState<string | null>(null);
    const [youtubeChannelName, setYoutubeChannelName] = useState<string | null>(null);
    const [currency, setCurrency] = useState<string | null>(null);
    const [tubeTipValue, setTubeTipValue] = useState<number | null>(null);
    const [tips, setTips] = useState<Tip[]>([]);
    const [numberOfTips, setNumberOfTips] = useState<number>(0);
    const [bankConnected, setBankConnected] = useState<boolean | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [isThanksModalOpen, setIsThanksModalOpen] = useState(false);

    const { isAuthenticated, loadingUser, logoutUser, user } = useAuth();

    // Handle query params for Stripe success
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const result = params.get("result");
        if (result === "success") {
            setIsThanksModalOpen(true);
            navigate(location.pathname, { replace: true });
        } else if (result === "cancel") {
            setIsErrorModalOpen(true);
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    // Fetch profile
    useEffect(() => {
        const handleFetch = async () => {
            setLoading(true);
            if (username) {
                try {
                    const profile = await getCreatorProfile({ username });
                    setDisplayName(profile.display_name);
                    setBio(profile.bio);
                    setCurrency(getCurrencySymbol(profile.currency));
                    setTubeTipValue(profile.tube_tip_value)
                    setTips(profile.tips);
                    setNumberOfTips(profile.number_of_tips);
                    setYoutubeChannelName(profile.youtube_channel_name);
                    setProfilePictureUrl(profile.profile_picture_url);
                    setProfileBannerUrl(profile.profile_banner_url);
                    setBankConnected(profile.is_bank_connected);
                    setId(profile.id);
                } catch (err: any) {
                    setError(err.response?.data?.error || "TubeTip profile does not exist");
                } finally {
                    setLoading(false);
                }
            }
        };
        handleFetch();
    }, [username]);

    const handleSave = (formData: { displayName?: string | null; bio?: string | null; profilePictureUrl?: string | null; profileBannerUrl?: string | null }) => {
        if (formData.displayName) setDisplayName(formData.displayName);
        if (formData.bio) setBio(formData.bio);
        if (formData.profilePictureUrl) setProfilePictureUrl(formData.profilePictureUrl);
        if (formData.profileBannerUrl) setProfileBannerUrl(formData.profileBannerUrl);
    };

    const handleLogout = async () => {
        await logoutUser();
        navigate('/login');
    };

    const navigateLogin = () => {
        navigate("/login");
    };

    const navigateMyProfile = () => {
        navigate(`/${user?.username}`);
    };

    if (loading || loadingUser) {
        return <div className="flex items-center justify-center h-screen"><span className="loading primary-text loading-xl"></span></div>;
    }

    const isLoggedInUser = user?.username === username;

    return (
        <div className="flex flex-col min-h-screen w-full bg-white">
  {/* Modals */}
  {isThanksModalOpen && (
    <SucessCheckoutModal setIsThanksModalOpen={setIsThanksModalOpen} />
  )}
  {isErrorModalOpen && (
    <ErrorCheckoutModal setIsErrorModalOpen={setIsErrorModalOpen} />
  )}

  {/* Connect bank banner */}
  {isLoggedInUser && !bankConnected && <ConnectBankBanner />}

  <ProfileNavbar
    username={username}
    isLoggedInUser={isLoggedInUser}
    onSave={handleSave}
    bankConnected={bankConnected}
    profilePictureUrl={profilePictureUrl}
    profileBannerUrl={profileBannerUrl}
    displayName={displayName}
    bio={bio}
    numberOfTips={numberOfTips}
    myProfilePictureUrl={user?.profile_picture_url}
    isAuthenticated={isAuthenticated}
    loginUser={navigateLogin}
    logoutUser={handleLogout}
    navigateMyProfile={navigateMyProfile}
  />

  {!error ? (
    <div className="flex flex-col items-center w-full">
      <div className="flex-1 w-full max-w-[1100px] md:px-6">
        {/* Banner */}
        {profileBannerUrl && (
          <MotionDiv className="relative">
            <img
              src={profileBannerUrl}
              alt="YouTube Banner"
              className="w-full h-[180px] object-cover shadow-xl 
                        rounded-none md:rounded-xl mt-0 md:mt-5 object-cover"
            />

            {/* Profile picture over banner (mobile/tablet) */}
            
          </MotionDiv>

        )}

        {profilePictureUrl && (
                <MotionDiv className={`flex flex-col items-center gap-3 ${profileBannerUrl && "-mt-15"} px-4 md:hidden relative z-50`}>
                    <img
                        src={profilePictureUrl}
                        alt={displayName || "Profile"}
                        className="w-[100px] h-[100px] rounded-lg border-4 border-white shadow-xl object-cover"
                    />
                    <div className='text-center'>
                        <h2 className="text-lg font-semibold">{displayName}</h2>
                        <p className="text-sm text-gray-500">
                            {numberOfTips} tips
                        </p>
                    </div>
                </MotionDiv>
            )}

        {/* Content layout */}
        <div className="flex flex-col md:flex-row justify-center items-center md:items-start md:justify-between gap-6 md:gap-12 mt-8 md:mt-[60px] pb-15">
          {/* Left column (About + Tips) */}
          <div className="flex flex-col justify-center gap-6 w-[90%] md:w-[500px] order-2 md:order-1">
            {/* Donate Section (mobile first, on top) */}
            <div className="flex justify-center p-6 rounded-xl bg-white shadow-xl md:hidden">
              <Donate
                displayName={displayName || ""}
                username={username || ""}
                currency={currency || ""}
                tubeTipValue={tubeTipValue || 3}
                bankConnected={bankConnected}
              />
            </div>

            {/* About Section */}
            <MotionDiv
                className="flex flex-col shadow-xl rounded-xl bg-white p-6"
            >
              <h2 className="text-lg font-medium mb-2">About {displayName}</h2>

              <a
                href={`https://www.youtube.com/@${youtubeChannelName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm md:text-md text-gray-500 italic flex items-center gap-2 hover:text-red-300 cursor-pointer mb-2 w-fit"
              >
                <LinkIcon size={16} className="text-gray-400" />
                {`www.youtube.com/@${youtubeChannelName}`}
              </a>

              <p className="text-sm md:text-md mt-2">{bio}</p>
            </MotionDiv >

            {/* Tips Section */}
            <MotionDiv
                className="flex flex-col shadow-xl rounded-xl bg-white p-6"
            >
              <h2 className="text-xl font-medium">Recent tips</h2>
              {numberOfTips === 0 ? (
                <div className="p-10 rounded-lg w-full flex items-center justify-center h-[150px] mt-4 bg-red-50 border-2 border-red-100">
                  <p className="text-gray-700 text-center text-sm">
                    <span className="font-semibold">It's a bit quiet here...</span> be the first one to tip {displayName}.
                  </p>
                </div>
              ) : (
                <>
                  <Tips tips={tips} currency={currency} />
                  {numberOfTips > 8 && (
                    <>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-lg btn-neutral hover:text-white btn-outline text-[16px] font-normal rounded-full mt-2 flex items-center gap-2"
                      >
                        See more tips
                        <ChevronDown size={18} />
                      </button>
                      <TipsModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        id={id}
                        currency={currency}
                      />
                    </>
                  )}
                </>
              )}
            </MotionDiv>
          </div>

          {/* Right column (Donate) for desktop */}
          <MotionDiv
            className="p-10 rounded-xl bg-white shadow-xl hidden md:block order-1 md:order-2"
        >
            <Donate
              displayName={displayName || ""}
              username={username || ""}
              currency={currency || ""}
              tubeTipValue={tubeTipValue || 3}
              bankConnected={bankConnected}
            />
          </MotionDiv>
        </div>
      </div>

    </div>
  ) : (
    <div className="flex justify-center items-center text-center pt-20 px-4">
        <h2
            className="text-xl md:text-3xl"
        >
            You've came to the wrong place, no profile exists here.
        </h2>
    </div>
  )}
      <ProfileFooter isAuthenticated={isAuthenticated} />

</div>
    );
};

const ConnectBankBanner = () => {
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate('/bank/connect');
    };

    return (
        <div className='flex justify-center items-center w-full h-[80px] bg-red-50 gap-5 px-4'>
            <h2 className="text-sm text-gray-700 font-semibold text-center md:text-start">
                Please link your bank account with Stripe to start receiving payments. <span onClick={handleNavigate} className="font-bold underline hover:no-underline md:hidden">Click here.</span>
            </h2>
            <button onClick={handleNavigate} className='btn btn-md btn-neutral text-white hidden md:block'>
                Complete setup
            </button>
        </div>
    );
};

const SucessCheckoutModal = ({
    setIsThanksModalOpen,
}: SucessCheckoutModalProps) => {
    return (
        <dialog open className="modal modal-open">
            <div className="modal-box max-w-md text-center p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                    🎉 Thanks for your support!
                </h2>
                <p className="text-gray-600 mb-6">
                    Your tip has been received.
                </p>
                <div className="modal-action flex justify-center">
                    <button
                        className="btn btn-md primary-btn text-white rounded-lg border-0"
                        onClick={() => setIsThanksModalOpen(false)}
                    >
                        Close
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={() => setIsThanksModalOpen(false)}>close</button>
            </form>
        </dialog>
    );
};

const ErrorCheckoutModal = ({
    setIsErrorModalOpen,
}: ErrorCheckoutModalProps) => {
    return (
        <dialog open className="modal modal-open">
            <div className="modal-box max-w-md text-center p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                    We had a problem with your checkout 😔
                </h2>
                <p className="text-gray-600 mb-6">
                    Your tip has not been received. Please try again.
                </p>
                <div className="modal-action flex justify-center">
                    <button
                        className="btn btn-md primary-btn text-white rounded-lg border-0"
                        onClick={() => setIsErrorModalOpen(false)}
                    >
                        Close
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={() => setIsErrorModalOpen(false)}>close</button>
            </form>
        </dialog>
    );
};

export default Profile;