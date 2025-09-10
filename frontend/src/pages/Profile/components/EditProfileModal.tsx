import { useRef, useState, useEffect, useMemo } from "react";
import { updateCreatorProfile } from "../../../api/profile";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: {
    displayName: string;
    bio: string;
    profilePictureUrl: string;
    profileBannerUrl: string;
  }) => void;
  initialDisplayName: string;
  initialBio: string;
  initialProfilePicture?: string | null; // URL from backend
  initialProfileBanner?: string | null;  // URL from backend
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
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);

  const [error, setError] = useState<string | null>(null);
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

  // Detect changes
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
        setError(err.response?.data?.error || "We had an error updating your profile. Try again later.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-box max-w-4xl max-h-[90vh] p-12">
        {/* Heading */}
        <h2 className="text-3xl font-bold mb-6 text-center">
          Edit your <span className="primary-text">TubeTip</span> profile
        </h2>
        <h4 className="text-lg font-normal mb-10 text-center text-gray-500">
          Here you can edit your profile information. We advise you to keep your profile similar to your YouTube account so people know it's you.
        </h4>

        <form onSubmit={handleSubmit} className="overflow-y-auto">
          {/* Profile picture upload */}
          <div className="form-control mb-8 flex justify-center">
            <label
              htmlFor="profilePicture"
              className="w-32 h-32 rounded-xl overflow-hidden bg-base-200 border border-gray-300 flex items-center justify-center 
                cursor-pointer hover:opacity-80 transition"
            >
              {profilePicture ? (
                <img
                  src={URL.createObjectURL(profilePicture)}
                  alt="Profile preview"
                  className="object-cover w-full h-full"
                />
              ) : initialProfilePicture ? (
                <img
                  src={initialProfilePicture}
                  alt="Current profile"
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-gray-400 font-semibold text-sm text-center">
                  Upload profile picture
                </span>
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

          {/* Banner upload */}
          <div className="form-control mb-8">
            <label
              htmlFor="profileBanner"
              className="w-full h-[180px] rounded-xl overflow-hidden bg-base-200 flex items-center justify-center 
                border border-gray-300 cursor-pointer hover:opacity-80 transition"
            >
              {profileBanner ? (
                <img
                  src={URL.createObjectURL(profileBanner)}
                  alt="Banner preview"
                  className="object-cover w-full h-full"
                />
              ) : initialProfileBanner ? (
                <img
                  src={initialProfileBanner}
                  alt="Current banner"
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-gray-400 font-semibold text-sm">
                  Upload profile banner
                </span>
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

          {/* Display Name */}
          <div className="form-control mb-8">
            <label
              htmlFor="displayName"
              className="mb-2 block font-medium text-gray-700"
            >
              Youtube channel name
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

          {/* About */}
          <div className="form-control mb-8">
            <label
              htmlFor="bio"
              className="mb-2 block font-medium text-gray-700"
            >
              About
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