pub mod commands;
use commands::AppData;
use tauri::Manager;
use tauri_plugin_cli::CliExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_cli::init())
        .setup(|app| {
            app.manage(AppData::default());

            match app.cli().matches() {
                Ok(_matches) => {
                    // println!("{:?}", matches.args);
                    Ok(())
                }
                Err(err) => Err(err.into()),
            }
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::cmd_http_request,
            // commands::cmd_list_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
