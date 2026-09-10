import Database from "@tauri-apps/plugin-sql";

export const db = async () => {
    return Database.load("sqlite:UnstickyNotes.db");
}