import api from "./api";
import type { 
    Response,
    Collection, 
    CollectionAttributes, 
} from "../types";

export const getCollections = async() => {
    const res = await api.get('/collections');
    return res.data;
}

export const addCollection = async(attr:CollectionAttributes) => {
    const res = await api.post<Response<Collection>>('/collections',attr);
    return res.data;
}

export const updateCollection = async(attr:CollectionAttributes, id:number) => {
    const res = await api.put<Response<Collection>>(`/collections/${id}`, attr);
    return res.data;
}

export const deleteCollection = async(id:number) => {
    const res = await api.delete<Response<Collection>>(`/collections/${id}`);
    return res.data;
}