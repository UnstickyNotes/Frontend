import api from "./api";
import getDB from "../db/dbClient";
import type {
    RegisterCredentials, 
    LoginCredentials,
    Response,
    User,
    AuthResponse,
} from "../types";

export const checkUserOffline = async() => {
    const db = await getDB()
    const user_id = localStorage.getItem('user_id')

    if(!user_id) return ''

    const userEmail:Array<string> = await db.select(`SELECT email FROM users WHERE id = ?`, [user_id]);

    if(userEmail.length == 0) return ''

    return user_id
}

export const register_user_offline = async(user:User) => {
    if (user == null){
        return false
    }
    const db = await getDB()
    const user_id = await checkUserOffline()
    if(!user_id){
        const res = await db.execute(`INSERT INTO users (id, first_name, last_name, email, last_synced_at)
                                    VALUES (?, ?, ?, ?, ?)`, [user.id, user.first_name, user.last_name, user.email, user.last_synced_at]);
        if (res.rowsAffected){
            console.log("success")
            return user
        }
        console.log("unable to create user")
        return false
    }
    console.log(user)
    return user
}

export const register = async(credentials:RegisterCredentials) => {
    const payload = {
        ...credentials,
        firstName: credentials.firstName ?? credentials.first_name,
        lastName: credentials.lastName ?? credentials.last_name,
        first_name: credentials.first_name ?? credentials.firstName,
        last_name: credentials.last_name ?? credentials.lastName,
    };
    const response = await api.post<Response<User>>('/register', payload);

    return response.data;
}

export const login = async(credentials:LoginCredentials) => {
    const response = await api.post<AuthResponse>('/login', credentials);
    
    return response.data;
}

export const logout = async() => {
    const response = await api.post<Response<User>>('/logout');
    
    return response.data;
}