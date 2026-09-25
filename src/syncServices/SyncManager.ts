// import { useOnlineStatus } from "../contexts/OnlineContext"
import { checkUserOffline } from "../services/AuthService"
import { pull, push } from "./syncApi"
import type { CollectionAttributes, NoteAttributes, SyncQueueAttrbutes } from '../types/index';
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

        if(!user[0].last_synced_at) user[0].last_synced_at = 0

        const last_synced_at:string = new Date(String(user[0].last_synced_at)).toISOString()
        const res = await pull(last_synced_at, user_id);
        if(!res.status){
            return false
        }
        else if(res.message === 'Up to date'){
            return true
        }
        const cols:CollectionAttributes[] = JSON.parse(res.data?.collections ?? '{}')
        const notes:NoteAttributes[] = JSON.parse(res.data?.notes ?? '{}')
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
    const isOnline = await checkOnlineStatus()
    if(isOnline){
        const db = await getDB()
        const user = await checkUserOffline()
        if(!user) {
            return false
        }
        const user_id = user[0].id
        const queueData:SyncQueueAttrbutes[] = await db.select(`SELECT * FROM sync_queue WHERE user_id = ?`,[user_id]);
        const res = await push(queueData, user_id)
        if (!res.status || !res.data){
            return false
        }

        const synced_at:string | undefined = res.data?.synced_at
        const passed:Record<string, any>[] | undefined = res.data?.passed

        for (let p of passed){
            if(p.action === 'CREATE' || p.action === 'UPDATE'){
                if(p.type == 'collection'){
                        const dbres = await db.execute(`UPDATE collections SET sync_status = ?, remote_id = ? WHERE id = ?`, ['synced', p.id, p.local_id])
                        console.log(p)
                        if(dbres.rowsAffected){
                            await db.execute(`DELETE FROM sync_queue WHERE entity_type = ? AND entity_id = ?`, ['collection', p.local_id])
                        }
                }
                else{
                    const dbres = await db.execute(`UPDATE notes SET sync_status = ?, remote_id = ? WHERE id = ?`, ['synced', p.id, p.local_id])
                    console.log(p)
                    if(dbres.rowsAffected){
                        await db.execute(`DELETE FROM sync_queue WHERE entity_type = ? AND entity_id = ?`, ['note', p.local_id])
                    }
                }
            }else{
                await db.execute(`DELETE FROM sync_queue WHERE entity_type = ? AND entity_id = ?`, ['collection', p.local_id])
            }
        }
        await db.execute(`UPDATE users SET last_synced_at = ? WHERE id = ?`, [synced_at, user_id])
        console.log('----------------------------------------------------------------------------')
        return true
    }
    else{
        return false
    }
}
