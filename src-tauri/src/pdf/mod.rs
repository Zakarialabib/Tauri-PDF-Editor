use lopdf::{Document, Object, Dictionary, Stream};
use serde::{Serialize, Deserialize};
use std::path::Path;
use std::collections::HashMap;
use thiserror::Error;

// Include the form module
pub mod form;
pub use form::{PdfFormField, FormFieldGenerator};

/// Error types for PDF operations
#[derive(Error, Debug)]
pub enum PdfError {
    #[error("Failed to open PDF file: {0}")]
    OpenError(#[from] lopdf::Error),
    
    #[error("Failed to read file: {0}")]
    IoError(#[from] std::io::Error),
    
    #[error("Invalid page number: {0}")]
    InvalidPage(u32),
    
    #[error("Malformed PDF structure: {0}")]
    MalformedPdf(String),
    
    #[error("Unsupported operation: {0}")]
    UnsupportedOperation(String),
}

/// Result type for PDF operations
pub type Result<T> = std::result::Result<T, PdfError>;

/// Represents a PDF page with its dimensions and content
#[derive(Debug, Serialize, Deserialize)]
pub struct PdfPage {
    pub index: u32,
    pub width: f64,
    pub height: f64,
    pub rotation: i64,
}

/// Represents a PDF document with its metadata and pages
#[derive(Debug, Serialize, Deserialize)]
pub struct PdfDocument {
    pub path: String,
    pub page_count: u32,
    pub pages: Vec<PdfPage>,
    pub metadata: PdfMetadata,
}

/// Metadata for a PDF document
#[derive(Debug, Serialize, Deserialize)]
pub struct PdfMetadata {
    pub title: Option<String>,
    pub author: Option<String>,
    pub subject: Option<String>,
    pub keywords: Option<String>,
    pub creator: Option<String>,
    pub producer: Option<String>,
    pub creation_date: Option<String>,
    pub modification_date: Option<String>,
}

/// PDF parser implementation
pub struct PdfParser;

impl PdfParser {
    /// Open and parse a PDF file
    pub fn open<P: AsRef<Path>>(path: P) -> Result<PdfDocument> {
        let path_str = path.as_ref().to_string_lossy().to_string();
        let document = Document::load(path.as_ref())?;
        
        // Extract metadata
        let metadata = Self::extract_metadata(&document);
        
        // Extract pages
        let page_count = document.get_pages().len() as u32;
        let mut pages = Vec::with_capacity(page_count as usize);
        
        for (i, (page_id, _)) in document.get_pages().iter().enumerate() {
            let page_dict = document.get_dictionary(*page_id)?;
            let page = Self::extract_page_info(page_dict, i as u32)?;
            pages.push(page);
        }
        
        Ok(PdfDocument {
            path: path_str,
            page_count,
            pages,
            metadata,
        })
    }
    
    /// Extract page information from a page dictionary
    fn extract_page_info(page_dict: &Dictionary, index: u32) -> Result<PdfPage> {
        // Get page dimensions
        let media_box = page_dict.get(b"MediaBox")
            .and_then(|obj| obj.as_array())
            .ok_or_else(|| PdfError::MalformedPdf("Missing MediaBox".to_string()))?;
        
        if media_box.len() != 4 {
            return Err(PdfError::MalformedPdf("Invalid MediaBox format".to_string()));
        }
        
        let x1 = media_box[0].as_f64().unwrap_or(0.0);
        let y1 = media_box[1].as_f64().unwrap_or(0.0);
        let x2 = media_box[2].as_f64().unwrap_or(0.0);
        let y2 = media_box[3].as_f64().unwrap_or(0.0);
        
        let width = x2 - x1;
        let height = y2 - y1;
        
        // Get page rotation
        let rotation = page_dict.get(b"Rotate")
            .and_then(|obj| obj.as_i64())
            .unwrap_or(0);
        
        Ok(PdfPage {
            index,
            width,
            height,
            rotation,
        })
    }
    
    /// Extract metadata from a PDF document
    fn extract_metadata(document: &Document) -> PdfMetadata {
        let info = document.trailer.get(b"Info")
            .and_then(|obj| obj.as_reference())
            .and_then(|id| document.get_object(id).ok())
            .and_then(|obj| obj.as_dict().ok())
            .unwrap_or(&Dictionary::new());
        
        let extract_text = |key: &[u8]| {
            info.get(key)
                .and_then(|obj| obj.as_str().ok())
                .map(|s| s.to_string())
        };
        
        PdfMetadata {
            title: extract_text(b"Title"),
            author: extract_text(b"Author"),
            subject: extract_text(b"Subject"),
            keywords: extract_text(b"Keywords"),
            creator: extract_text(b"Creator"),
            producer: extract_text(b"Producer"),
            creation_date: extract_text(b"CreationDate"),
            modification_date: extract_text(b"ModDate"),
        }
    }
    
    /// Extract existing form fields from a PDF document
    pub fn extract_form_fields(document: &Document) -> HashMap<String, String> {
        let mut fields = HashMap::new();
        
        // Try to get the form root
        if let Some(acro_form) = document.trailer
            .get(b"Root")
            .and_then(|obj| obj.as_reference())
            .and_then(|id| document.get_object(id).ok())
            .and_then(|obj| obj.as_dict().ok())
            .and_then(|root| root.get(b"AcroForm"))
            .and_then(|obj| obj.as_reference())
            .and_then(|id| document.get_object(id).ok())
            .and_then(|obj| obj.as_dict().ok()) {
                
            // Extract fields from the AcroForm dictionary
            if let Some(fields_array) = acro_form.get(b"Fields")
                .and_then(|obj| obj.as_array().ok()) {
                
                for field_ref in fields_array {
                    if let Some(field_id) = field_ref.as_reference() {
                        if let Ok(field_obj) = document.get_object(field_id) {
                            if let Ok(field_dict) = field_obj.as_dict() {
                                // Extract field name
                                if let Some(name) = field_dict.get(b"T")
                                    .and_then(|obj| obj.as_str().ok()) {
                                    
                                    // Extract field value
                                    let value = field_dict.get(b"V")
                                        .and_then(|obj| match obj {
                                            Object::String(bytes, _) => Some(String::from_utf8_lossy(bytes).to_string()),
                                            Object::Name(name) => Some(String::from_utf8_lossy(name).to_string()),
                                            _ => None,
                                        })
                                        .unwrap_or_default();
                                    
                                    fields.insert(name.to_string(), value);
                                }
                            }
                        }
                    }
                }
            }
        }
        
        fields
    }
} 