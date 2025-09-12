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

    const handleSave = (formData: { displayName?: string; bio?: string; profilePictureUrl?: string; profileBannerUrl?: string }) => {
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
        return <div><h2>Loading...</h2></div>;
    }

    const isLoggedInUser = user?.username === username;

    return (
        <div className="flex flex-col min-h-screen w-full bg-white">
            {/* Stripe Checkout Thanks Modal */}
            {isThanksModalOpen && (
                <SucessCheckoutModal
                    setIsThanksModalOpen={setIsThanksModalOpen}
                />
            )}

            {/* Stripe Checkout Error Modal */}
            {isErrorModalOpen && (
                <ErrorCheckoutModal
                    setIsErrorModalOpen={setIsErrorModalOpen}
                />
            )}

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
                    <div className="w-95% max-w-[1100px]">
                        {profileBannerUrl && (
                            <img
                                src={profileBannerUrl}
                                alt="YouTube Banner"
                                className="w-full h-[180px] object-cover rounded-xl shadow-lg mt-5"
                            />
                        )}

                        {/* Content row */}
                        <div className="flex flex-row justify-between items-start gap-12 mt-[60px]">
                            <div className="flex flex-col justify-start gap-6 w-[500px]">
                                {/* About Section */}
                                <div className="flex flex-col shadow-lg rounded-xl bg-white p-6">
                                    <h2 className="text-lg font-medium mb-2">About {displayName}</h2>

                                    <a
                                        href={`https://www.youtube.com/@${youtubeChannelName}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-md text-gray-500 italic flex items-center gap-2 hover:text-red-300 cursor-pointer mb-2 w-fit"
                                    >
                                        <LinkIcon size={16} className="text-gray-400" />
                                        {`www.youtube.com/@${youtubeChannelName}`}
                                    </a>

                                    <p className="text-md mt-2">{bio}</p>
                                </div>

                                {/* Tips Section */}
                                <div className="flex flex-col shadow-lg rounded-xl bg-white p-6">
                                    <h2 className="text-xl font-medium">Recent tips</h2>
                                    {numberOfTips === 0 ? (
                                        <div className="p-10 rounded-lg w-full flex items-center justify-center h-[150px] mt-4 bg-red-50 border-2 border-red-100">
                                            <p className="text-gray-700 text-center text-sm">
                                                <span className="font-semibold">It's a bit quiet here...</span> be the first one to tip {displayName}.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <Tips tips={tips} />
                                            {numberOfTips > 8 && (
                                                <>
                                                    <button
                                                        onClick={() => setIsModalOpen(true)}
                                                        className="btn btn-lg btn-neutral hover:text-white btn-outline text-[16px] font-normal rounded-full mt-2 flex items-center gap-2"
                                                    >
                                                        See more tips
                                                        <ChevronDown size={18} />
                                                    </button>
                                                    <TipsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} id={id} />
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Donate Section */}
                            <div className="p-10 rounded-xl bg-white shadow-lg">
                                <Donate
                                    displayName={displayName || ""}
                                    username={username || ""}
                                    currency={currency || ""}
                                    bankConnected={bankConnected}
                                />
                            </div>
                        </div>
                    </div>
                    <ProfileFooter />
                </div>
            ) : (
                <h2>{error}</h2>
            )}
        </div>
    );
};

const ConnectBankBanner = () => {
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate('/bank/connect');
    };

    return (
        <div className='flex justify-center items-center w-full h-[80px] bg-red-50 gap-5'>
            <h2 className="text-sm text-gray-700 font-semibold">
                Please link your bank account with Stripe to start receiving payments
            </h2>
            <button onClick={handleNavigate} className='btn btn-md btn-neutral text-white'>
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