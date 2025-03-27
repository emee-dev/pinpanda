pub mod command;
pub mod http_runner;
pub mod utils;

use anyhow::{Context, Result as AnyResult};
use clap::Parser;
use serde::{Deserialize, Serialize};
use std::env::{current_dir, set_current_dir};
use std::fs;
use std::path::Path;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{self, Builder, Manager, Runtime, State};
use utils::{get_collection_from_path, normalise_path, PandaCollection};

#[derive(Serialize, Deserialize, Debug, Default)]
struct PandaConfig {
    name: String,
    version: String,
    /// The user defined directory relative to the `panda.config.json`
    collection: String,
}

#[derive(Serialize, Deserialize, Default)]
struct AppData {
    /// The app could be started using cli
    // gui_mode: &'static str,
    gui_mode: String,
    /// Root Directory containing `"panda.config.json"`.
    cwd: String,
}

#[derive(Serialize, Deserialize, Default)]
struct JsError {
    name: Option<String>,
    message: &'static str,
}

const PANDA_CONFIG: &str = "panda.config.json";

/// Simple cli interface used to pass collection path like vscode.
#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
struct Args {
    /// Root directory containing `"panda.config.json"` (defaults to app directory if not provided)
    #[arg(required = false)]
    path: Option<PathBuf>,
}

#[tauri::command]
async fn cmd_get_app_state(state: State<'_, Mutex<AppData>>) -> Result<AppData, String> {
    let state = state.lock().unwrap();

    Ok(AppData {
        gui_mode: state.gui_mode.clone(),
        cwd: state.cwd.clone(),
    })
}

#[tauri::command(rename_all = "snake_case")]
fn cmd_get_collections<R: Runtime>(
    config_path: String,
    app: tauri::AppHandle<R>,
) -> AnyResult<Vec<PandaCollection>, String> {
    let state = app.state::<Mutex<AppData>>();
    let mut app_state = state.lock().unwrap();

    let config_path = normalise_path(config_path.clone());

    if config_path.is_empty() {
        return Err("You provided an empty string for cwd.".into());
    }

    if config_path.to_lowercase().ends_with(PANDA_CONFIG) {
        // C:/Users/DELL/Desktop/Panda collections/panda.config.json
        let config = match fs::read_to_string(config_path.clone())
            .with_context(|| format!("Failed to read config: {:?}", config_path))
        {
            Ok(c) => c,
            Err(err) => return Err(err.to_string()),
        };

        let config_content: PandaConfig =
            serde_json::from_str(&config).expect("should have been able to read config.");

        let project_root = Path::new(config_path.as_str())
            .parent()
            .expect("unable to strip config from path")
            .to_str()
            .expect("unable to extract the parent path from config path");

        // Update app cwd
        app_state.cwd = project_root.to_string();

        // Here we read the collection defined in config and assume it is relative to `panda.config.json`
        let relative_collection = normalise_path(format!(
            "{}/{}",
            project_root.to_string(),
            config_content.collection
        ));

        let _temp: Vec<PandaCollection> = vec![];

        let collections = get_collection_from_path(relative_collection, _temp);

        if let Err(er) = collections {
            return Err(er.to_string());
        }

        Ok(collections.unwrap())
    } else {
        // C:/Users/DELL/Desktop/Panda collections
        let relative_config = format!("{}/{}", config_path, PANDA_CONFIG);

        // Here we assume the user picked the folder containing `"panda.config.json"`
        let config = match fs::read_to_string(relative_config.clone())
            .with_context(|| format!("Invalid project directory: {:?}", config_path))
        {
            Ok(c) => c,
            Err(err) => return Err(err.to_string()),
        };

        // Update app cwd
        app_state.cwd = config_path.clone();

        let config_content: PandaConfig =
            serde_json::from_str(&config).expect("should have been able to read config.");

        // TODO normalise path
        let read_collection_relative_to_config =
            normalise_path(format!("{}/{}", config_path, config_content.collection));

        let _temp: Vec<PandaCollection> = vec![];

        let collections = get_collection_from_path(read_collection_relative_to_config, _temp);

        if let Err(er) = collections {
            return Err(er.to_string());
        }

        Ok(collections.unwrap())
    }
}

// #[tauri::command(rename_all = "snake_case")]
// async fn send_fake_event<R: Runtime>(
//     app_handle: AppHandle<R>,
//     toml_schema: &str,
//     default_variables: &str,
// ) -> Result<PandaHttpResponse, String> {
//     let (cancel_tx, cancel_rx) = tokio::sync::watch::channel(false);
//     let webview: WebviewWindow<R> = app_handle.get_webview_window("main").unwrap();

//     let temp_event_id = Arc::new(Mutex::new(0));
//     let temp_event_id_clone = Arc::clone(&temp_event_id);

//     let parsed_variables = variables_to_hashmap(default_variables);
//     let interpolated_toml = replace_variables(toml_schema, &parsed_variables);

//     webview.listen_any("cancel_request", move |ev| {
//         if let Err(e) = cancel_tx.send(true) {
//             println!("Failed to send cancel event for ephemeral request {e:?}");
//         }

//         let mut lock = temp_event_id.lock().unwrap();
//         *lock = ev.id();

//         println!("Request is cancelled")
//     });

//     let schema: TomlRequest = match toml::from_str(interpolated_toml.as_str()) {
//         Ok(d) => d,
//         Err(e) => return Err(e.to_string()),
//     };

//     let res = http_runner::run_single_request(schema, cancel_rx).await;

//     // Try to unlisten after each individual request
//     webview.unlisten(*temp_event_id_clone.lock().unwrap());

//     res
// }

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    let args = Args::parse();

    let builder = Builder::default()
        .plugin(tauri_plugin_cli::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            // command::cmd_http_request,
            command::cmd_http_request,
            cmd_get_app_state,
            cmd_get_collections,
            // send_fake_event
        ]);

    let builder = if let Some(path) = args.path {
        let cli_path = path.to_str().unwrap();
        let root = Path::new(cli_path);
        set_current_dir(&root).unwrap();

        let cwd = current_dir().unwrap();
        let folder = cwd.to_string_lossy().to_string();

        builder.setup(move |app| {
            app.manage(Mutex::new(AppData {
                gui_mode: "cli_gui".to_string(),
                cwd: folder,
            }));

            Ok(())
        })
    } else {
        builder.setup(move |app| {
            app.manage(Mutex::new(AppData {
                gui_mode: "desktop_gui".to_string(),
                cwd: "".to_string(),
            }));

            Ok(())
        })
    };

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
