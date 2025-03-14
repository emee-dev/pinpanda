pub mod commands;
use clap::Parser;
use glob::glob;
use serde::{Deserialize, Serialize};
use std::env::{current_dir, set_current_dir};
use std::fs;
use std::path::Path;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{self, Builder, Manager, State};

#[derive(Serialize, Deserialize, Debug)]
struct PandaConfig {
    name: String,
    version: String,
    /// The user defined directory relative to the `panda.config.json`
    collection: String,
}

#[derive(Serialize, Deserialize)]
struct PandaCollection {
    #[serde(skip_serializing)]
    is_folder: bool,
    item_name: String,
    item_path: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    item_content: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    children: Option<Vec<PandaCollection>>,
}

struct AppData {
    /// The app could be started using cli
    gui_mode: &'static str,
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
    /// Folder or file to be opened (defaults to current directory if not provided)
    // #[arg(value_name = "PATH", default_value = ".", required = false)]
    #[arg(required = false)]
    path: Option<PathBuf>,
}

#[tauri::command]
fn get_app_mode(state: State<'_, Mutex<AppData>>) -> String {
    let state = state.lock().unwrap();

    let gui_mode = state.gui_mode;

    gui_mode.to_string()
}

#[tauri::command]
fn get_collections(cwd: String) -> Result<Vec<PandaCollection>, JsError> {
    let mut collection: Vec<PandaCollection> = vec![];

    let panda_config = format!("{}/{}", cwd, PANDA_CONFIG);

    if cwd.is_empty() {
        return Err(JsError {
            message: "cwd appears to be empty.",
            ..Default::default()
        });
    }

    let dir = normalise_path(cwd);

    if !is_valid_dir(&dir) {
        return Err(JsError {
            message: "cwd is an invalid dir.",
            ..Default::default()
        });
    }

    let conf =
        fs::read_to_string(panda_config.clone()).expect("Should have been able to read the file");

    let conf: PandaConfig =
        serde_json::from_str(&conf).expect("should have been able to read config.");

    let config_collection = format!("{}/{}", dir, conf.collection);

    // Only finds .toml files in the folder, do not go deeper. Sub folder support coming soon.
    let collection_folder = glob(format!("{}/*.toml", config_collection).as_str())
        .expect("Failed to read glob pattern");

    for entry in collection_folder {
        match entry {
            Ok(path) => {
                let file_path: String = path
                    .to_str()
                    .expect("should be a valid utf8 string")
                    .to_string();

                let file_name = path
                    .file_name()
                    .expect("should be a valid utf8 string")
                    .to_str()
                    .unwrap()
                    .to_string();

                let normal_path = normalise_path(file_path);

                let contents = fs::read_to_string(normal_path.clone())
                    .expect("Should have been able to read the file");

                collection.push(PandaCollection {
                    is_folder: false,
                    item_path: normal_path,
                    item_name: file_name,
                    item_content: Some(contents),
                    children: None,
                });
            }
            Err(_) => (),
        }
    }

    Ok(collection)
}

fn is_valid_dir(dir: impl Into<String>) -> bool {
    let path = String::from(dir.into());

    match Path::new(path.as_str()).try_exists() {
        Ok(_) => true,
        Err(_) => false,
    }
}

fn normalise_path(dir: String) -> String {
    let mut path = String::from(dir);

    if path.contains("\\") {
        path = path.replace("\\\\", "/").as_str().to_string();
    };

    path = path.replace("\\", "/");

    path
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    let args = Args::parse();

    let builder = Builder::default()
        .plugin(tauri_plugin_cli::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::cmd_http_request,
            get_app_mode,
            get_collections
        ]);

    let builder = if let Some(path) = args.path {
        let cli_path = path.to_str().unwrap();
        let root = Path::new(cli_path);
        set_current_dir(&root).unwrap();

        let cwd = current_dir().unwrap();
        let folder = cwd.to_string_lossy().to_string();

        builder.setup(move |app| {
            app.manage(Mutex::new(AppData {
                gui_mode: "cli_gui",
                cwd: folder,
            }));

            Ok(())
        })
    } else {
        builder.setup(move |app| {
            app.manage(Mutex::new(AppData {
                gui_mode: "desktop_gui",
                cwd: "".to_string(),
            }));

            Ok(())
        })
    };

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
