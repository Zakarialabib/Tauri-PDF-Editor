import { invoke } from '@tauri-apps/api/core';

// Types that match our Rust structs
export interface PdfPage {
  index: number;
  width: number;
  height: number;
  rotation: number;
}

export interface PdfMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creation_date?: string;
  modification_date?: string;
}

export interface PdfDocument {
  path: string;
  page_count: number;
  pages: PdfPage[];
  metadata: PdfMetadata;
}

export interface FileInfo {
  path: string;
  name: string;
  size: number;
  last_modified?: string;
}

export interface CommandError {
  code: string;
  message: string;
}

// PDF Form Field interface
export interface PdfFormField {
  id: string;
  name: string;
  field_type: string;
  value?: string;
  rect: [number, number, number, number];
  page: number;
  properties: Record<string, string>;
}

// Wrapper functions for Tauri commands

/**
 * Open a PDF file using the system dialog
 * @returns The selected file path or undefined if cancelled
 */
export async function openPdfDialog(): Promise<string | undefined> {
  return invoke<string | undefined>('open_pdf_dialog');
}

/**
 * Parse a PDF file and return its structure
 * @param path Path to the PDF file
 * @returns PDF document structure
 */
export async function parsePdf(path: string): Promise<PdfDocument> {
  return invoke<PdfDocument>('parse_pdf', { path });
}

/**
 * Save a PDF file using the system dialog
 * @param defaultPath Optional default path for the save dialog
 * @returns The selected save path or undefined if cancelled
 */
export async function savePdfDialog(defaultPath?: string): Promise<string | undefined> {
  return invoke<string | undefined>('save_pdf_dialog', { defaultPath });
}

/**
 * Save PDF data to a file
 * @param path Path to save the file
 * @param data Binary data to save
 */
export async function savePdfFile(path: string, data: Uint8Array): Promise<void> {
  return invoke<void>('save_pdf_file', { path, data: Array.from(data) });
}

/**
 * Get file information
 * @param path Path to the file
 * @returns File information
 */
export async function getFileInfo(path: string): Promise<FileInfo> {
  return invoke<FileInfo>('get_file_info', { path });
}

/**
 * Create a backup of a file
 * @param path Path to the file
 * @returns Path to the backup file
 */
export async function createFileBackup(path: string): Promise<string> {
  return invoke<string>('create_file_backup', { path });
}

/**
 * Check if a file exists
 * @param path Path to check
 * @returns True if the file exists
 */
export async function fileExists(path: string): Promise<boolean> {
  return invoke<boolean>('file_exists', { path });
}

/**
 * Read a file as base64
 * @param path Path to the file
 * @returns Base64 encoded file content
 */
export async function readFileBase64(path: string): Promise<string> {
  return invoke<string>('read_file_base64', { path });
}

/**
 * Write base64 data to a file
 * @param path Path to write to
 * @param data Base64 encoded data
 */
export async function writeFileBase64(path: string, data: string): Promise<void> {
  return invoke<void>('write_file_base64', { path, data });
}

/**
 * Add form fields to a PDF document
 * @param pdfPath Path to the PDF file
 * @param fields Array of form fields to add
 * @param outputPath Path to save the modified PDF
 */
export async function addFormFieldsToPdf(
  pdfPath: string,
  fields: PdfFormField[],
  outputPath: string
): Promise<void> {
  return invoke<void>('add_form_fields_to_pdf', {
    pdf_path: pdfPath,
    fields,
    output_path: outputPath,
  });
}

/**
 * Generate appearance streams for form fields in a PDF
 * @param pdfPath Path to the PDF file
 * @param outputPath Path to save the modified PDF
 */
export async function generateAppearanceStreams(
  pdfPath: string,
  outputPath: string
): Promise<void> {
  return invoke<void>('generate_appearance_streams', {
    pdf_path: pdfPath,
    output_path: outputPath,
  });
} 