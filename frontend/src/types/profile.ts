export interface CreateProfileRequest {
  display_name: string;
  bio: string;
  youtube_channel_name: string;
  profile_picture: File | null
  profile_banner: File | null
}

export interface CreateProfileResponse {
  id: number;
  creator_id: number;
  display_name: string | null;
  bio: string | null;
  image_url: string | null;
  created_at: Date;
  is_bank_connected: boolean;
  tips: [any]
  youtube_channel_name: string;
  profile_picture_url: string
  profile_banner_url: string
}

export interface GetProfileRequest {
  username: string;
}

export interface GetCurrentUserResponse {
  id: number;
  username: string;
  email: string;
  has_profile: boolean;
  is_bank_connected: boolean;
  profile_picture_url?: string | null
}

export interface GetBankStatusResponse {
  bank_connected: boolean;
}

export interface GetProfileSetUpResponse {
  profile_set_up: boolean;
}

export interface GetProfileResponse {
  display_name: string | null;
  bio: string | null;
  stripe_account_id: string | null;
  id: number;
  creator_id: number;
  created_at: Date | null;
  currency: string | null
  tips: any
  number_of_tips: number
  youtube_channel_name: string;
  profile_picture_url: string | null;
  profile_banner_url: string | null;
  is_bank_connected: boolean;
}

export interface UpdateProfileRequest {
  display_name?: string;
  bio?: string;
  profile_picture?: File | null
  profile_banner?: File | null
}

export interface UpdateProfileResponse {
  id: number;
  creator_id: number;
  display_name: string | null;
  bio: string | null;
  image_url: string | null;
  created_at: Date;
  is_bank_connected: boolean;
  tips: [any]
  youtube_channel_name: string;
  profile_picture_url: string
  profile_banner_url: string
}