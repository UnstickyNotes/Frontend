CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    entitiy_type TEXT NOT NULL,
    entitiy_remote_id TEXT NOT NULL,
    action TEXT NOT NULL, -- CREATED, UPADATED, DELETED
    payload TEXT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)