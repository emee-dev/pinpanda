use crate::utils::PandaCollection;
use std::fs::{self, File};
use std::io::Write;
use std::path::Path;

pub fn create_collection(collections: &Vec<PandaCollection>, parent_path: &Path) {
    for item in collections {
        let item_path = parent_path.join(&item.name); // Use `name` instead of `path`

        if item.item_type == "folder" {
            // Ensure the directory exists
            fs::create_dir_all(&item_path).expect("Failed to create directory");

            if let Some(children) = &item.children {
                create_collection(children, &item_path);
            }
        } else {
            // Ensure the parent directory exists before creating the file
            if let Some(parent) = item_path.parent() {
                fs::create_dir_all(parent).expect("Failed to create parent directory");
            }

            let mut file = File::create(&item_path).expect("Failed to create file");
            if let Some(content) = &item.content {
                file.write_all(content.as_bytes())
                    .expect("Failed to write file");
            }
        }
    }
}

// pub fn get_demo_collection() -> Vec<PandaCollection> {
//     let collection = vec![PandaCollection {
//         id: "1".to_string(),
//         name: "collection".to_string(),
//         path: "collection".to_string(),
//         content: None,
//         children: Some(vec![
//             PandaCollection {
//                 id: "2".to_string(),
//                 name: "get_products.toml".to_string(),
//                 path: "get_products.toml".to_string(),
//                 content: Some("[get]\nurl = \"https://fakestoreapi.com/products\"".to_string()),
//                 children: None,
//                 is_selectable: true,
//                 item_type: "file".to_string(),
//             },
//             PandaCollection {
//                 id: "3".to_string(),
//                 name: "get_user.toml".to_string(),
//                 path: "get_user.toml".to_string(),
//                 content: Some(
//                     "[get]\nurl = \"https://jsonplaceholder.typicode.com/users/1\"".to_string(),
//                 ),
//                 children: None,
//                 is_selectable: true,
//                 item_type: "file".to_string(),
//             },
//             PandaCollection {
//                 id: "4".to_string(),
//                 name: "transactions".to_string(),
//                 path: "transactions".to_string(),
//                 content: None,
//                 children: Some(vec![
//                     PandaCollection {
//                         id: "5".to_string(),
//                         name: "delete_transactions.toml".to_string(),
//                         path: "transactions/delete_transactions.toml".to_string(),
//                         content: Some(
//                             "[delete]\nurl = \"https://jsonplaceholder.typicode.com/posts/1\""
//                                 .to_string(),
//                         ),
//                         children: None,
//                         is_selectable: true,
//                         item_type: "file".to_string(),
//                     },
//                     PandaCollection {
//                         id: "6".to_string(),
//                         name: "get_transactions.toml".to_string(),
//                         path: "transactions/get_transactions.toml".to_string(),
//                         content: Some(
//                             "[get]\nurl = \"https://jsonplaceholder.typicode.com/posts\""
//                                 .to_string(),
//                         ),
//                         children: None,
//                         is_selectable: true,
//                         item_type: "file".to_string(),
//                     },
//                 ]),
//                 is_selectable: false,
//                 item_type: "folder".to_string(),
//             },
//         ]),
//         is_selectable: false,
//         item_type: "folder".to_string(),
//     }];

//     collection
// }

pub fn get_demo_collection() -> Vec<PandaCollection> {
    let collection = vec![PandaCollection {
        id: "1".to_string(),
        name: "collection".to_string(),
        path: "collection".to_string(),
        content: None,
        children: Some(vec![
            PandaCollection {
                id: "2".to_string(),
                name: "get_products.toml".to_string(),
                path: "get_products.toml".to_string(),
                content: Some(
                    r#"[get]
url = "https://fakestoreapi.com/products"

[get.query]
limit = 20
page = 1

[get.headers]
Authorization = "Bearer _.auth_token"
Accept = "application/json"
"#
                    .to_string(),
                ),
                children: None,
                is_selectable: true,
                item_type: "file".to_string(),
            },
            PandaCollection {
                id: "3".to_string(),
                name: "get_user.toml".to_string(),
                path: "get_user.toml".to_string(),
                content: Some(
                    r#"[get]
url = "https://jsonplaceholder.typicode.com/users/1"

[get.headers]
Authorization = "Bearer _.auth_token"
Accept = "application/json"
"#
                    .to_string(),
                ),
                children: None,
                is_selectable: true,
                item_type: "file".to_string(),
            },
            PandaCollection {
                id: "4".to_string(),
                name: "transactions".to_string(),
                path: "transactions".to_string(),
                content: None,
                children: Some(vec![
                    PandaCollection {
                        id: "5".to_string(),
                        name: "delete_transactions.toml".to_string(),
                        path: "transactions/delete_transactions.toml".to_string(),
                        content: Some(
                            r#"[delete]
url = "https://jsonplaceholder.typicode.com/posts/1"

[delete.headers]
Authorization = "Bearer _.auth_token"
Accept = "application/json"
"#
                            .to_string(),
                        ),
                        children: None,
                        is_selectable: true,
                        item_type: "file".to_string(),
                    },
                    PandaCollection {
                        id: "6".to_string(),
                        name: "get_transactions.toml".to_string(),
                        path: "transactions/get_transactions.toml".to_string(),
                        content: Some(
                            r#"[get]
url = "https://jsonplaceholder.typicode.com/posts"

[get.query]
userId = "1234"

[get.headers]
Authorization = "Bearer _.auth_token"
Accept = "application/json"
"#
                            .to_string(),
                        ),
                        children: None,
                        is_selectable: true,
                        item_type: "file".to_string(),
                    },
                    PandaCollection {
                        id: "7".to_string(),
                        name: "create_transaction.toml".to_string(),
                        path: "transactions/create_transaction.toml".to_string(),
                        content: Some(
                            r#"[post]
url = "https://jsonplaceholder.typicode.com/posts"

[post.json]
content = """
{
    "userId": "jae",
    "amount": 500.75,
    "currency": "USD",
    "description": "Payment for services"
}
"""

[post.headers]
Authorization = "Bearer _.auth_token"
Content-Type = "application/json"
"#
                            .to_string(),
                        ),
                        children: None,
                        is_selectable: true,
                        item_type: "file".to_string(),
                    },
                ]),
                is_selectable: false,
                item_type: "folder".to_string(),
            },
            PandaCollection {
                id: "8".to_string(),
                name: "delayed_request.toml".to_string(),
                path: "delayed_request.toml".to_string(),
                content: Some(
                    r#"[get]
url = "https://httpbin.org/delay/5"

[get.headers]
Authorization = "Bearer _.auth_token"
Accept = "application/json"
    "#
                    .to_string(),
                ),
                children: None,
                is_selectable: true,
                item_type: "file".to_string(),
            },
        ]),
        is_selectable: false,
        item_type: "folder".to_string(),
    }];

    collection
}
