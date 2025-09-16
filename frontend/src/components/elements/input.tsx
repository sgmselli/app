interface InputProps {
  id: string;
  type?: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  onChange: (text: string) => void;
  additionalClassNames?: string;
  error?: string | null;
  disabled?: boolean;
}

interface InputLeftIconProps {
  id?: string | undefined;
  type?: string;
  value: string;
  placeholder?: string;
  icon: string
  required?: boolean;
  onChange: (text: string) => void;
  additionalClassNames?: string;
  error?: string | null;
}

interface ProfileBannerInputProps {
  profileBanner: File | null;
  initialProfileBanner?: string | null;
  setProfileBanner: (text: File | null) => void;
  error?: string | null;
}

interface ProfilePictureInputProps {
  profilePicture: File | null;
  initialProfilePicture?: string | null;
  setProfilePicture: (text: File | null) => void;
  error?: string | null;
}

export default function Input({
  id,
  type="text",
  value,
  placeholder="",
  required=false,
  onChange,
  additionalClassNames = "",
  error = null,
  disabled = false
}: InputProps) {
  return (
    <>
        <input
            id={id}
            type={type}
            value={value}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className={`input input-lg w-full bg-base-200 rounded-lg text-[14px] font-medium 
                focus:outline-none focus:bg-white 
                ${!!error ? "border-error focus:border-error" : "focus:border-2"} 
                ${additionalClassNames}`
            }
        />
        {!!error && (
            <p className="mt-1 text-sm text-error">{error}</p>
        )}
    </>
  );
}

export function InputLeftIcon({
  id=undefined,
  type="text",
  value,
  placeholder="",
  icon="",
  required=false,
  onChange,
  additionalClassNames = "",
  error = null,
}: InputLeftIconProps) {
  return (
    <>
        <label id={id} className={`input input-lg w-full bg-base-200 rounded-lg text-[14px] font-medium 
            focus-within:bg-white focus-within:border-2 focus-within:outline-none ${!!error ? "border-error focus:border-error" : "focus:border-2"} ${additionalClassNames}`}>
            <span className="label text-gray-500">{icon}</span>
            <input
                type={type}
                placeholder={placeholder}
                className="flex-1 bg-transparent focus:outline-none"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
            />
        </label>
        {!!error && (
                <p className="mt-1 text-sm text-error">{error}</p>
        )}
    </>        
  );
}

export function ProfilePictureInput({
  profilePicture,
  initialProfilePicture = null,
  setProfilePicture,
  error = null
}: ProfilePictureInputProps) {

  return (
    <>
      <label
          htmlFor="profilePicture"
          className={`w-24 md:h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-base-200 border ${error ? "border-error" : "border-gray-300"} flex items-center justify-center 
            cursor-pointer hover:opacity-80 transition`}
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
        {!!error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
    </>
  )
}

export function ProfileBannerInput({
  profileBanner,
  initialProfileBanner,
  setProfileBanner,
  error = null
}: ProfileBannerInputProps) {

  return (
    <>
      <label
        htmlFor="profileBanner"
        className={`w-full h-[140px] md:h-[180px] rounded-xl overflow-hidden bg-base-200 flex items-center justify-center 
          border ${error ? "border-error" : "border-gray-300"} cursor-pointer hover:opacity-80 transition`}
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
      {!!error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </>
  )
}

