use std::path::{Path, PathBuf};
use std::fs;
use serde::{Serialize, Deserialize};
use tauri::api::dialog;
use tempfile::NamedTempFile;
use thiserror::Error;

/// Error types for file system operations
#[derive(Error, Debug)]
pub enum FsError {
    #[error("Failed to read file: {0}")]
    ReadError(#[from] std::io::Error),
    
    #[error("Failed to write file: {0}")]
    WriteError(String),
    
    #[error("File not found: {0}")]
    NotFound(String),
    
    #[error("Permission denied: {0}")]
    PermissionDenied(String),
    
    #[error("Operation cancelled by user")]
    Cancelled,
}

/// Result type for file system operations
pub type Result<T> = std::result::Result<T, FsError>;

/// Represents a file with its metadata
#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfo {
    pub path: String,
    pub name: String,
    pub size: u64,
    pub last_modified: Option<String>,
}

/// File system operations implementation
pub struct FileSystem;

impl FileSystem {
    /// Read a file as bytes
    pub fn read_file<P: AsRef<Path>>(path: P) -> Result<Vec<u8>> {
        fs::read(path).map_err(FsError::ReadError)
    }
    
    /// Write bytes to a file
    pub fn write_file<P: AsRef<Path>>(path: P, data: &[u8]) -> Result<()> {
        fs::write(path, data).map_err(|e| FsError::WriteError(e.to_string()))
    }
    
    /// Create a temporary file
    pub fn create_temp_file() -> Result<PathBuf> {
        let temp_file = NamedTempFile::new().map_err(FsError::ReadError)?;
        let path = temp_file.path().to_path_buf();
        // Keep the file on disk by leaking the tempfile
        std::mem::forget(temp_file);
        Ok(path)
    }
    
    /// Get file information
    pub fn get_file_info<P: AsRef<Path>>(path: P) -> Result<FileInfo> {
        let path_ref = path.as_ref();
        let metadata = fs::metadata(path_ref).map_err(FsError::ReadError)?;
        
        let name = path_ref
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("Unknown")
            .to_string();
            
        let last_modified = metadata
            .modified()
            .ok()
            .map(|time| {
                time.duration_since(std::time::UNIX_EPOCH)
                    .map(|d| d.as_secs().to_string())
                    .unwrap_or_else(|_| "Unknown".to_string())
            });
            
        Ok(FileInfo {
            path: path_ref.to_string_lossy().to_string(),
            name,
            size: metadata.len(),
            last_modified,
        })
    }
    
    /// Check if a file exists
    pub fn file_exists<P: AsRef<Path>>(path: P) -> bool {
        path.as_ref().exists()
    }
    
    /// Create a backup of a file
    pub fn create_backup<P: AsRef<Path>>(path: P) -> Result<PathBuf> {
        let path_ref = path.as_ref();
        if !path_ref.exists() {
            return Err(FsError::NotFound(path_ref.to_string_lossy().to_string()));
        }
        
        let file_name = path_ref
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown");
            
        let parent = path_ref.parent().unwrap_or(Path::new("."));
        let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
        let backup_name = format!("{}.{}.bak", file_name, timestamp);
        let backup_path = parent.join(backup_name);
        
        fs::copy(path_ref, &backup_path).map_err(FsError::ReadError)?;
        
        Ok(backup_path)
    }
} 