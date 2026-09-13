-- Entity: Users
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT NULL,
    last_synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Entity: Collections
CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY,                       -- Client-generated UUID
    remote_id INTEGER NULL,                    -- Assigned by the backend after sync
    user_id TEXT NOT NULL,                    -- Foreign Key linking to users.id
    name TEXT NOT NULL,
    sync_status TEXT DEFAULT 'pending_create',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Entity: Notes
CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY,                       -- Client-generated UUID
    remote_id INTEGER NULL,                    -- Assigned by the backend after sync
    user_id TEXT NOT NULL,  
    collection_id TEXT NOT NULL,                  -- Foreign Key linking to users.id
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    sync_status TEXT DEFAULT 'pending_create', -- 'synced', 'pending_create', 'pending_update', 'pending_delete'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
);