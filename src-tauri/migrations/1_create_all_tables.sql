-- Entity: Users
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NULL,
    email TEXT NOT NULL UNIQUE,
    last_synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Entity: Collections
CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    remote_id INTEGER NULL,                    -- Assigned by Laravel backend after sync
    user_id INTEGER NOT NULL,                     -- Foreign Key linking to users.id
    name TEXT NOT NULL,
    sync_status TEXT DEFAULT 'pending_create', -- 'synced', 'pending_create', 'pending_update', 'pending_delete'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Entity: Notes
CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    remote_id INTEGER NULL,                    -- Assigned by Laravel backend after sync
    user_id INTEGER NOT NULL,                     -- Foreign Key linking to users.id
    collection_id INTEGER NOT NULL,               -- Foreign Key linking to collections.id
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    sync_status TEXT DEFAULT 'pending_create',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
);

-- Entity: Sync Queue
CREATE TABLE IF NOT EXISTS sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,                     -- Foreign Key linking to users.id
    entity_type TEXT NOT NULL,                 -- 'collections', 'notes'
    entity_id INTEGER NOT NULL,                   -- Local client UUID
    entity_remote_id INTEGER NULL,             -- Nullable (set when remote_id exists)
    action TEXT NOT NULL,                      -- 'CREATE', 'UPDATE', 'DELETE'
    payload TEXT NULL,                         -- JSON payload string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);