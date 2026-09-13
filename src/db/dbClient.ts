import Database from "@tauri-apps/plugin-sql";

const getDB = async () => {
    return Database.load("sqlite:UnstickyNotes.db");
}

export default getDB;