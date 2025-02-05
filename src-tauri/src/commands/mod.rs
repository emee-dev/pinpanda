use reqwest::multipart;
use reqwest::Method;
use rustyscript::RuntimeOptions;
use rustyscript::{json_args, Error, Module, Runtime};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::str::FromStr;
use std::{collections::HashMap, time::Instant};
use tauri::http::HeaderMap;
use tauri::http::HeaderName;
use tauri::http::HeaderValue;
use toml;

type Json = serde_json::Value;

// Separate logic
#[derive(Deserialize, Clone, Debug, Serialize)]
pub struct RequestResponse {
    status: u16,
    elapsed_time: u128,
    text_response: Option<String>,
    headers: Option<HashMap<String, String>>,
}

// let formbody = [("foo", "bar"), ("ajax", "axios")];

// New toml syntax
#[derive(Deserialize, Clone, Debug, Serialize)]
// #[serde(deny_unknown_fields)]
struct TomlRequest {
    // Ideally we require only one variant.
    get: Option<RequestParams>,
    head: Option<RequestParams>,
    post: Option<RequestParams>,
    put: Option<RequestParams>,
    patch: Option<RequestParams>,
    delete: Option<RequestParams>,
    options: Option<RequestParams>,
}

#[derive(Deserialize, Clone, Debug, Serialize)]
#[serde(rename_all = "lowercase")]
struct RequestParams {
    #[serde(skip_serializing, skip_deserializing)]
    method: String,

    url: String,
    name: Option<String>,
    params: Option<Json>,
    query: Option<Json>,
    headers: Option<Json>,
    pre_request: Option<Script>,

    // Request Bodies
    text: Option<BodyText>,
    json: Option<BodyText>,
    form_multipart: Option<FormMultipart>,
    // form_urlencoded: Option<BodyText>,
    xml: Option<BodyText>,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
struct BodyText {
    content: String,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
struct FormMultipart {
    /// Can handle both `form-data` and `multipart`.
    content: Vec<FormContent>,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "lowercase")]
enum BodyVariants {
    BodyText {
        content: String,
    },
    BodyJson {
        content: String,
    },
    // TODO make separate structs for form_data & url_encoded types
    BodyForm {
        #[serde(alias = "type")]
        #[serde(rename(serialize = "type", deserialize = "body_type"))]
        body_type: String,
        content: Vec<FormContent>,
    },

    Unsupported,

