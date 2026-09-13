import api from "./api";
import getDB from "../db/dbClient";
import type { 
    Response,
    Collection, 
    CollectionAttributes, 
} from "../types";
const user_id = localStorage.getItem('user_id')
export const getCollections = async() => {
    const db = await getDB();
    const res = await db.select<Collection[]>("SELECT * FROM collections WHERE user_id = $1", [user_id])
    // const res = await api.get('/collections');
    db.close()
    return res;
}

export const addCollection = async(attr:CollectionAttributes) => {
    const db = await getDB()
    const res = await db.execute("INSERT INTO collections (user_id, name)"+
                                "VALUES ($1, $2)", [user_id, attr.name])
    // const res = await api.post<Response<Collection>>('/collections',attr);
    db.close();
    return res.rowsAffected;
}

export const updateCollection = async(attr:CollectionAttributes, id:number) => {
    const db = await getDB()
    const res = await db.execute("UPDATE collections SET name = $1 WHERE id = $2",[attr.name, id])
    // const res = await api.put<Response<Collection>>(`/collections/${id}`, attr);
    db.close()
    return res.rowsAffected;
}

export const deleteCollection = async(id:number) => {
    const db = await getDB();
    const res = await db.execute("DELETE FROM collections WHERE id = $1", [id])
    // const res = await api.delete<Response<Collection>>(`/collections/${id}`);
    return res.rowsAffected;
}