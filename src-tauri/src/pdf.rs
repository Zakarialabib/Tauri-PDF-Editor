use lopdf::Document;
use serde::{Deserialize, Serialize};
use std::path::Path;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum PdfError {
    #[error("Failed to open PDF file: {0}")]
    OpenError(String),
    #[error("Failed to parse PDF: {0}")]
    ParseError(String),
    #[error("Invalid PDF structure: {0}")]
    InvalidStructure(String),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PdfPageInfo {
    pub width: f64,
    pub height: f64,
    pub rotation: i32,
    pub index: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PdfMetadata {
    pub title: Option<String>,
    pub author: Option<String>,
    pub subject: Option<String>,
    pub keywords: Option<String>,
    pub creator: Option<String>,
    pub producer: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PdfFormField {
    pub name: String,
    pub field_type: String,
    pub value: Option<String>,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub page: u32,
}

impl PdfDocument {
    pub fn open<P: AsRef<Path>>(path: P) -> Result<Self, PdfError> {
        let path_str = path.as_ref().to_string_lossy().to_string();
        let doc = Document::load(&path_str).map_err(|e| PdfError::OpenError(e.to_string()))?;

        Ok(Self {
            doc,
            path: path_str,
        })
    }

    pub fn get_page_info(&self, page_number: u32) -> Result<PdfPageInfo, PdfError> {
        let pages = self.doc.get_pages();
        let page = pages
            .get(&page_number)
            .ok_or_else(|| PdfError::InvalidStructure(format!("Page {} not found", page_number)))?;

        let media_box = page
            .get_media_box()
            .map_err(|e| PdfError::ParseError(e.to_string()))?;

        Ok(PdfPageInfo {
            width: media_box.2 - media_box.0,
            height: media_box.3 - media_box.1,
            rotation: page.get_rotate().unwrap_or(0),
            index: page_number,
        })
    }

    pub fn get_metadata(&self) -> PdfMetadata {
        let info = self.doc.get_info();
        PdfMetadata {
            title: info.get("Title").and_then(|v| v.as_str().map(String::from)),
            author: info
                .get("Author")
                .and_then(|v| v.as_str().map(String::from)),
            subject: info
                .get("Subject")
                .and_then(|v| v.as_str().map(String::from)),
            keywords: info
                .get("Keywords")
                .and_then(|v| v.as_str().map(String::from)),
            creator: info
                .get("Creator")
                .and_then(|v| v.as_str().map(String::from)),
            producer: info
                .get("Producer")
                .and_then(|v| v.as_str().map(String::from)),
        }
    }

    pub fn get_total_pages(&self) -> u32 {
        self.doc.get_pages().len() as u32
    }

    pub fn extract_text(&self, page_number: u32) -> Result<String, PdfError> {
        let pages = self.doc.get_pages();
        let page = pages
            .get(&page_number)
            .ok_or_else(|| PdfError::InvalidStructure(format!("Page {} not found", page_number)))?;

        // Extract text content from the page
        let text = page
            .extract_text()
            .map_err(|e| PdfError::ParseError(e.to_string()))?;
        Ok(text)
    }

    pub fn get_form_fields(&self) -> Result<Vec<PdfFormField>, PdfError> {
        let mut fields = Vec::new();
        let form = self.doc.get_form();

        for field in form.fields.iter() {
            if let Some(widget) = field.widgets.first() {
                if let Some(rect) = widget.rect {
                    fields.push(PdfFormField {
                        name: field.name.clone(),
                        field_type: field.field_type.to_string(),
                        value: field
                            .value
                            .as_ref()
                            .and_then(|v| v.as_str().map(String::from)),
                        x: rect.0,
                        y: rect.1,
                        width: rect.2 - rect.0,
                        height: rect.3 - rect.1,
                        page: widget.page,
                    });
                }
            }
        }

        Ok(fields)
    }

    pub fn transform_coordinates(
        &self,
        page_number: u32,
        x: f64,
        y: f64,
    ) -> Result<(f64, f64), PdfError> {
        let page_info = self.get_page_info(page_number)?;
        let rotation = page_info.rotation;

        // Apply rotation transformation
        let (transformed_x, transformed_y) = match rotation {
            90 => (y, page_info.width - x),
            180 => (page_info.width - x, page_info.height - y),
            270 => (page_info.height - y, x),
            _ => (x, y),
        };

        Ok((transformed_x, transformed_y))
    }

    pub fn add_form_field(&mut self, field: PdfFormField) -> Result<(), PdfError> {
        let mut form = self.doc.get_form();

        // Transform coordinates based on page rotation
        let (x, y) = self.transform_coordinates(field.page, field.x, field.y)?;

        // Create a new form field
        let field_dict = lopdf::Dictionary::from_iter(vec![
            ("Type".into(), "Annot".into()),
            ("Subtype".into(), "Widget".into()),
            ("FT".into(), field.field_type.into()),
            ("T".into(), field.name.clone().into()),
            (
                "Rect".into(),
                vec![x, y, x + field.width, y + field.height].into(),
            ),
            ("P".into(), field.page.into()),
        ]);

        form.fields.push(field_dict);
        Ok(())
    }

    pub fn save(&self, path: &str) -> Result<(), PdfError> {
        self.doc
            .save(path)
            .map_err(|e| PdfError::SaveError(e.to_string()))
    }
}
