// import { useOnlineStatus } from "../contexts/OnlineContext"
import { checkUserOffline } from "../services/AuthService"
import { pull, push } from "./syncApi"
import type { CollectionAttributes, NoteAttributes } from '../types/index';
import getDB from "../db/dbClient";
import { checkOnlineStatus } from "./network";

export const requestPull = async() => {
    const isOnline = await checkOnlineStatus()
    if (isOnline){
        const db = await getDB();
        const user = await checkUserOffline()
        if (!user) {
            return false;
        }
        const user_id = user[0].id;
        const last_synced_at = user[0].last_synced_at
        const res = await pull(last_synced_at, user_id);
        if(!res.status){
            return false
        }
        const cols:CollectionAttributes[] = JSON.parse(res.data?.collections ?? '')
        const notes:NoteAttributes[] = JSON.parse(res.data?.notes ?? '')
        const last_synced_at_server = res.data?.last_synced_at_server

        cols.forEach(async (col) => {
            const user = (await checkUserOffline())
            if(user && user[0].id == col.user_id){
                db.execute(`INSERT INTO collections (id, remote_id, user_id, name)
                    VALUES(?,?,?,?)`,[col.local_id, col.remote_id, col.user_id ?? user[0].id, col.name])
                    .catch(()=>{ /*ignore*/ });
            }
        });

        notes.forEach(async (note) => {
            const user = (await checkUserOffline())
            if(user && user[0].id == note.user_id){
                db.execute(`INSERT INTO notes (id, remote_id, user_id, title, body, collection_id)
                    VALUES(?,?,?,?,?,?)`,[note.local_id, note.remote_id, note.user_id ?? user[0].id, note.title, note.body, note.collection_id ?? null])
                    .catch(()=>{ /*ignore*/ });
            }
        });
        await db.execute(`UPDATE users SET last_synced_at = ? WHERE id = ?`, [last_synced_at_server, user_id])
        return true
    }
    else{
        return false
    }
}

export const requestPush = async() => {
    
}
