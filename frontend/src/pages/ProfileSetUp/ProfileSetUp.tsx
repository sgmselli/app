import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCreatorProfile } from '../../api/profile';
import Navbar from '../../components/Navbar';
import Steps from '../../components/Steps';

const ProfileSetUp: React.FC = () => {
    const [displayName, setDisplayName] = useState<string>("");
    const [bio, setBio] = useState<string>("");
    const [youtubeChannelName, setYoutubeChannelName] = useState<string>("")
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [profileBanner, setProfileBanner] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const buildRequestData = () => {
        return {display_name: displayName, bio: bio, youtube_channel_name: youtubeChannelName}
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await createCreatorProfile(buildRequestData());
            navigate("/profile/setup/pictures");
        } catch (err: any) {
            setError(err.response?.data?.error || "There was an error setting up your profile");
        } finally {
            setLoading(false)
        }
    }

    return (
<div className="flex flex-col min-h-screen w-full">
  <Navbar />

  <div className="flex flex-1 items-start justify-center w-full pb-5">
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto pb-8">
      <h2 className="text-4xl font-medium mb-4 text-center">Complete your page</h2>
      <h4 className="text-lg font-normal mb-10 text-center text-gray-500">
        You will need to write some information about your Youtube channel.
      </h4>

      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      {/* Channel Name */}
      <div className="form-control mb-8">
        <label
          htmlFor="displayName"
          className="mb-2 block font-medium text-gray-700"
        >
          Youtube channel name <span className="text-orange-400">*</span>
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          placeholder="Name"
          onChange={(e) => setDisplayName(e.target.value)}
          required
          className="input input-lg w-full bg-base-200 rounded-lg text-[14px] font-medium 
            focus:outline-none focus:border-2 focus:bg-white"
        />
      </div>

      {/* Youtube Link */}
      <div className="form-control mb-8">
        <label
          htmlFor="youtubeChannelName"
          className="mb-2 block font-medium text-gray-700"
        >
          Youtube website link <span className="text-orange-400">*</span>
        </label>
        <label className="input input-lg w-full bg-base-200 rounded-lg text-[14px] font-medium 
          focus-within:bg-white focus-within:border-2 focus-within:outline-none">
          <span className="label text-gray-500">www.youtube.com/@</span>
          <input
            type="text"
            placeholder="Youtube-Channel-Name"
            className="flex-1 bg-transparent focus:outline-none"
            value={youtubeChannelName}
            onChange={(e) => setYoutubeChannelName(e.target.value)}
          />
        </label>
        <p className="mt-2 text-sm text-gray-500 leading-snug break-words">
          E.g. <span className="font-medium">www.youtube.com/@TubeTip</span> has
          channel name <span className="font-medium">TubeTip</span>.
        </p>
      </div>

      {/* About */}
      <div className="form-control mb-8">
        <label htmlFor="bio" className="mb-2 block font-medium text-gray-700">
          About <span className="text-orange-400">*</span>
        </label>
        <textarea
          id="bio"
          value={bio}
          placeholder="Write about your Youtube channel, how it helps its subscribers and how your contribution can help..."
          onChange={(e) => setBio(e.target.value)}
          required
          className="textarea textarea-lg w-full bg-base-200 rounded-lg min-h-[150px] resize-none 
            !text-[14px] font-medium focus:outline-none focus:border-2 focus:bg-white"
        />
      </div>

      <button
        type="submit"
        className="btn btn-lg primary-btn border-0 rounded-lg w-full font-normal text-md focus:outline-none"
        disabled={loading}
      >
        {loading ? (
          <span className="loading loading-spinner"></span>
        ) : (
          "Next"
        )}
      </button>
    </form>
  </div>

  <Steps steps={4} currentStep={1} />

</div>
    )
}

export default ProfileSetUp;