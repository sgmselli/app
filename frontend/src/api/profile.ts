import { apiAuth } from "./index";
import type { CreateProfileRequest, CreateProfileResponse, GetProfileRequest, GetProfileResponse, GetCurrentUserResponse } from "../types/profile"

export async function getMyProfileData() : Promise<GetCurrentUserResponse>{
  const response = await apiAuth.get(`creator/me`);
  return response.data;
}

export async function createCreatorProfile(requestData: CreateProfileRequest): Promise<CreateProfileResponse> {
  const formData = new FormData();
  formData.append("display_name", requestData.display_name);
  formData.append("bio", requestData.bio);
  formData.append("youtube_channel_name", requestData.youtube_channel_name);
  if (requestData.profile_picture) {
    formData.append("profile_picture", requestData.profile_picture);
  }
  if (requestData.profile_banner) {
    formData.append("profile_banner", requestData.profile_banner);
  }
  const response = await apiAuth.post(`creator/profile/create`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function getCreatorProfile(requestData: GetProfileRequest): Promise<GetProfileResponse> {
  const response = await apiAuth.get(`creator/profile/username/${requestData.username}`);
  return response.data;
}