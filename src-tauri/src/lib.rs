use tauri_plugin_sql::{Migration, MigrationKind};
use tauri_plugin_deep_link;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let migrations = vec!  [
      Migration {
        version: 1,
        description: "create_all_tables",
        sql: include_str!("../migrations/1_create_all_tables.sql"),
        kind: MigrationKind::Up
      },
      // Migration {
      //   version: 2,
      //   description: "create_sync_queue_table",
      //   sql: include_str!("../migrations/2_create_sync_queue_table.sql"),
      //   kind: MigrationKind::Up
      // },
    ];
    tauri::Builder::default()
      .setup(|app| {
        if cfg!(debug_assertions) {
          app.handle().plugin(
            tauri_plugin_log::Builder::default()
              .level(log::LevelFilter::Info)
              .build(),
          )?;
        }
        Ok(())
      })
      .plugin(
        tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:UnstickyNotes.db", migrations)
                .build(),
      )
      .plugin(tauri_plugin_deep_link::init())
      .run(tauri::generate_context!())
      .expect("error while running tauri application");
  }
