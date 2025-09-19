export interface Tip {
    id: number;
    amount: number;
    name?: string | null;
    message?: string | null;
    isPrivate: boolean;
    created_at: Date;
}

export interface GetTipResponse {
  tips: Tip[];
}

export interface GetTipRequest {
    creator_profile_id: number;
    limit: number;
    offset: number;
}
