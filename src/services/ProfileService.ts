import api from "./api";
import type {
    Response,
    User,
    UserAttributes
} from "../types";

export const getProfile = async() => {
    const response = await api.get<Response<User>>('/profile');
    return response.data;
}
export const setPfp = async(file: File | FormData) => {
    const formData = file instanceof FormData ? file : new FormData();
    if (file instanceof File) {
        formData.append('avatar', file);
        formData.append('image', file);
        formData.append('pfp', file);
    }
    const response = await api.post<Response<User>>('/profile/setPfp', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

export const deletePfp = async() => {
    const response = await api.delete<Response<User>>('/profile/pfp');
    return response.data;
}

export const updateProfile = async(updateInfo:UserAttributes) => {
    const payload = {
        ...updateInfo,
        firstName: updateInfo.firstName ?? updateInfo.first_name,
        lastName: updateInfo.lastName ?? updateInfo.last_name,
        first_name: updateInfo.first_name ?? updateInfo.firstName,
        last_name: updateInfo.last_name ?? updateInfo.lastName,
    };
    const response = await api.put<Response<User>>('/profile', payload);
    return response.data;
}

export const deleteAccount = async(password:string) => {
    const response = await api.delete<Response<User>>(`/profile/${password}`);
    return response.data;
}