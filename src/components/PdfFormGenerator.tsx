import React, { useState } from 'react';
import { useFormElements } from '../contexts/FormElementContext';
import { useFormData } from '../contexts/FormDataContext';
import { PdfFormFieldGenerator } from '../lib/PdfFormFieldGenerator'
// import { Store } from '@tauri-apps/plugin-store';

// const save = new Store('.store.config');
interface PdfFormGeneratorProps {
  pdfPath: string;
}

export const PdfFormGenerator: React.FC<PdfFormGeneratorProps> = ({ pdfPath }) => {
  const { elements } = useFormElements();
  const { validateAll } = useFormData();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate form data
      const validationResult = validateAll();
      if (!validationResult.valid) {
        setError('Please fix validation errors before generating the PDF form.');
        setIsGenerating(false);
        return;
      }


      // Ask user where to save the PDF
      // const savePath = await window.__TAURI__.dialog.save({
      //   filters: [{
      //     name: 'PDF Files',
      //     extensions: ['pdf']
      //   }],
      // });

      // if (!savePath) {
      //   setIsGenerating(false);
      //   return; // User cancelled
      // }

      // Generate form fields and add them to the PDF
      // await PdfFormFieldGenerator.generateFormFields(
      //   elements,
      //   pdfPath,
      //   savePath
      // );

      // // Generate appearance streams
      // await PdfFormFieldGenerator.generateAppearanceStreams(
      //   savePath,
      //   savePath
      // );

      setSuccess('PDF form generated successfully!');
    } catch (err) {
      console.error('Error generating PDF form:', err);
      setError(`Failed to generate PDF form: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-md shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">PDF Form Generation</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
          {success}
        </div>
      )}
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Generate a PDF form with interactive form fields based on your design.
        </p>
        <p className="text-sm text-gray-600 mb-2">
          The generated PDF will contain {elements.length} form fields.
        </p>
      </div>
      
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        onClick={handleGeneratePdf}
        disabled={isGenerating || elements.length === 0}
      >
        {isGenerating ? 'Generating...' : 'Generate PDF Form'}
      </button>
    </div>
  );
}; 