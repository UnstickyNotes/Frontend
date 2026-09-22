// Response payload
export interface Response <T>{
    status : boolean,
    message : string,
    data? : T | null
}

export interface AuthData {
    type : string,
    token : string
}

export type AuthResponse = Response<AuthData>

// Entities
export interface User {
    id : string,
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
    id : string | number | null,
    remote_id? : number
    name : string,
    user_id? : number,
    created_at? : string,
    updated_at? : string
}

export interface Note {
    id : string,
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
    user_id? : number
    remote_id? : number
    local_id? : number
    name : string
}

export interface NoteAttributes {
    user_id? : number
    remote_id? : number
    local_id? : number
    title? : string,
    body? : string,
    collection_id? : number,
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
    id : string,
    user_id : string,
    entity_name : string,
    entity_remote_id? : string,
    action : string, 
    payload? : object,
    created_at : string
}

interface PushResData {
    synced_at : string
    passed: Record<string, any>
    failed: Record<string, any>
    unauthorized: number
}
interface PullResData {
    last_synced_at_server : string
    collections : string
    notes : string
}

export type PushResponse = Response<PushResData>

export type PullResponse = Response<PullResData>
