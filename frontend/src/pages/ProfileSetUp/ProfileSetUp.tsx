import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createCreatorProfile } from '../../api/profile';
import Navbar from '../../components/Navbar';
import Steps from '../../components/Steps';
import Textarea from '../../components/elements/textarea';
import Label from '../../components/elements/label';
import Input, { InputLeftIcon } from '../../components/elements/input';
import MotionDiv from '../../components/divAnimation';

const ProfileSetUp: React.FC = () => {
    const [displayName, setDisplayName] = useState<string>("");
    const [bio, setBio] = useState<string>("");
    const [youtubeChannelName, setYoutubeChannelName] = useState<string>("");

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const navigate = useNavigate();

    const buildRequestData = () => {
        return {display_name: displayName, bio: bio, youtube_channel_name: youtubeChannelName}
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
          await createCreatorProfile(buildRequestData());
          navigate("/profile/setup/pictures");
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
        <MotionDiv className="flex flex-1 items-start justify-center w-full pb-5">
          <form onSubmit={handleSubmit} className="w-[90%] sm:w-full sm:max-w-xl mx-auto pb-8">
            <div className="mb-10 text-center mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium mb-4">Complete your page</h2>
              <h4 className="text-md sm:text-lg font-normal mb-6 text-gray-500">
                You will need to write some information about your Youtube channel.
              </h4>
            </div>

            <div className="form-control mb-8">
              <Label
                htmlFor="displayName"
                labelName="Youtube channel name"
                required={true}
              />
              <Input
                id="displayName"
                value={displayName}
                placeholder="Name"
                onChange={setDisplayName}
                required={true}
                error={errors.display_name}
              />
            </div>

            <div className="form-control mb-8">
              <Label
                htmlFor="youtubeChannelName"
                labelName="Youtube website link"
                required={true}
              />
              <InputLeftIcon
                id="youtubeChannelName"
                value={youtubeChannelName}
                placeholder="Youtube-Channel-Name"
                icon="www.youtube.com/@"
                onChange={setYoutubeChannelName}
                required={true}
                error={errors.youtube_channel_name}
              />
              <p className="mt-2 text-xs text-gray-500 leading-snug break-words">
                E.g. <span className="font-medium">www.youtube.com/@TubeTip</span> has
                channel name <span className="font-medium">TubeTip</span>.
              </p>
            </div>

            <div className="form-control mb-8">
              <Label
                htmlFor="bio"
                labelName="About"
                required={true}
              />
              <Textarea
                id="bio"
                value={bio}
                placeholder="Write about your Youtube channel, how it helps its subscribers and how your contribution can help..."
                onChange={setBio}
                required={true}
                error={errors.bio}
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-error">{errors.bio}</p>
              )}
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
        </MotionDiv>
        <div
          className="hidden sm:inline sm:pb-20"
        >
          <Steps steps={4} currentStep={1} />
        </div>
      </div>
    )
}

export default ProfileSetUp;