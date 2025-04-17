mod commands;
mod fs;
mod pdf;

use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            open_pdf,
            get_page_info,
            get_total_pages,
            get_recent_files,
            save_pdf
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
