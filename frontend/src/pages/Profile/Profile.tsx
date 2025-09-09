import React, { useState, useEffect } from 'react';
import { useParams, Params, useNavigate } from 'react-router-dom';
import { getCreatorProfile } from '../../api/profile';
import Donate from './components/Donate';
import Tips, { TipProps } from './components/Tips';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrencySymbol } from '../../components/currencySymbolConverter';
// import Navbar from '../../components/Navbar';

import youtubeBanner from '../../assets/images/youtube_banner.jpg'

import { Link as LinkIcon } from "lucide-react";
import ProfileFooter from './components/ProfileFooter';
import ProfileNavbar from './components/ProfileNavbar';

const Profile: React.FC = () => {
    const { username }: Readonly<Params<string>> = useParams();
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [bio, setBio] = useState<string | null>(null);
    const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
    const [profileBannerUrl, setProfileBannerUrl] = useState<string | null>(null);
    const [youtubeChannelName, setYoutubeChannelName] = useState<string | null>(null);
    const [currency, setCurrency] = useState<string | null>(null)
    const [tips, setTips] = useState<TipProps[]>([]);
    const [numberOfTips, setNumberOfTips] = useState<number>(0)
    const [bankConnected, setBankConnected] = useState<boolean | null>(null)


    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const { isAuthenticated, loadingUser, logoutUser, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleFetch = async () => {
            setLoading(true);
            if (username) {
                try {
                    const profile = await getCreatorProfile({username: username});
                    setDisplayName(profile.display_name);
                    setBio(profile.bio);
                    setCurrency(getCurrencySymbol(profile.currency));
                    setTips(profile.tips);
                    setNumberOfTips(profile.number_of_tips);
                    setYoutubeChannelName(profile.youtube_channel_name)
                    setProfilePictureUrl(profile.profile_picture_url)
                    setProfileBannerUrl(profile.profile_banner_url)
                    setBankConnected(profile.is_bank_connected)
                    console.log(profile.tips)
                } catch (err: any) {
                    console.log(err)
                    setError(err.response?.data?.error || "TubeTip profile does not exist");
                } finally {
                    setLoading(false);
                }
            }
        }
        handleFetch();
    }, [])

    const handleLogout = async () => {
        await logoutUser();
        navigate('/login')
    }

    const navigateLogin = () => {
        navigate("/login")
    }
    
    return (
        <div className="flex flex-col min-h-screen w-full bg-white">
            {(user?.username === username) && !bankConnected && (
                <ConnectBankBanner />
            )}
            <ProfileNavbar bankConnected={bankConnected} profilePictureUrl={profilePictureUrl} displayName={displayName} numberOfTips={numberOfTips} isAuthenticated={isAuthenticated} loginUser={navigateLogin} logoutUser={handleLogout} />

            {!error ? (
                <>
                {loading || loadingUser ? (
                    <div>
                    <h2>Loading...</h2>
                    </div>
                ) : (
                    <div className="flex flex-col items-center w-full">
                    <div className="w-95% max-w-[1100px]"> 
                        
                        {
                            profileBannerUrl && (
                            <img
                                src={profileBannerUrl}
                                alt="YouTube Banner"
                                className="w-full h-[180px] object-cover rounded-xl shadow-md"
                            />
                            )
                        }
                        
                        {/* Content row */}
                        <div className="flex flex-row justify-between items-start gap-12 mt-[60px]">
                        <div className="flex flex-col justify-start gap-6 w-[500px]">

                        {/* About Section */}
                        <div className="flex flex-col shadow-md rounded-xl bg-white p-6">
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
                        <div className="flex flex-col shadow-md rounded-xl bg-white p-6">
                            <h2 className="text-xl font-medium">Recent tips</h2>
                            {numberOfTips === 0 ? (
                            <div className="p-6 rounded-lg w-full flex items-center justify-center h-[150px] mt-4 bg-red-50 border-2 border-red-100">
                                <p className="text-gray-700 text-center text-sm">
                                Be the first one to tip {displayName}.
                                </p>
                            </div>
                            ) : (
                            <Tips tips={tips} />
                            )}
                        </div>

                        </div>

                        {/* Donate Section */}
                        <div className="p-10 rounded-xl bg-white shadow-md">
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
      )}
    </>
  ) : (
    <h2>{error}</h2>
  )}
</div>
    );
}

const ConnectBankBanner = () => {

    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate('/bank/connect')
    }

    return (
        <div className='flex justify-center items-center w-full h-[80px] bg-red-50 gap-5'>
            <h2 className="text-sm text-gray-700 font-semibold">Please link your bank account with Stripe to start receiving payments</h2>
            <button onClick={handleNavigate} className='btn btn-md btn-neutral text-white'>
                Complete setup
            </button>
        </div>
    )
}

export default Profile;