// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod pdf;
mod fs;
mod commands;

use commands::*;

fn main() {
    // Initialize logger
    env_logger::init();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            open_pdf_dialog,
            parse_pdf,
            save_pdf_dialog,
            save_pdf_file,
            get_file_info,
            create_file_backup,
            file_exists,
            read_file_base64,
            write_file_base64,
            add_form_fields_to_pdf,
            generate_appearance_streams,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
