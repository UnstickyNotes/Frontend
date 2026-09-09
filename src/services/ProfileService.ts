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
// to be implemented
// export const setPfp = async(img:any) => {
//     const response = await api.post('/profile/setPfp', img);
//     return response.data;
// }

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

export const deleteAccount = async() => {
    const response = await api.delete<Response<User>>('/profile');
    return response.data;
}