import api from "./api";
import type {
    RegisterCredentials, 
    LoginCredentials,
    Response,
    User,
    AuthResponse,
} from "../types";

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