use anyhow::Context;
use fancy_regex::Regex;
use normalize_path::NormalizePath;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::Path;
use uuid::Uuid;
use walkdir::WalkDir;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PandaCollection {
    pub id: String,
    pub name: String,
    pub path: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub children: Option<Vec<PandaCollection>>,
    #[serde(rename(serialize = "isSelectable", deserialize = "is_selectable"))]
    pub is_selectable: bool,
    #[serde(rename(serialize = "type", deserialize = "item_type"))]
    pub item_type: String,
}

pub fn get_collection_from_path(
    path: String,
    mut collections: Vec<PandaCollection>,
) -> Result<Vec<PandaCollection>, String> {
    for entry in WalkDir::new(path.clone()).min_depth(1).max_depth(1) {
        let entry =
            match entry.with_context(|| format!("Failed to read collection: {:?}", path.clone())) {
                Ok(dir) => dir,
                Err(err) => return Err(err.to_string()),
            };

        if entry.file_type().is_dir() {
            let path = Path::new(entry.path());

            let file_path = path
                .normalize()
                .to_str()
                .expect("should be a valid utf8 string")
                .to_string();

            let file_name = path
                .normalize()
                .file_name()
                .expect("should be a valid utf8 string")
                .to_str()
                .unwrap()
                .to_string();

            let clean_path = normalise_path(file_path);

            let children = get_collection_from_path(clean_path.clone(), vec![]);

            let folder = PandaCollection {
                id: Uuid::new_v4().to_string(),
                name: file_name,
                path: clean_path.clone(),
                content: None,
                // children: Some(children.unwrap_or_else(|_| vec![])),
                children: Some(children?),
                is_selectable: true,
                item_type: "folder".to_string(),
            };

            collections.push(folder);
        }

        if entry.file_type().is_file() {
            let path = Path::new(entry.path());

            let file_path = path
                .normalize()
                .to_str()
                .expect("should be a valid utf8 string")
                .to_string();

            let file_name = path
                .normalize()
                .file_name()
                .expect("should be a valid utf8 string")
                .to_str()
                .unwrap()
                .to_string();

            let clean_path = normalise_path(file_path);

            let contents = fs::read_to_string(clean_path.clone())
                .expect("Should have been able to read the file");

            collections.push(PandaCollection {
                id: Uuid::new_v4().to_string(),
                name: file_name,
                path: clean_path,
                content: Some(contents),
                children: None,
                is_selectable: true,
                item_type: "file".to_string(),
            });
        }
    }

    Ok(collections)
}

// pub fn is_valid_dir(dir: impl Into<String>) -> bool {
//     let path = String::from(dir.into());

//     match Path::new(path.as_str()).try_exists() {
//         Ok(_) => true,
//         Err(err) => {
//             println!("Error read dir: {:}", err.to_string());

//             false
//         }
//     }
// }

pub fn normalise_path(dir: String) -> String {
    let mut path = String::from(dir);

    if path.contains("\\") {
        path = path.replace("\\\\", "/").as_str().to_string();
    };

    path = path.replace("\\", "/");

    path
}

/// Extracts unique variable names from a given string.
///
/// Variables are expected to be in the format `_.VAR_NAME`, where `VAR_NAME`
/// consists of uppercase or lowercase letters and optional underscores.
///
/// # Arguments
/// * `code` - A string containing the code to scan for variables.
///
/// # Returns
/// A vector of unique variable names (without the `_.` prefix).
fn get_variables(code: &str) -> Vec<String> {
    let re = Regex::new(r"(?<=_\.)[A-Za-z]+(?:_[A-Za-z]+)?").unwrap();
    let mut unique_vars = HashSet::new();

    for caps in re.find_iter(code).flatten() {
        unique_vars.insert(caps.as_str().to_string());
    }

    unique_vars.into_iter().collect()
}

/// Formats a vector of variable names into a single string in the format:
/// `_.VAR_1|_.VAR_2|_.VAR_3`
///
/// # Arguments
/// * `vars` - A vector of variable names (without `_.` prefix).
///
/// # Returns
/// A formatted string joining variables with `|`.
fn format_vec_to_regex(vars: Vec<String>) -> String {
    vars.iter()
        .map(|s| format!("_.{}", s))
        .collect::<Vec<String>>()
        .join("|")
}

/// Demonstrates the replacement of variables in a code string.
///
/// Variables:
/// - `BASE_URL` -> "example.com"
/// - `API_KEY` -> "api_1230202"
///
/// Example input:
/// ```
/// "https://_.BASE_URL/api/_.API_KEY?redirect=_.BASE_URL"
/// ```
/// Expected output:
/// ```
/// "https://example.com/api/api_1230202?redirect=example.com"
/// ```
pub fn replace_variables(code: &str, vars: &HashMap<String, String>) -> String {
    let extracted_vars = get_variables(code);
    let regex_pattern = format_vec_to_regex(extracted_vars);

    let re = Regex::new(&regex_pattern).unwrap();

    re.replace_all(code, |caps: &fancy_regex::Captures<'_>| {
        let full_match = caps.get(0).expect("Unable to capture group").as_str();

        if full_match.len() > 0 {
            let var_name = &full_match[2..]; // Extracts "VAR_NAME" from "_.VAR_NAME"
            let new_var = vars
                .get(var_name)
                .cloned()
                .unwrap_or_else(|| full_match.to_string());

            new_var
        } else {
            "".to_string()
        }
    })
    .to_string()
}

pub fn variables_to_hashmap(code: &str) -> HashMap<String, String> {
    let mut vars = HashMap::new();
    let valid_json_str: Value = serde_json::from_str(code).expect("Failed to parse JSON");

    let obj = valid_json_str.as_object().unwrap();

    for (key, value) in obj {
        let trimmed_value = value.to_string().trim_matches('"').to_string();
        vars.insert(key.clone(), trimmed_value);
    }

    vars
}
