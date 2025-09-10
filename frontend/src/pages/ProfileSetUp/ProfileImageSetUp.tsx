import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCreatorProfile, updateCreatorProfile } from '../../api/profile';
import Navbar from '../../components/Navbar';
import Steps from '../../components/Steps';

const ProfilePictureSetUp: React.FC = () => {
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [profileBanner, setProfileBanner] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const buildRequestData = () => {
        return {profile_picture: profilePicture, profileBanner: profileBanner}
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await updateCreatorProfile(buildRequestData());
            navigate("/bank/connect");
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
      <h2 className="text-4xl font-medium mb-4 text-center">Upload your profile pictures</h2>
      <h4 className="text-lg font-normal mb-10 text-center text-gray-500">
        We reccomend to upload your YouTube avatar and banner so people will know it's you.
      </h4>

      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      <div className="flex flex-col items-center justify-center form-control mb-8">

        <label
          htmlFor="profilePicture"
          className="w-40 h-40 rounded-xl overflow-hidden bg-base-200 flex items-center justify-center 
            border border-gray-300 mb-2 p-4 cursor-pointer hover:opacity-80 transition"
        >
          {profilePicture ? (
            <img
              src={URL.createObjectURL(profilePicture)}
              alt="Profile preview"
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-gray-400 font-semibold text-md text-center">Upload profile avatar</span>
          )}
        </label>
        <input
          id="profilePicture"
          type="file"
          accept="image/*"
          onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
          className="hidden"
        />
      </div>

      {/* Profile Banner Upload */}
      <div className="flex flex-col justify-center form-control mb-8">

        <label
          htmlFor="profileBanner"
          className="w-full h-[150px] rounded-xl overflow-hidden bg-base-200 flex items-center justify-center 
            border border-gray-300 mb-2 cursor-pointer hover:opacity-80 transition"
        >
          {profileBanner ? (
            <img
              src={URL.createObjectURL(profileBanner)}
              alt="Banner preview"
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-gray-400 font-semibold text-md">Upload profile banner</span>
          )}
        </label>
        <input
          id="profileBanner"
          type="file"
          accept="image/*"
          onChange={(e) => setProfileBanner(e.target.files?.[0] || null)}
          className="hidden"
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

  <Steps steps={4} currentStep={2} />

</div>
    )
}

export default ProfilePictureSetUp;