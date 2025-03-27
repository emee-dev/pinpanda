use crate::http_runner::{self, PandaHttpResponse, PandaTomlRequest};
use crate::utils::{replace_variables, variables_to_hashmap};

use std::env;
use std::path::Path;
use std::sync::{Arc, Mutex};
use tauri::{self, AppHandle, Listener, Manager, Runtime, WebviewWindow};

#[tauri::command(rename_all = "snake_case")]
pub async fn cmd_http_request<R: Runtime>(
    app_handle: AppHandle<R>,
    toml_schema: &str,
    default_variables: &str,
) -> Result<PandaHttpResponse, String> {
    let (cancel_tx, cancel_rx) = tokio::sync::watch::channel(false);
    let webview: WebviewWindow<R> = app_handle.get_webview_window("main").unwrap();

    let temp_event_id = Arc::new(Mutex::new(0));
    let temp_event_id_clone = Arc::clone(&temp_event_id);

    let parsed_variables = variables_to_hashmap(default_variables);
    let interpolated_toml = replace_variables(toml_schema, &parsed_variables);

    webview.listen_any("cancel_request", move |ev| {
        if let Err(e) = cancel_tx.send(true) {
            println!("Failed to send cancel event for ephemeral request {e:?}");
        }

        let mut lock = temp_event_id.lock().unwrap();
        *lock = ev.id();

        println!("Request is cancelled")
    });

    let schema: PandaTomlRequest = match toml::from_str(interpolated_toml.as_str()) {
        Ok(d) => d,
        Err(e) => return Err(e.to_string()),
    };

    let res = http_runner::run_single_request(schema, cancel_rx).await;

    // Try to unlisten after each individual request
    webview.unlisten(*temp_event_id_clone.lock().unwrap());

    res
}

#[tauri::command(rename_all = "snake_case")]
pub async fn cmd_update_cwd(curr_dir: &str) -> Result<String, String> {
    let dir = Path::new(curr_dir);

    if let Err(v) = env::set_current_dir(&dir) {
        return Err(v.to_string());
    }

    Ok(env::current_dir().unwrap().to_str().unwrap().to_string())
}
