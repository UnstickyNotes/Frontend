import api from "./api";
import getDB from "../db/dbClient";

import type { 
    Response,
    Note, 
    NoteAttributes } from "../types";
import { response } from "./Response"
import { checkUserOffline } from "./AuthService";
import { now } from "./Helpers";

export const getAllNotes = async() => {
    const user_id = await checkUserOffline()
    const db = await getDB();
    const dbres = await db.select<Note[]>("SELECT * FROM notes WHERE user_id = ?", [user_id])
    
    return response(true, 'user notes', dbres)
    // const res = await api.get<Response<Note>>('/notes');
}

export const addNote = async (attr:NoteAttributes) => {
    const payload = {
        ...attr,
        collection_id: attr.collection_id ?? attr.collectionId,
        collectionId: attr.collectionId ?? attr.collection_id,
    };
    const res = await api.post<Response<Note>>('/notes', payload);

    return res.data;
}

export const getNote = async (id:number) => {
    const res = await api.get<Response<Note>>(`/notes/${id}`)

    return res.data;
}

export const updateNote = async(id:number, attr:NoteAttributes) => {
    const res = await api.put<Response<Note>>(`/notes/${id}`, attr);

    return res.data;
}

export const deleteNote = async (id:number) => {
    const res = await api.delete<Response<Note>>(`/notes/${id}`);

    return res.data;
}