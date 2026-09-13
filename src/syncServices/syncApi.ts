import api from "../services/api";
import type { PushAttributes, PushResponse } from "../types";

export const pull = async (last_synced_at:string, userID:string) => {
    const res = await api.get(`/sync/pull/${userID}/${last_synced_at}`);

    return res.data;
}

export const push = async (attrs:PushAttributes) => {
    const payload = JSON.stringify(attrs)
    const res = await api.post<PushResponse>('/sync/push', payload)

    return res.data
}