    #[serde(other)] // Catch-all for unsupported types.
    Unknown,
}

#[derive(serde::Deserialize, Debug, Clone, serde::Serialize)]
struct FormContent {
    field: String,
    value: String,
}

#[derive(Deserialize, Clone, Debug, Serialize)]
struct Script {
    code: String,
}

#[tauri::command(rename_all = "snake_case")]
pub async fn cmd_http_request(toml_schema: &str) -> Result<RequestResponse, String> {
    let client = reqwest::Client::new();

    let schema: TomlRequest = match toml::from_str(&toml_schema) {
        Ok(d) => d,
        Err(e) => return Err(e.to_string()),
    };

    let params = match schema {
        TomlRequest {
            get: Some(payload), ..
        } => RequestParams {
            method: String::from("get"),
            ..payload
        },
        TomlRequest {
            head: Some(payload),
            ..
        } => RequestParams {
            method: String::from("head"),
            ..payload
        },
        TomlRequest {
            post: Some(payload),
            ..
        } => RequestParams {
            method: String::from("post"),
            ..payload
        },
        TomlRequest {
            put: Some(payload), ..
        } => RequestParams {
            method: String::from("put"),
            ..payload
        },
        TomlRequest {
            patch: Some(payload),
            ..
        } => RequestParams {
            method: String::from("patch"),
            ..payload
        },
        TomlRequest {
            delete: Some(payload),
            ..
        } => RequestParams {
            method: String::from("delete"),
            ..payload
        },
        TomlRequest {
            options: Some(payload),
            ..
        } => RequestParams {
            method: String::from("options"),
            ..payload
        },
        _ => return Err("Invalid or unsupported request method".to_string()),
    };

    let url: String = params.url;
    let method: String = params.method;
    let headers = params.headers;

    if url.is_empty() {
        return Err("Please provide a valid request url.".to_string());
    };

    if method.is_empty() {
        return Err("Please provide a valid request method.".to_string());
    };

    let valid_body = match (params.text, params.json, params.form_multipart, params.xml) {
        (Some(text), _, _, _) => BodyVariants::BodyText {
            content: text.content.to_owned(),
        },
        (_, Some(json), _, _) => BodyVariants::BodyText {
            content: json.content.to_owned(),
        },
        (_, _, Some(form_multipart), _) => BodyVariants::BodyForm {
            body_type: String::from("form_multipart"),
            content: form_multipart.content.to_owned(),
        },
        (_, _, _, Some(_xml)) => BodyVariants::Unsupported,
        _ => BodyVariants::Unknown,
    };

    let now = Instant::now();

    // Here we can run pre-request scripts

    let request = match method.to_lowercase().as_str() {
        "get" => {
            // let url = "https://holidayapi.com/v1/holidays";
            let query_params = [("key", "api_key"), ("country", "US"), ("year", "2020")];

            match params.query {
                Some(_) => {
                    let queried_url = reqwest::Url::parse_with_params(&url, &query_params).unwrap();

                    client.get(queried_url)
                }
                None => client.get(&url),
            }
        }
        "head" => client.head(&url),
        "post" => client.post(&url),
        "put" => client.put(&url),
        "patch" => client.patch(&url),
        "delete" => client.delete(&url),
        "options" => client.request(Method::OPTIONS, &url),
        _ => client.get(&url),
    };

    let with_request_body = match valid_body {
        BodyVariants::BodyText { content, .. } => request.body(content),
        BodyVariants::BodyJson { content, .. } => {
            let parse_json: Result<Value, serde_json::Error> =
                serde_json::from_str(content.as_str());

            match parse_json {
                Ok(valid_json) => request.json(&valid_json),
                Err(msg) => return Err(msg.to_string()),
            }
        }
        BodyVariants::BodyForm { content, body_type } => {
            match body_type.as_str() {
                "form_urlencoded" => request.form(&content),
                "form_multipart" => {
                    let mut form = multipart::Form::new();

                    for item in content {
                        let key = item.field;
                        // try reading the value as file initiallly, if it fails then return the value as string or null
                        let value = item.value;

                        form = form.text(key.clone(), value.to_string());
                    }

                    request.multipart(form)
                }
                _ => return Err("Unsupported to request form body.".to_string()),
            }
        }
        BodyVariants::Unsupported => request,
        BodyVariants::Unknown => request,
    };

    let with_headers = match headers {
        Some(valid_headers) => {
            let parse_headers = valid_headers.as_object().unwrap();

            let mut reqwest_headers: HeaderMap = HeaderMap::new();

            reqwest_headers.insert("User-Agent", "Worm/v0.1.0".parse().unwrap());

            for (key, value) in parse_headers {
                let string_key = key.to_owned();

                if value.is_number() {
                    return Err("Invalid request header value".into());
                }

                let string_val = value
                    .as_str()
                    .expect("should expect header value to be a valid string.");

                // TODO handle cases where the header key and values may be invalid.
                reqwest_headers.insert(
                    HeaderName::from_str(string_key.as_str()).unwrap(),
                    HeaderValue::from_str(string_val).unwrap(),
                );
            }

            with_request_body.headers(reqwest_headers)
        }
        None => with_request_body,
    };

    let send_request = with_headers.send().await;

    let response = match send_request {
        Ok(response) => response,
        Err(error) => return Err(error.to_string()),
    };

    let mut response_headers: HashMap<String, String> = HashMap::new();

    let status = response.status().as_u16();
    let headers = response.headers().clone();

    for (key, value) in headers.iter() {
        // TODO handle the potential error.
        response_headers.insert(key.to_string(), value.to_str().unwrap().to_string());
    }

    let response_as_text = response.text().await;

    let text = match response_as_text {
        Ok(text) => text,
        Err(msg) => return Err(msg.to_string()),
    };

    let elapsed_time = now.elapsed();

    let after_response = RequestResponse {
        status,
        headers: Some(response_headers),
        text_response: Some(text),
        elapsed_time: elapsed_time.as_millis(),
    };

    // Here we can run post-request scripts
    Ok(after_response)
}

#[tauri::command(rename_all = "snake_case")]
pub fn cmd_eval_js(script: &str) -> Result<usize, String> {
    let module = Module::new(
        "test.js",
        "
    export default (string, integer) => {
        console.log(`Hello world: string=${string}, integer=${integer}`);
        return 2;
    }
    ",
    );

    let opts = RuntimeOptions {
        ..Default::default()
    };

    let value: Result<usize, Error> =
        Runtime::execute_module(&module, vec![], opts, json_args!("test", 5));

    match value {
        Ok(num) => Ok(num),
        Err(err) => Err(err.to_string()),
    }
}
