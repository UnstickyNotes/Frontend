import api from "../services/api";
import type { PullResponse, PushResponse, SyncQueueAttrbutes } from "../types";

export const pull = async (last_synced_at:string, userID:string) => {
    const url = (last_synced_at) 
        ? `/sync/pull/${userID}?last_synced_at=${last_synced_at}`
        : `/sync/pull/${userID}`
    const res = await api.get<PullResponse>(url);
    return res.data;
}

export const push = async (attrs:SyncQueueAttrbutes[], user_id:string) => {
    const data = {'data' : JSON.stringify(attrs)};
    console.log(data)

    const res = await api.post<PushResponse>(`/sync/push/${user_id}`, data)
    return res.data
}