use tauri_plugin_sql::{Migration, MigrationKind};
use tauri_plugin_opener;
use tauri_plugin_single_instance;
use tauri::{
  menu::{Menu, MenuItem},
  tray::{MouseButton, MouseButtonState, TrayIconEvent, TrayIconBuilder},
  Manager,
  Emitter};
use tauri_plugin_autostart::ManagerExt;
use tauri_plugin_global_shortcut::{
  // Code,
  // Modifiers,
  Shortcut,
  ShortcutState,
  GlobalShortcutExt,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let migrations = vec!  [
      Migration {
        version: 1,
        description: "create_all_tables",
        sql: include_str!("../migrations/1_create_all_tables.sql"),
        kind: MigrationKind::Up
      },
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
                let _ = window.show();
                let _ = window.unminimize();
                let _ = window.set_always_on_top(true);
                let _ = window.set_focus();
                let _ = window.set_always_on_top(false);
                // when trying to open using shortcuts
                if args.contains(&"--quick-note".to_string()) {
                        let _ = window.emit("open_modal", "quick-modal");
                    }
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
      .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--minimized"]), // Windows passes this when booting the app
        ))
      .setup(|app| {
        // global shortcut
          let shortcut_str = "Ctrl+Shift+Alt+;";
            let shortcut: Shortcut = shortcut_str
                .parse()
                .expect("Failed to parse shortcut string");

            let hotkey = shortcut.clone();

            // 2. Register handler with UNCONDITIONAL logging
            app.handle().plugin(
                tauri_plugin_global_shortcut::Builder::new()
                    .with_handler(move |app, sc, event| {
                        // Print EVERY event that reaches the app
                        // println!("RECEIVED KEY EVENT: sc={:?}, state={:?}", sc, event.state());

                        if event.state() == ShortcutState::Pressed && sc == &hotkey {
                            // println!("🔥 HOTKEY MATCHED! Bumping window...");
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.unminimize();
                                let _ = window.set_focus();
                                let _ = window.emit("open_modal", "quick-modal");
                            }
                        }
                    })
                    .build(),
            )?;

            // 3. Print whether OS registration actually succeeded
            app.global_shortcut().register(shortcut)?;
          
        // Create Tray Menu Items ("Open" and "Exit")
          let open_item = MenuItem::with_id(app, "open", "Open UnstickyNotes", true, None::<&str>)?;
          let exit_item = MenuItem::with_id(app, "exit", "Exit", true, None::<&str>)?;

          // 2. Build Menu layout
          let tray_menu = Menu::with_items(app, &[&open_item, &exit_item])?;

          // 3. Build System Tray Icon and Event Handlers
          let _tray = TrayIconBuilder::new()
            .icon(app.default_window_icon().unwrap().clone())
            .menu(&tray_menu)
            .show_menu_on_left_click(false) // Right-click opens the menu
            .on_menu_event(|app, event| match event.id.as_ref() {
                "open" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                "exit" => {
                    // Kills the process directly (bypasses window close interception)
                    app.exit(0);
                }
                _ => {}
              })
            .on_tray_icon_event(|tray, event| {
              // Left-clicking the icon directly opens/focuses the app
              if let TrayIconEvent::Click {
                  button: MouseButton::Left,
                  button_state: MouseButtonState::Up,
                  ..
              } = event
              {
                  let app = tray.app_handle();
                  if let Some(window) = app.get_webview_window("main") {
                      let _ = window.show();
                      let _ = window.set_focus();
                  }
              }
            })
            .build(app)?;

          let autostart_manager = app.autolaunch();
          
          if let Ok(false) = autostart_manager.is_enabled() {
              let _ = autostart_manager.enable();
            }
          let args: Vec<String> = std::env::args().collect();
          if args.contains(&"--minimized".to_string()) {
              if let Some(window) = app.get_webview_window("main") {
                  // Hide the window so it stays in the background/tray
                  let _ = window.hide();
              }
          }
          Ok(())
        })
      // Prevent 'X' button from killing the process when running in background
      .on_window_event(|window, event| {
          if let tauri::WindowEvent::CloseRequested { api, .. } = event {
              let _ = window.hide();
              api.prevent_close();
          }
        })
      
      .run(tauri::generate_context!())
      .expect("error while running tauri application");
  }
