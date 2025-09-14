import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { updateCreatorProfilePictures } from '../../api/profile';
import Navbar from '../../components/Navbar';
import Steps from '../../components/Steps';
import { ProfileBannerInput, ProfilePictureInput } from '../../components/elements/input';

const ProfilePictureSetUp: React.FC = () => {
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profileBanner, setProfileBanner] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();

  const buildRequestData = () => {
    return {profile_picture: profilePicture, profile_banner: profileBanner}
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      if (profilePicture || profileBanner) await updateCreatorProfilePictures(buildRequestData());
      navigate("/bank/connect");
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors || [];
      const newErrors: Record<string, string> = {};
      apiErrors.forEach((e: { field: string; message: string }) => {
        newErrors[e.field] = e.message;
      });
      setErrors(newErrors);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen w-full">

      <Navbar />
      <div
        className="inline sm:hidden pb-10 sm:pb-0"
      >
        <Steps steps={4} currentStep={1} />
      </div>
      <div className="flex flex-1 items-start justify-center w-full pb-5">
        <form onSubmit={handleSubmit} className="w-[90%] sm:w-full sm:max-w-2xl mx-auto pb-8">

          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium mb-4">Upload your profile pictures</h2>
            <h4 className="text-md sm:text-lg font-normal text-gray-500">
              We recommend to upload your YouTube avatar and banner so people will know it's you.
            </h4>
          </div>

          <div className="flex flex-col items-center justify-center form-control mb-8">
            <ProfilePictureInput
              profilePicture={profilePicture}
              setProfilePicture={setProfilePicture}
              error={errors.profile_picture}
            />
          </div>

          <div className="flex flex-col justify-center form-control mb-8">
            <ProfileBannerInput
              profileBanner={profileBanner}
              setProfileBanner={setProfileBanner}
              error={errors.profile_banner}
            />
          </div>

          <button
            type="submit"
            className="btn btn-md sm:btn-lg primary-btn border-0 rounded-lg w-full font-normal text-md focus:outline-none"
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

      <div
        className="hidden sm:inline sm:pb-20"
      >
        <Steps steps={4} currentStep={2} />
      </div>
    </div>
  )
}

export default ProfilePictureSetUp;