# Panda - Privacy-Focused, Offline-First API Client

<div align="center">
  <img src="https://github.com/emee-dev/pinpanda/blob/main/src-web/public/landing.png" width="600" height="auto" />
</div>

## Why Another HTTP Client?

Panda is an **open-source**, **offline-first** HTTP client built with **Tauri** for developers who value **privacy** and **local-first** workflows with an incredible developer experience (DX). Designed to keep your data private and under your control, Panda allows you to interact with APIs in the best way possible, with optional support for cloud integrations for additional tools like **vaults** and **observability**. Whether you’re working solo or within a team, Panda provides a streamlined and powerful API testing experience.

---

## Installation | Windows

### Requirements

- Windows 10 (64-bit) or later

### Installation from Installer

Simply download and execute the installer, available on the [releases](https://github.com/emee-dev/pinpanda/releases) page. Currently, there are no official releases, as the project is still in its prototyping phase with ongoing changes. However, you can clone the project and compile it yourself. Refer to the [Tauri v2 documentation](https://v2.tauri.app/) for guidance.

---

### 🚀 Demo

After installing the binary, you can scaffold a demo collection for testing purposes. Be sure to binary path to your PC environment variables.

#### **Step 1: Initialize a Demo Project**

If you're on Windows (or any supported OS), run:

```bash
# Initialize a new project
panda init demo-project
```

#### **Step 2: Launch the Desktop App**

Navigate to the project directory and start the application:

```bash
# Open the project in the desktop app
panda .
```

---

## Key Features

- **TOML Syntax:** Make HTTP requests using TOML, making it easy to read, write, and version control with Git.
- **Low Memory Utilization:** Built with Tauri, ensuring optimal performance and minimal resource consumption.
- **Team Collaboration:** Utilize Git for version control and seamless collaboration.
- **Lightweight & Fast:** Designed to be simple, intuitive, and quick to load.

---

## Developing with Panda

Before you begin, ensure you have installed the necessary tools:

- [Rust & Cargo](https://rustup.rs/)
- [Node.js](https://nodejs.org/en)
- Tauri CLI: `pnpm add -D @tauri-apps/cli`

### Clone the Repository

```sh
git clone https://github.com/emee-dev/pinpanda
```

### CD into directory

```sh
cd pinpanda

```

### Install Dependencies

I recommend `pnpm` but `npm` will work as well.

```sh
# Install pnpm globally
npm install -g pnpm

# Intall dependencies
pnpm install
```

### Run Panda in Development Mode

```sh
pnpm tauri:dev
```

You are now ready to start developing!

---

### Build an executable

Be sure to generate a signing credentials and add to the environment. Read more [Tauri](https://v2.tauri.app/plugin/updater/)

```sh
pnpm tauri:build
```

---

## Note:

- Currently, Panda does not use any platform-specific API and only supports Windows.
- The `src` folder contains the React.js code for the UI, while `src-tauri` contains the Rust backend code.

---

## Roadmap

As Panda is still in beta, several features and improvements are planned. Here’s an overview of upcoming features:

- [x] Request and Response Handling
- [ ] Panda Collections (Folder & File Structure Management)
- [ ] Secret Management
- [ ] Scripting Capabilities
- [ ] Postman Collection Support
- [ ] Insomnia Collection Support
- [ ] GraphQL Support
- [ ] Code Generation
- **Package Distribution:**
  - [ ] Windows Binary
  - [ ] Homebrew Support
  - [ ] Chocolatey Support
- **Authentication:**
  - [ ] Bearer & Basic Authentication
- [ ] OpenAPI 3.0 Imports

---

## TOML Syntax

Panda allows making requests using TOML syntax. Below are some examples:

### GET Requests

```toml
[get]
name = "Get User Info"
url = "_.base_url/users/_.user_id"
```

### POST Requests

```toml
[post]
name = "Create User"
url = "_.base_url/users"

[post.json]
content = """
{
    "userId": "jae",
    "email": "email@gmail.com"
}
"""
```

### Request Bodies

```toml
[get.json]
content = """
{
    "userId": "jae",
    "email": "email@gmail.com"
}
"""

[get.form_data]
content = [
    { field = "file", value = "./path/to/file.txt" },
    { field = "user_name", value = "jet" }
]

[get.form_urlencoded]
content = [
    { field = "title", value = "New Post" },
    { field = "content", value = "This is the content of the new post." },
    { field = "tags", value = "example,post" }
]

[get.xml]
content = """
<post>
  <title>New Post</title>
  <content>This is the content of the new post.</content>
  <tags>
    <tag>example</tag>
    <tag>post</tag>
  </tags>
</post>
"""

[get.text]
content = """
This is a request type of body text. Very concise.
"""
```

### Request Scripts

```toml
[get.pre_request]
code = """
console.log("Hello world.");
"""

[get.post_request]
code = """
console.log("Hello world.");
"""
```

### Query Parameters

```toml
[get.query]
id = "emee"
page = 10
limit = 30
```

### Headers

```toml
[get.headers]
Authorization = "_.auth_token"
Accept = "application/json"
```

**Note:** The syntax is experimental and subject to change based on feasibility, DX, and other factors.

---

## Pricing

The pricing model is still undecided. The plan is to open-source the application while offering licenses for teams and organizations. The sustainability of Worm will rely on team and organization plans. If you have suggestions regarding pricing and licensing, feel free to share your thoughts.

---

## Contributing 💬

Contributions of all kinds are welcome! Whether it's fixing bugs, adding features, sharing feedback, starring the repo, or improving documentation, feel free to open an issue or submit a pull request.

Thank you for your support! 🚀

---

## Support My Work ☕

If you find Panda useful, consider supporting my work:

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/emee_dev)

---

## Connect with Me 🌐

- **X (formerly Twitter):** [@_\_\_emee_](https://x.com/___emee_)
