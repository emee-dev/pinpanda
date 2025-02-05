// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

pub mod commands;

/*
use walkdir::WalkDir;

for entry in WalkDir::new("foo") {
    let entry = entry.unwrap();
    println!("{}", entry.path().display());
}

    or

use walkdir::{DirEntry, WalkDir};

fn is_hidden(entry: &DirEntry) -> bool {
    entry.file_name()
         .to_str()
         .map(|s| s.starts_with("."))
         .unwrap_or(false)
}

let walker = WalkDir::new("foo").into_iter();
for entry in walker.filter_entry(|e| !is_hidden(e)) {
    let entry = entry.unwrap();
    println!("{}", entry.path().display());
}
*/

/*
use thiserror::Error;

#[derive(Error, Debug)]
pub enum DataStoreError {
    #[error("data store disconnected")]
    Disconnect(#[from] io::Error),
    #[error("the data for key `{0}` is not available")]
    Redaction(String),
    #[error("invalid header (expected {expected:?}, found {found:?})")]
    InvalidHeader {
        expected: String,
        found: String,
    },
    #[error("unknown data store error")]
    Unknown,
}

*/

/*
use glob::glob;

for entry in glob("/media/**/
*.jpg").expect("Failed to read glob pattern") {
    match entry {
        Ok(path) => println!("{:?}", path.display()),
        Err(e) => println!("{:?}", e),
    }
}
*/

/*
use dotenv_parser::parse_dotenv;

fn main() {
    let source = r#"
        ENV_FOR_HYDRO='testing 2' # another one here
        export USER_ID=5gpPN5rcv5G41U_S
        API_TOKEN=30af563ccc668bc8ced9e24e  # relax! these values are fake
APP_SITE_URL=https: //my.example.com
    "#;
    println!("{:#?}", parse_dotenv(source).unwrap());
}
*/

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            // commands::do_something,
            commands::cmd_eval_js,
            commands::cmd_http_request,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
