// import api from "./api";
import getDB from "../db/dbClient";

import { response } from "./Response"
import type {
    Collection, 
    CollectionAttributes, 
    SyncQueueAttrbutes,
} from "../types";
import { generateUniqueName, now } from "./Helpers";
import { checkUserOffline } from "./AuthService";
import { dequeue, dequeueById, enqueue, updateQueuePayload } from "../db/SyncQueue";

export const getCollections = async() => {
    const user_id = await checkUserOffline()
    const db = await getDB();
    const dbres = await db.select<Array<Collection>>("SELECT * FROM collections WHERE user_id = ?", [user_id])
    
    return response(true, 'user collections', dbres)
    // const res = await api.get('/collections');
}

export const addCollection = async(attr:CollectionAttributes) => {
    const user_id = await checkUserOffline()

    if(!user_id) return response(false, 'no user signed in')

    const db = await getDB()
    const uniqueName = await generateUniqueName(attr.name, user_id)
    const dbres = await db.execute(`INSERT INTO collections (user_id, name)VALUES (?, ?)`, [user_id, uniqueName])
    if(dbres.rowsAffected){
        const insertedRow = await db.select<Array<Record<string, any>>>("SELECT * FROM collections WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", [user_id])
        console.log(insertedRow[0])
        const queueData:SyncQueueAttrbutes = {
            user_id:user_id,
            entity_type:'collection',
            entity_id: insertedRow[0].id,
            entity_remote_id:insertedRow[0].remote_id,
            action:'CREATE',
            payload:{name:attr.name}
        }
        await enqueue(queueData)

        return response(true, 'add collection', insertedRow[0])
    }
    return response(false, 'Could not create collection for some reason')
    // const res = await api.post<Response<Collection>>('/collections',attr);
}

export const updateCollection = async(attr:CollectionAttributes, id:string) => {
    const user_id = await checkUserOffline()

    if(!user_id) return response(false, 'no user signed in')

    const db = await getDB()
    const res = await db.execute("UPDATE collections SET name = ?, updated_at = ? WHERE id = ?",[attr.name, now(), id])
    
    if(res.rowsAffected){
        const updatedRow = await db.select<Array<Record<string, any>>>("SELECT * FROM collections WHERE user_id = ? AND id = ? ORDER BY updated_at DESC LIMIT 1", [user_id, id])
        // console.log(updatedRow[0])
        const queueData:SyncQueueAttrbutes = {
            user_id:user_id,
            entity_type:'collection',
            entity_id: updatedRow[0].id,
            entity_remote_id:updatedRow[0].remote_id,
            action:'UPDATE',
            payload:{name:attr.name}
        }
        const prevUpdates = await db.select<Array<Record<string, any>>>(`
            SELECT * FROM sync_queue 
            WHERE user_id = ? 
            AND entity_type = ? 
            AND entity_id = ? 
            AND action = ?`, [user_id, 'collection', id, 'UPDATE'])
        if(prevUpdates.length > 0){
            await updateQueuePayload({name:attr.name}, prevUpdates[0].id)
        }else{
            await enqueue(queueData)
        }
        return response(true, 'collection updated', updatedRow[0])
    }
    return response(false, 'couldnt update collection...sorry')
    // const res = await api.put<Response<Collection>>(`/collections/${id}`, attr);
}

export const deleteCollection = async(id:string) => {
    const user_id = await checkUserOffline()

    if(!user_id) return response(false, 'no user signed in')

    const db = await getDB();
    const deletedRow = await db.select<Array<Record<string, any>>>(`SELECT * FROM collections WHERE id = ? AND user_id = ?`, [id, user_id])
    const deletedRowChildren = await db.select<Record<string, any>[]>(`SELECT id FROM notes WHERE collection_id = ? AND user_id = ?`,[id, user_id])

    const res = await db.execute("DELETE FROM collections WHERE id = ? AND user_id = ?", [id, user_id])
    if(res.rowsAffected){
        const prev = await db.select<Array<Record<string, any>>>(
            `SELECT * FROM sync_queue 
            WHERE user_id = ? 
            AND entity_type = ? 
            AND entity_id = ? 
            AND action IN (?, ?)`, [user_id, 'collection', id, 'CREATE', 'UPDATE'])
        if(prev.length > 0){
            const operations = prev.map((i) => {return dequeueById(i.id)})
            try{
                await Promise.all(operations)
            }catch{
                console.log("promise rejected at delete collection")
                // ignore
            }
        }else{
            const queueData:SyncQueueAttrbutes = {
                user_id:user_id,
                entity_type:'collection',
                entity_id:deletedRow[0].id,
                entity_remote_id:deletedRow[0].remote_id,
                action:'DELETE',
            }
            await enqueue(queueData)
        }
        // delete any queue of the collection notes
        // console.log(id)
        const promises = deletedRowChildren.map((i) => {dequeue(i.id, 'note')})
        try{
            Promise.all(promises)
        }catch{
            console.log('promise rejected when deleting children notes')
            //ignore
        }

        return response(true, 'collection deleted', deletedRow[0])
    }
    return response(false, 'couldnt delete collection')
    // const res = await api.delete<Response<Collection>>(`/collections/${id}`);
}