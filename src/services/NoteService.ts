import getDB from "../db/dbClient";

import type { 
    Note, 
    NoteAttributes,
    SyncQueueAttrbutes } from "../types";
import { response } from "./Response"
import { checkUserOffline } from "./AuthService";
import { enqueue, dequeueById, updateQueuePayload } from "../db/SyncQueue";
import { now } from "./Helpers";

export const getAllNotes = async() => {
    const user_id = await checkUserOffline()
    const db = await getDB();
    const dbres = await db.select<Note[]>("SELECT * FROM notes WHERE user_id = ?", [user_id])
    
    return response(true, 'user notes', dbres)
    // const res = await api.get<Response<Note>>('/notes');
}

export const addNote = async (attr:NoteAttributes) => {
    const user_id = await checkUserOffline()

    if(!user_id) return response(false, 'no user signed in')

    const db = await getDB()
    const dbres = await db.execute(`INSERT INTO notes (user_id, collection_id, title, body)VALUES (?, ?, ?, ?)`, 
                            [user_id, attr.collection_id, attr.title, attr.body])
    if(dbres.rowsAffected){
        const insertedRow = await db.select<Array<Record<string, any>>>("SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", [user_id])
        console.log(insertedRow[0])
        const queueData:SyncQueueAttrbutes = {
            user_id:user_id,
            entity_type:'note',
            entity_id: insertedRow[0].id,
            entity_remote_id:insertedRow[0].remote_id,
            action:'CREATE',
            payload:{
                title:attr.title,
                body:attr.body,
                collection_id:attr.collection_id
            }
        }
        await enqueue(queueData)

        return response(true, 'add collection', insertedRow[0])
    }
    return response(false, 'Could not create collection for some reason')
    // const payload = {
    //     ...attr,
    //     collection_id: attr.collection_id ?? attr.collectionId,
    //     collectionId: attr.collectionId ?? attr.collection_id,
    // };
    // const res = await api.post<Response<Note>>('/notes', payload);
}

export const getNote = async (id: string | number) => {
    const user_id = await checkUserOffline()

    if(!user_id) return response(false, 'no user signed in')
    
    const db = await getDB()
    const dbres = await db.select<Note[]>(`SELECT * FROM notes WHERE id = ? AND user_id = ?`, [id, user_id])
    
    if(dbres.length == 0) return response(false, 'note not found')
    
    return response(true, 'note found', dbres[0])
    
    // const res = await api.get<Response<Note>>(`/notes/${id}`)
}

export const updateNote = async(id: string | number, attr:NoteAttributes) => {
    const user_id = await checkUserOffline()

    if(!user_id) return response(false, 'no user signed in')

    const db = await getDB()
    const res = await db.execute(`
        UPDATE notes SET title = COALESCE(?, title),
                        body = COALESCE(?, body),
                        collection_id = ?,
                        updated_at = ?
                        WHERE id = ?`,
                    [attr.title, attr.body, attr.collection_id ?? null, now(), id])
    
    if(res.rowsAffected){
        const updatedRow = await db.select<Array<Record<string, any>>>("SELECT * FROM notes WHERE user_id = ? AND id = ? ORDER BY updated_at DESC LIMIT 1", [user_id, id])
        console.log(attr)
        const payload = {
                title:attr.title,
                body:attr.body,
                collection_id:attr.collection_id??null
            }
        const queueData:SyncQueueAttrbutes = {
            user_id:user_id,
            entity_type:'note',
            entity_id: updatedRow[0].id,
            entity_remote_id:updatedRow[0].remote_id,
            action:'UPDATE',
            payload:payload
        }
        const prevUpdates = await db.select<Array<Record<string, any>>>(`
            SELECT * FROM sync_queue 
            WHERE user_id = ? 
            AND entity_type = ? 
            AND entity_id = ? 
            AND action = ?`, [user_id, 'note', id, 'UPDATE'])
        if(prevUpdates.length > 0){
            await updateQueuePayload(payload, prevUpdates[0].id)
        }else{
            await enqueue(queueData)
        }
        return response(true, 'note updated', updatedRow[0])
    }
    return response(false, 'couldnt update note...sorry')
    // const res = await api.put<Response<Note>>(`/notes/${id}`, attr);
}

export const deleteNote = async (id: string | number) => {
    const user_id = await checkUserOffline()

    if(!user_id) return response(false, 'no user signed in')

    const db = await getDB();
    const deletedRow = await db.select<Array<Record<string, any>>>(`SELECT * FROM notes WHERE id = ? AND user_id = ?`, [id, user_id])

    const res = await db.execute("DELETE FROM notes WHERE id = ? AND user_id = ?", [id, user_id])
    if(res.rowsAffected){
        const prev = await db.select<Array<Record<string, any>>>(
            `SELECT * FROM sync_queue 
            WHERE user_id = ? 
            AND entity_type = ? 
            AND entity_id = ? 
            AND action IN (?, ?)`, [user_id, 'note', id, 'CREATE', 'UPDATE'])
        if(prev.length > 0){
            const operations = prev.map((i) => {return dequeueById(i.id)})
            try{
                await Promise.all(operations)
            }catch{
                console.log("promise rejected at delete notes")
                // ignore
            }
        }else{
            const queueData:SyncQueueAttrbutes = {
                user_id:user_id,
                entity_type:'note',
                entity_id:deletedRow[0].id,
                entity_remote_id:deletedRow[0].remote_id,
                action:'DELETE',
            }
            await enqueue(queueData)
        }
        return response(true, 'note deleted', deletedRow[0])
    }
    return response(false, 'couldnt delete note')
    
    // const res = await api.delete<Response<Note>>(`/notes/${id}`);
}