use lopdf::{Document, Object, Dictionary, Stream, ObjectId, StringFormat};
use std::collections::HashMap;
use serde::{Serialize, Deserialize};
use std::path::Path;
use std::fs;
use crate::pdf::{PdfError, Result};

/// Represents a PDF form field with its properties
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PdfFormField {
    pub id: String,
    pub name: String,
    pub field_type: String,
    pub value: Option<String>,
    pub rect: [f64; 4],
    pub page: u32,
    pub properties: HashMap<String, String>,
}

/// Form field generator for PDF documents
pub struct FormFieldGenerator;

impl FormFieldGenerator {
    /// Add form fields to an existing PDF document
    pub fn add_form_fields_to_pdf<P: AsRef<Path>>(
        pdf_path: P, 
        fields: Vec<PdfFormField>,
        output_path: P
    ) -> Result<()> {
        // Load the PDF document
        let mut document = Document::load(pdf_path.as_ref())?;
        
        // Create or get the AcroForm dictionary
        let acro_form_id = Self::ensure_acro_form(&mut document)?;
        
        // Add each field to the document
        for field in fields {
            Self::add_field_to_document(&mut document, field, acro_form_id)?;
        }
        
        // Save the modified document
        document.save(output_path.as_ref())?;
        
        Ok(())
    }
    
    /// Ensure the document has an AcroForm dictionary
    fn ensure_acro_form(document: &mut Document) -> Result<ObjectId> {
        // Check if the document already has an AcroForm
        let root_id = document.trailer.get(b"Root")
            .and_then(|obj| obj.as_reference())
            .ok_or_else(|| PdfError::MalformedPdf("Missing Root dictionary".to_string()))?;
            
        let root_dict = document.get_dictionary(root_id)?;
        
        // If AcroForm exists, return its ID
        if let Some(acro_form) = root_dict.get(b"AcroForm").and_then(|obj| obj.as_reference()) {
            return Ok(acro_form);
        }
        
        // Create a new AcroForm dictionary
        let mut acro_form_dict = Dictionary::new();
        acro_form_dict.set("Fields", Object::Array(vec![]));
        acro_form_dict.set("NeedAppearances", Object::Boolean(true));
        acro_form_dict.set("SigFlags", Object::Integer(0));
        
        // Add standard font resources
        let mut dr_dict = Dictionary::new();
        let mut font_dict = Dictionary::new();
        
        // Add Helvetica font
        let mut helvetica_dict = Dictionary::new();
        helvetica_dict.set("Type", Object::Name("Font".as_bytes().to_vec()));
        helvetica_dict.set("Subtype", Object::Name("Type1".as_bytes().to_vec()));
        helvetica_dict.set("BaseFont", Object::Name("Helvetica".as_bytes().to_vec()));
        helvetica_dict.set("Encoding", Object::Name("WinAnsiEncoding".as_bytes().to_vec()));
        
        let helvetica_id = document.add_object(Object::Dictionary(helvetica_dict));
        font_dict.set("Helv", Object::Reference(helvetica_id));
        
        // Add ZapfDingbats font for checkboxes
        let mut zapf_dict = Dictionary::new();
        zapf_dict.set("Type", Object::Name("Font".as_bytes().to_vec()));
        zapf_dict.set("Subtype", Object::Name("Type1".as_bytes().to_vec()));
        zapf_dict.set("BaseFont", Object::Name("ZapfDingbats".as_bytes().to_vec()));
        
        let zapf_id = document.add_object(Object::Dictionary(zapf_dict));
        font_dict.set("ZaDb", Object::Reference(zapf_id));
        
        dr_dict.set("Font", Object::Dictionary(font_dict));
        acro_form_dict.set("DR", Object::Dictionary(dr_dict));
        
        // Add the AcroForm to the document
        let acro_form_id = document.add_object(Object::Dictionary(acro_form_dict));
        
        // Update the root dictionary
        let mut root = document.get_dictionary_mut(root_id)?;
        root.set("AcroForm", Object::Reference(acro_form_id));
        
        Ok(acro_form_id)
    }
    
