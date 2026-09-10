CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY,
    entitiy_type TEXT NOT NULL,
    entitiy_id TEXT NOT NULL,
    action text
)