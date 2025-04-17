use crate::fs::{FileInfo, FileSystem, FileSystemError, SaveOptions};
use crate::pdf::{PdfDocument, PdfError, PdfFormField, PdfMetadata, PdfParser, FormFieldGenerator};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri_plugin_dialog as dialog;
use std::sync::Arc;
use tokio::sync::Mutex;
use std::collections::HashMap;

/// Error response for commands
#[derive(Debug, Serialize)]
pub struct CommandError {
    pub code: String,
    pub message: String,
}

impl From<PdfError> for CommandError {
    fn from(err: PdfError) -> Self {
        CommandError {
            code: "PDF_ERROR".to_string(),
            message: err.to_string(),
        }
    }
}

impl From<FileSystemError> for CommandError {
    fn from(error: FileSystemError) -> Self {
        Self {
            code: "FS_ERROR".to_string(),
            message: error.to_string(),
        }
    }
}

impl From<std::io::Error> for CommandError {
    fn from(err: std::io::Error) -> Self {
        CommandError {
            code: "IO_ERROR".to_string(),
            message: err.to_string(),
        }
    }
}

#[tauri::command]
pub async fn open_pdf(path: String) -> Result<PdfMetadata, CommandError> {
    let mut fs = FileSystem::new();
    let path_buf = PathBuf::from(&path);

    // Create a temporary copy for editing
    let temp_path = fs.create_temp_file("pdf")?;
    std::fs::copy(&path_buf, &temp_path).map_err(|e| FileSystemError::OpenError(e.to_string()))?;

    let doc = PdfDocument::open(path.clone())?;
    fs.add_recent_file(path_buf);
    Ok(doc.get_metadata())
}

#[tauri::command]
pub async fn get_page_info(path: String, page_number: u32) -> Result<PdfPageInfo, CommandError> {
    let doc = PdfDocument::open(path)?;
    Ok(doc.get_page_info(page_number)?)
}

#[tauri::command]
pub async fn get_total_pages(path: String) -> Result<u32, CommandError> {
    let doc = PdfDocument::open(path)?;
    Ok(doc.get_total_pages())
}

#[tauri::command]
pub async fn get_form_fields(path: String) -> Result<Vec<PdfFormField>, CommandError> {
    let doc = PdfDocument::open(path)?;
    Ok(doc.get_form_fields()?)
}

#[tauri::command]
pub async fn add_form_field(path: String, field: PdfFormField) -> Result<(), CommandError> {
    let mut doc = PdfDocument::open(path.clone())?;
    doc.add_form_field(field)?;
    doc.save(&path)?;
    Ok(())
}

#[tauri::command]
pub async fn get_recent_files() -> Result<Vec<FileInfo>, CommandError> {
    let fs = FileSystem::new();
    Ok(fs.get_recent_files())
}

#[tauri::command]
pub async fn show_open_dialog() -> Result<DialogResult, CommandError> {
    Ok(crate::dialog::show_open_dialog().await)
}

#[tauri::command]
pub async fn show_save_dialog(default_path: Option<String>) -> Result<DialogResult, CommandError> {
    let fs = FileSystem::new();
    Ok(crate::dialog::show_save_dialog(default_path.as_deref()).await)
}

#[tauri::command]
pub async fn save_pdf(
    path: String,
    content: Vec<u8>,
    options: SaveOptions,
) -> Result<(), CommandError> {
    let fs = FileSystem::new();
    let path = PathBuf::from(path);

    // Check if file exists and needs confirmation
    if !options.overwrite && path.exists() {
        if !crate::dialog::show_overwrite_confirmation(&path.to_string_lossy()).await {
            return Ok(());
        }
    }

    fs.save_file(&path, &content, &options)?;
    fs.add_recent_file(path);
    Ok(())
}

#[tauri::command]
pub async fn extract_text(path: String, page_number: u32) -> Result<String, CommandError> {
    let doc = PdfDocument::open(path)?;
    Ok(doc.extract_text(page_number)?)
}

#[tauri::command]
pub async fn transform_coordinates(
    path: String,
    page_number: u32,
    x: f64,
    y: f64,
) -> Result<(f64, f64), CommandError> {
    let doc = PdfDocument::open(path)?;
    Ok(doc.transform_coordinates(page_number, x, y)?)
}

