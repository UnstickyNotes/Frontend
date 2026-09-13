import getDB from "./dbClient";
import type { SyncQueue, SyncQueueAttrbutes } from "../types";

export const enqueue = async (attrs:SyncQueueAttrbutes) => {
    const db = await getDB();
    const dbres = await db.execute("INSERT INTO sync_queue (entity_type, entity_remote_id, action, payload) "+
                                    "VALUES ($1, $2, $3, $4)", 
                                    [attrs.entity_type, attrs.entity_remote_id ?? null, attrs.action, attrs.payload ?? null]);
    db.close();
    return dbres.rowsAffected
}

export const dequeue = async (queueID:string) => {
    const db = await getDB();
    const dbres = await db.execute("DELETE FROM sync_queue WHERE id = $1", [queueID]);
    db.close()
    return dbres.rowsAffected
}

export const getAllPending = async () => {
    const db = await getDB()
    const user_id = Number(localStorage.getItem('user_id'))

    if(user_id === -1) console.log("sign in first...stubi")
        
    const dbres = await db.select<SyncQueue>("SELECT * FROM sync_queue WHERE user_id = $1",[user_id])
    db.close()
    return dbres
}