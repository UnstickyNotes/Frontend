import Database from "@tauri-apps/plugin-sql";

let instance : Database | null = null
const getDB = async () => {
    if(instance) return instance

    // const dbPath = import.meta.env.DEV
    // ? `sqlite:${import.meta.env.VITE_WORKSPACE_PATH}/UnstickyNotes.db`
    // : 'sqlite:UnstickyNotes.db';

    instance = await Database.load('sqlite:UnstickyNotes.db');
    return instance
    
}

export default getDB;