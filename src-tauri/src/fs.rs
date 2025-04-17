use crate::dialog;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum FileSystemError {
    #[error("Failed to open file: {0}")]
    #[error("Failed to open file: {0}")]
    OpenError(String),
    #[error("Failed to save file: {0}")]
    SaveError(String),
    #[error("Permission denied: {0}")]
    PermissionError(String),
    #[error("File not found: {0}")]
    NotFoundError(String),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfo {
    pub path: String,
    pub name: String,
    pub size: u64,
    pub last_modified: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SaveOptions {
    pub create_backup: bool,
    pub overwrite: bool,
}

pub struct FileSystem {
    recent_files: Vec<PathBuf>,
    temp_dir: Option<PathBuf>,
    temp_files: Vec<PathBuf>,
}

impl FileSystem {
    pub fn new() -> Self {
        Self {
            recent_files: Vec::new(),
            temp_dir: None,
            temp_files: Vec::new(),
        }
    }

    pub async fn open_file_dialog() -> Result<Option<PathBuf>, FileSystemError> {
        let result = dialog::show_open_dialog().await;
        Ok(result.path.map(PathBuf::from))
    }

    pub async fn save_file_dialog(
        &self,
        default_path: Option<&str>,
    ) -> Result<Option<PathBuf>, FileSystemError> {
        let result = dialog::show_save_dialog(default_path).await;
        Ok(result.path.map(PathBuf::from))
    }

    pub fn create_temp_file(&mut self, extension: &str) -> Result<PathBuf, FileSystemError> {
        let temp_dir = self.init_temp_dir()?;
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        let temp_file = temp_dir.join(format!("temp_{}.{}", timestamp, extension));
        self.temp_files.push(temp_file.clone());
        Ok(temp_file)
    }

    pub fn add_recent_file(&mut self, path: PathBuf) {
        if !self.recent_files.contains(&path) {
            self.recent_files.push(path);
            if self.recent_files.len() > 10 {
                self.recent_files.remove(0);
            }
        }
    }

    pub fn get_recent_files(&self) -> Vec<FileInfo> {
        self.recent_files
            .iter()
            .filter_map(|path| self.get_file_info(path))
            .collect()
    }

    pub fn get_file_info(&self, path: &PathBuf) -> Option<FileInfo> {
        let metadata = fs::metadata(path).ok()?;
        let name = path.file_name()?.to_string_lossy().into_owned();
        let last_modified = metadata
            .modified()
            .ok()?
            .duration_since(UNIX_EPOCH)
            .ok()?
            .as_secs();

        Some(FileInfo {
            path: path.to_string_lossy().into_owned(),
            name,
            size: metadata.len(),
            last_modified,
        })
    }

    pub fn create_backup(&self, path: &PathBuf) -> Result<PathBuf, FileSystemError> {
        let backup_path = path.with_extension("bak");
        fs::copy(path, &backup_path).map_err(|e| FileSystemError::SaveError(e.to_string()))?;
        Ok(backup_path)
    }

    pub fn save_file(
        &self,
        path: &PathBuf,
        content: &[u8],
        options: &SaveOptions,
    ) -> Result<(), FileSystemError> {
        if options.create_backup && path.exists() {
            self.create_backup(path)?;
        }

        if !options.overwrite && path.exists() {
            return Err(FileSystemError::SaveError(
                "File already exists".to_string(),
            ));
        }

        fs::write(path, content).map_err(|e| FileSystemError::SaveError(e.to_string()))
    }

    pub fn init_temp_dir(&mut self) -> Result<PathBuf, FileSystemError> {
        let temp_dir = std::env::temp_dir().join("pdf-form-editor");
        fs::create_dir_all(&temp_dir).map_err(|e| FileSystemError::SaveError(e.to_string()))?;
        self.temp_dir = Some(temp_dir.clone());
        Ok(temp_dir)
    }

    pub fn cleanup_temp_dir(&self) -> Result<(), FileSystemError> {
        if let Some(temp_dir) = &self.temp_dir {
            if temp_dir.exists() {
                fs::remove_dir_all(temp_dir)
                    .map_err(|e| FileSystemError::SaveError(e.to_string()))?;
            }
        }
        Ok(())
    }
    
    pub fn cleanup_temp_files(&self) -> Result<(), FileSystemError> {
        for temp_file in &self.temp_files {
            if temp_file.exists() {
                fs::remove_file(temp_file)
                    .map_err(|e| FileSystemError::SaveError(e.to_string()))?;
            }
        }
        Ok(())
    }
}

impl Drop for FileSystem {
    fn drop(&mut self) {
        let _ = self.cleanup_temp_files();
    }
}