    /// Add a field to the document
    fn add_field_to_document(
        document: &mut Document, 
        field: PdfFormField, 
        acro_form_id: ObjectId
    ) -> Result<ObjectId> {
        // Create the field dictionary
        let mut field_dict = Dictionary::new();
        
        // Set common properties
        field_dict.set("T", Object::String(field.name.as_bytes().to_vec(), StringFormat::Literal));
        field_dict.set("Type", Object::Name("Annot".as_bytes().to_vec()));
        field_dict.set("Subtype", Object::Name("Widget".as_bytes().to_vec()));
        
        // Set the field type
        match field.field_type.as_str() {
            "text" => {
                field_dict.set("FT", Object::Name("Tx".as_bytes().to_vec()));
                
                // Set text field properties
                if let Some(value) = field.value {
                    field_dict.set("V", Object::String(value.as_bytes().to_vec(), StringFormat::Literal));
                }
                
                // Set additional properties
                if let Some(max_length) = field.properties.get("maxLength") {
                    if let Ok(max_len) = max_length.parse::<i64>() {
                        field_dict.set("MaxLen", Object::Integer(max_len));
                    }
                }
                
                // Set multiline flag if specified
                if let Some(multiline) = field.properties.get("multiline") {
                    if multiline == "true" {
                        let mut flags = 0;
                        flags |= 1 << 12; // Multiline flag
                        field_dict.set("Ff", Object::Integer(flags));
                    }
                }
            },
            "checkbox" => {
                field_dict.set("FT", Object::Name("Btn".as_bytes().to_vec()));
                
                // Set button field flags (checkbox)
                let mut flags = 0;
                flags |= 1 << 15; // Radio button flag
                field_dict.set("Ff", Object::Integer(flags));
                
                // Set checkbox states
                let is_checked = field.value.unwrap_or_default() == "true";
                
                // Define the appearance states
                let mut ap_dict = Dictionary::new();
                let mut n_dict = Dictionary::new();
                
                // Create appearance streams for checked and unchecked states
                let checked_stream = Self::create_checkbox_appearance(true);
                let unchecked_stream = Self::create_checkbox_appearance(false);
                
                let checked_id = document.add_object(Object::Stream(checked_stream));
                let unchecked_id = document.add_object(Object::Stream(unchecked_stream));
                
                n_dict.set("Yes", Object::Reference(checked_id));
                n_dict.set("Off", Object::Reference(unchecked_id));
                
                ap_dict.set("N", Object::Dictionary(n_dict));
                field_dict.set("AP", Object::Dictionary(ap_dict));
                
                // Set the value based on checked state
                if is_checked {
                    field_dict.set("V", Object::Name("Yes".as_bytes().to_vec()));
                    field_dict.set("AS", Object::Name("Yes".as_bytes().to_vec()));
                } else {
                    field_dict.set("V", Object::Name("Off".as_bytes().to_vec()));
                    field_dict.set("AS", Object::Name("Off".as_bytes().to_vec()));
                }
            },
            "dropdown" => {
                field_dict.set("FT", Object::Name("Ch".as_bytes().to_vec()));
                
                // Set choice field flags (dropdown)
                let mut flags = 0;
                flags |= 1 << 17; // Combo box flag
                field_dict.set("Ff", Object::Integer(flags));
                
                // Set options
                if let Some(options_str) = field.properties.get("options") {
                    let options: Vec<&str> = options_str.split(',').collect();
                    let mut opt_array = vec![];
                    
                    for option in options {
                        opt_array.push(Object::String(option.trim().as_bytes().to_vec(), StringFormat::Literal));
                    }
                    
                    field_dict.set("Opt", Object::Array(opt_array));
                }
                
                // Set selected value
                if let Some(value) = field.value {
                    field_dict.set("V", Object::String(value.as_bytes().to_vec(), StringFormat::Literal));
                }
            },
            "signature" => {
                field_dict.set("FT", Object::Name("Sig".as_bytes().to_vec()));
                
                // Create empty signature dictionary
                let mut sig_dict = Dictionary::new();
                sig_dict.set("Type", Object::Name("Sig".as_bytes().to_vec()));
                sig_dict.set("Filter", Object::Name("Adobe.PPKLite".as_bytes().to_vec()));
                sig_dict.set("SubFilter", Object::Name("adbe.pkcs7.detached".as_bytes().to_vec()));
                
                field_dict.set("V", Object::Dictionary(sig_dict));
            },
            _ => return Err(PdfError::UnsupportedOperation(format!("Unsupported field type: {}", field.field_type))),
        }
        
        // Set the field's rectangle (position and size)
        let rect_array = vec![
            Object::Real(field.rect[0]),
            Object::Real(field.rect[1]),
            Object::Real(field.rect[2]),
            Object::Real(field.rect[3]),
        ];
        field_dict.set("Rect", Object::Array(rect_array));
        
        // Set the page reference
        let pages_id = document.get_pages_id()?;
        let page_id = document.get_object_id(pages_id, field.page as usize + 1)
            .ok_or_else(|| PdfError::InvalidPage(field.page))?;
        field_dict.set("P", Object::Reference(page_id));
        
        // Add the field to the document
        let field_id = document.add_object(Object::Dictionary(field_dict));
        
        // Add the field to the AcroForm's Fields array
        let acro_form = document.get_dictionary_mut(acro_form_id)?;
        if let Some(Object::Array(fields)) = acro_form.get_mut(b"Fields") {
            fields.push(Object::Reference(field_id));
        }
        
        Ok(field_id)
    }
    
