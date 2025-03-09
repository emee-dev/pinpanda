pub mod commands;
use clap::Parser;
use std::env::{current_dir, set_current_dir};
use std::path::Path;
use std::path::PathBuf;
use tauri::{self, Builder};

/// Simple cli interface used to pass collection path like vscode.
#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
struct Args {
    /// Folder or file to be opened (defaults to current directory if not provided)
    // #[arg(value_name = "PATH", default_value = ".", required = false)]
    #[arg(required = false)]
    path: Option<PathBuf>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    let args = Args::parse();

    let builder = Builder::default()
        .plugin(tauri_plugin_cli::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![commands::cmd_http_request]);

    let builder = if let Some(path) = args.path {
        let cli_path = path.to_str().unwrap();
        let root = Path::new(cli_path);
        set_current_dir(&root).unwrap();

        let cwd = current_dir().unwrap();
        let folder = cwd.to_str().unwrap();

        println!("CLI Mode: {}", folder);

        builder.setup(|_| Ok(()))
    } else {
        println!("GUI Mode");
        builder.setup(|_| Ok(()))
    };

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
