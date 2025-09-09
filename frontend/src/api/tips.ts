import { api } from "./index";
import type { GetTipRequest, GetTipResponse } from "../types/tip"

export async function getTips(requestData: GetTipRequest): Promise<GetTipResponse> {
    const response = await api.get(`tips/${requestData.creator_profile_id}?limit=${requestData.limit}&offset=${requestData.offset}`);
    return response.data;
}
