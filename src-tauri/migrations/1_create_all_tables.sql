-- Entity: Notes
CREATE TABLE IF NOT EXISTS users {
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT NULL,
};

CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,  -- Client-generated UUID
    remote_id INTEGER NULL,  -- Assigned by the backend after sync
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    sync_status TEXT DEFAULT 'pending_create',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    remote_id INTEGER NULL,
    name TEXT NOT NULL,
    sync_status TEXT DEFAULT 'pending_create',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL
);