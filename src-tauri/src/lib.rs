use tauri_plugin_sql::{Migration, MigrationKind};
use tauri_plugin_opener;
use tauri_plugin_single_instance;
use tauri::{Manager,Emitter};

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
      .plugin(tauri_plugin_opener::init())
      .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_focus();
            }

            // 2. Forward the CLI deep-link argument to the JS listener
            // On Linux, the OS passes 'unstickynotes://...' as args[1] to the new process
            if let Some(url) = args.get(1) {
                if url.starts_with("unstickynotes://") {
                    // `@tauri-apps/plugin-deep-link` listens for this exact event name and payload shape
                    let _ = app.emit("deep-link://new-url", vec![url]);
                }
            }
        }))
      .run(tauri::generate_context!())
      .expect("error while running tauri application");
  }
