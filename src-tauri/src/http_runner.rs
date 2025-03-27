use reqwest::header::CONTENT_TYPE;
use reqwest::multipart;
use reqwest::Method;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::str::FromStr;
use std::{collections::HashMap, time::Instant};
use tauri::http::HeaderMap;
use tauri::http::HeaderName;
use tauri::http::HeaderValue;
use tokio::sync::oneshot;
use tokio::sync::watch::Receiver;

type Json = serde_json::Value;

// Separate logic
#[derive(Deserialize, Clone, Debug, Serialize)]
pub struct PandaHttpResponse {
    pub status: u16,
    pub elapsed_time: u64,
    pub text_response: Option<String>,
    pub headers: Option<HashMap<String, String>>,
    pub content_type: String,
}

#[derive(Deserialize, Clone, Debug, Serialize)]
pub struct PandaTomlRequest {
    pub get: Option<RequestParams>,
    pub head: Option<RequestParams>,
    pub post: Option<RequestParams>,
    pub put: Option<RequestParams>,
    pub patch: Option<RequestParams>,
    pub delete: Option<RequestParams>,
    pub options: Option<RequestParams>,
}

#[derive(Deserialize, Clone, Debug, Serialize)]
#[serde(rename_all = "lowercase")]
pub struct RequestParams {
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
    form_multipart: Option<FormPayload>,
    form_urlencoded: Option<FormPayload>,
    xml: Option<BodyText>,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
pub struct BodyText {
    content: String,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
pub struct FormPayload {
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
    BodyFormUrlEncoded {
        content: Vec<FormContent>,
    },
    BodyFormMultipart {
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

pub async fn run_single_request(
    req: PandaTomlRequest,
    mut cancelled_rx: Receiver<bool>,
) -> Result<PandaHttpResponse, String> {
    let client_builder = reqwest::ClientBuilder::new()
        .connection_verbose(true)
        .gzip(true)
        .brotli(true)
        .deflate(true)
        .referer(false)
        .tls_info(true);

    let client = client_builder
        .build()
        .expect("was unable to build client_builder");

    let params = match req {
        PandaTomlRequest {
            get: Some(payload), ..
        } => RequestParams {
            method: String::from("get"),
            ..payload
        },
        PandaTomlRequest {
            head: Some(payload),
            ..
        } => RequestParams {
            method: String::from("head"),
            ..payload
        },
        PandaTomlRequest {
            post: Some(payload),
            ..
        } => RequestParams {
            method: String::from("post"),
            ..payload
        },
        PandaTomlRequest {
            put: Some(payload), ..
        } => RequestParams {
            method: String::from("put"),
            ..payload
        },
        PandaTomlRequest {
            patch: Some(payload),
            ..
        } => RequestParams {
            method: String::from("patch"),
            ..payload
        },
        PandaTomlRequest {
            delete: Some(payload),
            ..
        } => RequestParams {
            method: String::from("delete"),
            ..payload
        },
        PandaTomlRequest {
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
    let headers: Option<Value> = params.headers;

    if url.is_empty() {
        return Err("Please provide a valid request url.".to_string());
    };

    if method.is_empty() {
        return Err("Please provide a valid request method.".to_string());
    };

    let body = (
        params.text,
        params.json,
        params.form_multipart,
        params.form_urlencoded,
        params.xml,
    );

    // TODO improve this logic to better support when there is no request body eg for get requests
    let valid_body = match body {
        (Some(text), _, _, _, _) => BodyVariants::BodyText {
            content: text.content.to_owned(),
        },
        (_, Some(json), _, _, _) => BodyVariants::BodyText {
            content: json.content.to_owned(),
        },
        (_, _, Some(form_multipart), _, _) => BodyVariants::BodyFormMultipart {
            content: form_multipart.content.to_owned(),
        },
        (_, _, _, Some(form_urlencoded), _) => BodyVariants::BodyFormUrlEncoded {
            content: form_urlencoded.content.to_owned(),
        },
        (_, _, _, _, Some(_xml)) => BodyVariants::Unsupported,
        _ => BodyVariants::Unknown,
    };

    let now = Instant::now();

    // Here we can run pre-request scripts

    let query_url = match params.query {
        Some(query) => {
            let parse_object = query
                .as_object()
                .expect("query should be a valid json value keypair");

            let mut key_value: Vec<(String, String)> = vec![];

            for item in parse_object {
                let key = item.0.to_string();
                let value = item.1.to_string();

                key_value.push((key, value));
            }

            let query_str = reqwest::Url::parse_with_params(&url, &key_value)
                .expect("should be a valid query string.");

            query_str.to_string()
        }
        None => url.to_string(),
    };

    let request = match method.to_lowercase().as_str() {
        "get" => client.get(&query_url),
        "head" => client.head(&query_url),
        "post" => client.post(&query_url),
        "put" => client.put(&query_url),
        "patch" => client.patch(&query_url),
        "delete" => client.delete(&query_url),
        "options" => client.request(Method::OPTIONS, &query_url),
        _ => client.get(&query_url),
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
        BodyVariants::BodyFormUrlEncoded { content } => {
            let mut params = HashMap::new();

            for item in content {
                params.insert(item.field, item.value);
            }

            request.form(&params)
        }
        BodyVariants::BodyFormMultipart { content } => {
            let mut form = multipart::Form::new();

            for item in content {
                let key = item.field;

                // try reading the value as file initially, if it fails then return the value as string or null
                let value = item.value;

                form = form.text(key.clone(), value.to_string());
            }

            request.multipart(form)
        }
        BodyVariants::Unsupported => request,
        BodyVariants::Unknown => request,
    };

    let with_request_headers = match headers {
        Some(valid_headers) => {
            let parse_headers = valid_headers.as_object().unwrap();

            let mut reqwest_headers: HeaderMap = HeaderMap::new();

            reqwest_headers.insert("User-Agent", "Worm".parse().unwrap());

            for item in parse_headers {
                let key = item.0.to_owned();
                let value = item.1;

                if key.is_empty() {
                    return Err("Invalid request header".into());
                }

                if value.is_number() {
                    return Err("Invalid request value, you may have provided a number.".into());
                }

                let value = value
                    .as_str()
                    .expect("should expect header value to be a valid string.");

                // TODO handle cases where the header key and values may be invalid.
                reqwest_headers.insert(
                    HeaderName::from_str(key.as_str()).unwrap(),
                    HeaderValue::from_str(value).unwrap(),
                );
            }

            with_request_body.headers(reqwest_headers)
        }
        None => with_request_body,
    };

    let (resp_tx, resp_rx) = oneshot::channel::<Result<reqwest::Response, reqwest::Error>>();

    // Send the request in a separate thread.
    tokio::spawn(async move {
        let send_request: Result<reqwest::Response, reqwest::Error> =
            with_request_headers.send().await;

        let _ = resp_tx.send(send_request);
    });

    // Listen for cancelled event change
    let raw_response = tokio::select! {
        Ok(r) = resp_rx => r,
        _ = cancelled_rx.changed() => {
            println!("Request cancelled");
            return Ok(PandaHttpResponse {
                status: 0, elapsed_time: 0,
                text_response: Some("Request was cancelled.".to_string()),
                headers: Some(HashMap::new()),
                content_type: "application/text".to_string()
            });
        }
    };

    {
        // Handle the actual response for this request.
        let response = match raw_response {
            Ok(a) => a,
            Err(err) => {
                if err.is_connect() {
                    return Err(format!("Connection error: {}", err.to_string()));
                } else if err.is_timeout() {
                    return Err(format!("Timeout error: {}", err.to_string()));
                } else if err.is_status() {
                    return Err(format!("HTTP error: {}", err.to_string()));
                } else {
                    return Err(format!("Other error: {}", err.to_string()));
                };
            }
        };

        let mut response_headers: HashMap<String, String> = HashMap::new();

        let status = response.status().as_u16();

        let headers = response.headers().clone();
        let response_type = response.headers().clone();
        let content_type = response_type.get(CONTENT_TYPE).unwrap();

        for (k, v) in headers {
            if let Some(valid_header) = k {
                let key = valid_header.to_string();

                let value = v.as_bytes();
                let value = String::from_utf8_lossy(value).to_string();

                response_headers.insert(key, value);
            }
        }

        let response_as_text = response.text().await;

        let text = match response_as_text {
            Ok(text) => text,
            Err(msg) => return Err(msg.to_string()),
        };

        let elapsed_time = now.elapsed();

        let after_response = PandaHttpResponse {
            status,
            headers: Some(response_headers),
            text_response: Some(text),
            elapsed_time: elapsed_time.as_secs(),
            content_type: content_type
                .to_str()
                .expect("should be a valid content type")
                .to_string(),
        };

        // Here we can run post-request scripts
        Ok(after_response)
    }
}
