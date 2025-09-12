import { apiAuth } from "./index";
import type { CreateProfileRequest, CreateProfileResponse, GetProfileRequest, GetProfileResponse, GetCurrentUserResponse, UpdateProfileRequest, UpdateProfileResponse, UploadProfileImagesRequest, UploadProfileImagesResponse } from "../types/profile"

export async function getMyProfileData() : Promise<GetCurrentUserResponse>{
  const response = await apiAuth.get(`creator/me`);
  return response.data;
}

export async function createCreatorProfile(requestData: CreateProfileRequest): Promise<CreateProfileResponse> {
  const response = await apiAuth.post(`creator/profile/create`, requestData);
  return response.data;
}

export async function updateCreatorProfilePictures(requestData: UploadProfileImagesRequest): Promise<UploadProfileImagesResponse> {
  const formData = new FormData();
  const { profile_picture, profile_banner } = requestData

  if (!profile_picture && !profile_banner) {
    return {}
  }

  if (profile_picture) {
    formData.append("profile_picture", profile_picture);
  }
  if (profile_banner) {
    formData.append("profile_banner", profile_banner);
  }
  const response = await apiAuth.put(`creator/profile/profile-pictures`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function updateCreatorProfile(requestData: UpdateProfileRequest): Promise<UpdateProfileResponse> {
  const formData = new FormData();
  if (requestData.display_name) {
      formData.append("display_name", requestData.display_name);
  }
  if (requestData.bio) {
    formData.append("bio", requestData.bio);
  }
  if (requestData.profile_picture) {
    formData.append("profile_picture", requestData.profile_picture);
  }
  if (requestData.profile_banner) {
    formData.append("profile_banner", requestData.profile_banner);
  }
  const response = await apiAuth.patch(`creator/profile/update`, formData, {
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
