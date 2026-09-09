import type { 
    Response,
    Note, 
    NoteAttributes } from "../types";
import api from "./api";


export const getAllNotes = async() => {
    const res = await api.get<Response<Note>>('/notes');

    return await res.data;
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