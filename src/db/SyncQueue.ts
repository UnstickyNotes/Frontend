import getDB from "./dbClient";
import type { SyncQueue, SyncQueueAttrbutes } from "../types";

export const enqueue = async (attrs:SyncQueueAttrbutes) => {
    const db = await getDB();
    const dbres = await db.execute("INSERT INTO sync_queue (user_id, entity_type, entity_id, entity_remote_id, action, payload) "+
                                    "VALUES (?, ?, ?, ?, ?, ?)", 
                                    [attrs.user_id, attrs.entity_type, attrs.entity_id, attrs.entity_remote_id ?? null, attrs.action, attrs.payload ?? null]);
    return dbres.rowsAffected
}

export const updateQueuePayload = async(payload:object, id:string) => {
    const db = await getDB()
    const dbres = await db.execute(`UPDATE sync_queue SET payload = ? WHERE id = ?`, [payload, id])

    return dbres.rowsAffected
}

export const dequeueById = async (queueID:string) => {
    const db = await getDB();
    const dbres = await db.execute("DELETE FROM sync_queue WHERE id = ?", [queueID]);
    return dbres.rowsAffected
}

export const dequeue = async (entity_id:string, entity_type:string) => {
    const db = await getDB();
    const dbres = await db.execute("DELETE FROM sync_queue WHERE entity_id = ? AND entity_type = ?", [entity_id, entity_type]);
    return dbres.rowsAffected
}

export const getAllPending = async () => {
    const db = await getDB()
    const user_id = Number(localStorage.getItem('user_id'))

    if(user_id === -1) console.log("sign in first...stubi")

    const dbres = await db.select<SyncQueue>("SELECT * FROM sync_queue WHERE user_id = ?",[user_id])
    return dbres
}