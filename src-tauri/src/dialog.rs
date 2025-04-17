use std::path::PathBuf;
use tauri_plugin_dialog::{DialogBuilder, MessageDialogKind, MessageDialogButtons};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct DialogResult {
    pub path: Option<String>,
    pub canceled: bool,
}

pub async fn show_open_dialog() -> DialogResult {
    let result = DialogBuilder::new()
        .set_title("Open PDF File")
        .add_filter("PDF Files", &["pdf"])
        .pick_file();
    
    DialogResult {
        path: result.map(|path| path.to_string_lossy().to_string()),
        canceled: result.is_none(),
    }
}

pub async fn show_save_dialog(default_path: Option<&str>) -> DialogResult {
    let mut builder = DialogBuilder::new()
        .set_title("Save PDF File")
        .add_filter("PDF Files", &["pdf"]);
    
    if let Some(path) = default_path {
        builder = builder.set_default_path(path);
    }
    
    let result = builder.save_file();
    
    DialogResult {
        path: result.map(|path| path.to_string_lossy().to_string()),
        canceled: result.is_none(),
    }
}

pub async fn show_overwrite_confirmation(path: &str) -> bool {
    DialogBuilder::new()
        .message_dialog()
        .set_title("Confirm Overwrite")
        .set_message(&format!("The file '{}' already exists. Do you want to overwrite it?", path))
        .set_buttons(MessageDialogButtons::YesNo)
        .show()
        .unwrap_or(false)
}

pub async fn show_error(title: &str, message: &str) {
    DialogBuilder::new()
        .message_dialog()
        .set_title(title)
        .set_message(message)
        .set_kind(MessageDialogKind::Error)
        .show();
}