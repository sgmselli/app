import { useRef, useState, useEffect, useMemo } from "react";

import { updateCreatorProfile } from "../../../api/profile";
import Input, { ProfileBannerInput, ProfilePictureInput } from "../../../components/elements/input";
import Label from "../../../components/elements/label";
import Textarea from "../../../components/elements/textarea";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: {
    displayName: string | null;
    bio: string | null;
    profilePictureUrl: string | null;
    profileBannerUrl: string | null;
  }) => void;
  initialDisplayName: string | null;
  initialBio: string | null;
  initialProfilePicture?: string | null; 
  initialProfileBanner?: string | null;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  onSave,
  initialDisplayName,
  initialBio,
  initialProfilePicture,
  initialProfileBanner,
}: EditProfileModalProps) {
  const modalRef = useRef<HTMLDialogElement | null>(null);

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profileBanner, setProfileBanner] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(initialDisplayName);
  const [bio, setBio] = useState(initialBio);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setDisplayName(initialDisplayName);
    setBio(initialBio);
    setProfilePicture(null);
    setProfileBanner(null);
  }, [initialDisplayName, initialBio, isOpen]);

  if (isOpen) {
    modalRef.current?.showModal();
  } else {
    modalRef.current?.close();
  }

  const hasChanges = useMemo(() => {
    return (
      displayName !== initialDisplayName ||
      bio !== initialBio ||
      profilePicture !== null ||
      profileBanner !== null
    );
  }, [displayName, bio, profilePicture, profileBanner, initialDisplayName, initialBio]);

  const buildRequestData = () => {
    return {display_name: displayName, bio: bio, profile_banner: profileBanner, profile_picture: profilePicture}
  }
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hasChanges) return;
    try {
      setLoading(true);
      const { display_name, bio, profile_picture_url, profile_banner_url } = await updateCreatorProfile(buildRequestData())
      onSave({
        displayName: display_name,
        bio: bio,
        profilePictureUrl: profile_picture_url,
        profileBannerUrl: profile_banner_url,
      });
      onClose();
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors || [];
      const newErrors: Record<string, string> = {};
      apiErrors.forEach((e: { field: string; message: string }) => {
        newErrors[e.field] = e.message;
      });
      setErrors(newErrors);
    } finally {
        setLoading(false);
    }
  };

  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-box max-w-4xl max-h-[90vh] py-12 px-8 md:p-12">
        {/* Heading */}
        <h2 className="text-xl md:text-3xl font-bold mb-6 text-center">
          Edit your <span className="primary-text">TubeTip</span> profile
        </h2>
        <h4 className="text-sm md:text-lg font-normal mb-10 text-center text-gray-500">
          Here you can edit your profile information. We advise you to keep your profile similar to your YouTube account so people know it's you.
        </h4>

        <form onSubmit={handleSubmit} className="overflow-y-auto">
          {/* Profile picture upload */}
          <div className="form-control mb-8 flex flex-col items-center justify-center">
            <ProfilePictureInput
              profilePicture={profilePicture}
              initialProfilePicture={initialProfilePicture}
              setProfilePicture={setProfilePicture}
              error={errors.profile_picture}
            />
          </div>

          {/* Banner upload */}
          <div className="form-control mb-8">
            <ProfileBannerInput
              profileBanner={profileBanner}
              initialProfileBanner={initialProfileBanner}
              setProfileBanner={setProfileBanner}
              error={errors.profile_banner}
            />
          </div>

          {/* Display Name */}
          <div className="form-control mb-8">
            <Label
              htmlFor="displayName"
              labelName="Youtube channel name"           
            />
            <Input
              id="displayName"
              type="text"
              value={displayName ?? ""}
              placeholder="Name"
              onChange={setDisplayName}
              required={true}
              error={errors.display_name}
            />
          </div>

          {/* About */}
          <div className="form-control mb-8">
            <label
              htmlFor="bio"
              className="mb-2 block font-medium text-gray-700"
            >
              About
            </label>
            <Textarea
              id="bio"
              value={bio ?? ""}
              placeholder="Write about your Youtube channel, how it helps its subscribers and how your contribution can help..."
              onChange={setBio}
              required={true}
              error={errors.bio}
            />
          </div>

          <div className="modal-action">
            <button
              type="submit"
              disabled={!hasChanges}
              className="btn primary-btn border-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading?  <span className="loading loading-spinner"></span> : "Save changes"}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-neutral"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}