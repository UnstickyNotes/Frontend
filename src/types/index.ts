// Response payload
export interface Response <T>{
    status : boolean,
    message : string,
    data? : T
}

export interface AuthData {
    type : string,
    token : string
}

export type AuthResponse = Response<AuthData>

// Entities
export interface User {
    id : number,
    first_name : string,
    last_name? : string,
    email : string,
    is_admin : boolean,
    avatar_url? : string | null,
    avatarUrl? : string | null,
    avatar? : string | null,
    created_at? : string,
    updated_at? : string,
    last_synced_at? : string
}

export interface Collection {
    id : number,
    name : string,
    user_id? : number,
    created_at? : string,
    updated_at? : string
}

export interface Note {
    id : number,
    title : string,
    body? : string,
    collection_id? : number,
    collectionId? : number,
    created_at? : string,
    updated_at? : string
}

// Request bodies
export interface RegisterCredentials {
    firstName?: string,
    lastName?: string,
    first_name?: string,
    last_name?: string,
    email : string,
    password : string,
}

export interface LoginCredentials {
    email : string,
    password : string,
}

export interface UserAttributes {
    firstName?: string,
    lastName?: string,
    first_name? : string,
    last_name? : string,
    avatar_url? : string | null,
    avatarUrl? : string | null,
    avatar? : string | null,
    password? : string
}

export interface CollectionAttributes {
    name : string
}

export interface NoteAttributes {
    title? : string,
    body? : string,
    collection_id? : number,
    collectionId? : number
}

export interface SyncQueueAttrbutes {
    user_id : string
    entity_type : string,
    entity_id : string
    entity_remote_id? : string,
    action : string,
    payload? : object
}

export interface SyncQueue {
    id:string,
    entity_name : string,
    entity_remote_id? : string,
    action : string, 
    payload? : object,
    created_at : string
}

export interface PushAttributes {
    user_id : string,
    payload : string
}

export type PushResponse = Response<PushAttributes>