#[tauri::command]
pub async fn create_backup(path: String) -> Result<String, CommandError> {
    let fs = FileSystem::new();
    let original_path = PathBuf::from(path);
    let backup_path = fs.create_backup_path(&original_path);
    fs.write_file(
        &backup_path,
        &fs.read_file(&original_path)?,
        &SaveOptions {
            create_backup: false,
            overwrite: true,
        },
    )?;
    Ok(backup_path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn export_form_data(path: String, format: String) -> Result<String, CommandError> {
    let doc = PdfDocument::open(path)?;
    let fields = doc.get_form_fields()?;

    match format.as_str() {
        "json" => serde_json::to_string(&fields).map_err(|e| CommandError {
            code: "SERIALIZATION_ERROR".to_string(),
            message: e.to_string(),
        }),
        "csv" => {
            let mut output = String::from("name,type,value,x,y,width,height,page\n");
            for field in fields {
                output.push_str(&format!(
                    "{},{},{},{},{},{},{},{}\n",
                    field.name,
                    field.field_type,
                    field.value.unwrap_or_default(),
                    field.x,
                    field.y,
                    field.width,
                    field.height,
                    field.page
                ));
            }
            Ok(output)
        }
        _ => Err(CommandError {
            code: "INVALID_FORMAT_ERROR".to_string(),
            message: format!("Unsupported export format: {}", format),
        }),
    }
}

/// Open a PDF file using the system dialog
#[tauri::command]
pub async fn open_pdf_dialog() -> Result<Option<String>, CommandError> {
    let file_path = dialog::blocking::FileDialogBuilder::new()
        .add_filter("PDF Files", &["pdf"])
        .pick_file();
        
    Ok(file_path.map(|path| path.to_string_lossy().to_string()))
}

/// Parse a PDF file and return its structure
#[tauri::command]
pub async fn parse_pdf(path: String) -> Result<PdfDocument, CommandError> {
    let document = PdfParser::open(path)?;
    Ok(document)
}

/// Save a PDF file using the system dialog
#[tauri::command]
pub async fn save_pdf_dialog(default_path: Option<String>) -> Result<Option<String>, CommandError> {
    let file_path = dialog::blocking::FileDialogBuilder::new()
        .add_filter("PDF Files", &["pdf"])
        .set_file_name(default_path.unwrap_or_else(|| "document.pdf".to_string()))
        .save_file();
        
    Ok(file_path.map(|path| path.to_string_lossy().to_string()))
}

/// Save PDF data to a file
#[tauri::command]
pub async fn save_pdf_file(path: String, data: Vec<u8>) -> Result<(), CommandError> {
    FileSystem::write_file(path, &data)?;
    Ok(())
}

/// Get file information
#[tauri::command]
pub async fn get_file_info(path: String) -> Result<FileInfo, CommandError> {
    let info = FileSystem::get_file_info(path)?;
    Ok(info)
}

/// Create a backup of a file
#[tauri::command]
pub async fn create_file_backup(path: String) -> Result<String, CommandError> {
    let backup_path = FileSystem::create_backup(path)?;
    Ok(backup_path.to_string_lossy().to_string())
}

/// Check if a file exists
#[tauri::command]
pub async fn file_exists(path: String) -> Result<bool, CommandError> {
    Ok(FileSystem::file_exists(path))
}

/// Read a file as base64
#[tauri::command]
pub async fn read_file_base64(path: String) -> Result<String, CommandError> {
    let data = FileSystem::read_file(path)?;
    let encoded = base64::encode(data);
    Ok(encoded)
}

/// Write base64 data to a file
#[tauri::command]
pub async fn write_file_base64(path: String, data: String) -> Result<(), CommandError> {
    let decoded = base64::decode(data).map_err(|e| CommandError {
        code: "DECODE_ERROR".to_string(),
        message: e.to_string(),
    })?;
    
    FileSystem::write_file(path, &decoded)?;
    Ok(())
}

/// Add form fields to a PDF document
#[tauri::command]
pub async fn add_form_fields_to_pdf(
    pdf_path: String,
    fields: Vec<PdfFormField>,
    output_path: String,
) -> Result<(), CommandError> {
    // Add form fields to the PDF
    FormFieldGenerator::add_form_fields_to_pdf(pdf_path, fields, output_path)?;
    
    Ok(())
}

/// Generate appearance streams for form fields in a PDF
#[tauri::command]
pub async fn generate_appearance_streams(
    pdf_path: String,
    output_path: String,
) -> Result<(), CommandError> {
    // Generate appearance streams
    FormFieldGenerator::generate_appearance_streams(pdf_path, output_path)?;
    
    Ok(())
}