    /// Create a checkbox appearance stream
    fn create_checkbox_appearance(checked: bool) -> Stream {
        let content = if checked {
            // ZapfDingbats checkmark
            b"/ZaDb 12 Tf 0 0 0 rg 0.3 0.3 0.4 0.4 re f 0.2 0.2 0.6 0.6 re W n BT /ZaDb 12 Tf 0 0 Td (4) Tj ET"
        } else {
            // Empty box
            b"/ZaDb 12 Tf 0 0 0 rg 0.3 0.3 0.4 0.4 re f 0.2 0.2 0.6 0.6 re W n"
        };
        
        let mut stream = Stream::new(Dictionary::new(), content.to_vec());
        stream.dict.set("Type", Object::Name("XObject".as_bytes().to_vec()));
        stream.dict.set("Subtype", Object::Name("Form".as_bytes().to_vec()));
        stream.dict.set("FormType", Object::Integer(1));
        stream.dict.set("BBox", Object::Array(vec![
            Object::Real(0.0),
            Object::Real(0.0),
            Object::Real(1.0),
            Object::Real(1.0),
        ]));
        
        stream
    }
    
    /// Generate appearance streams for form fields
    pub fn generate_appearance_streams<P: AsRef<Path>>(
        pdf_path: P,
        output_path: P
    ) -> Result<()> {
        // Load the PDF document
        let mut document = Document::load(pdf_path.as_ref())?;
        
        // Set the NeedAppearances flag to true
        if let Some(acro_form) = document.trailer
            .get(b"Root")
            .and_then(|obj| obj.as_reference())
            .and_then(|id| document.get_object(id).ok())
            .and_then(|obj| obj.as_dict().ok())
            .and_then(|root| root.get(b"AcroForm"))
            .and_then(|obj| obj.as_reference()) {
                
            if let Ok(mut acro_form_dict) = document.get_dictionary_mut(acro_form) {
                acro_form_dict.set("NeedAppearances", Object::Boolean(true));
            }
        }
        
        // Save the modified document
        document.save(output_path.as_ref())?;
        
        Ok(())
    }
} 