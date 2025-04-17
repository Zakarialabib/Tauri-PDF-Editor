import React from 'react';

interface FormField {
  name: string;
  field_type: string;
  value: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

interface FormFieldEditorProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onDelete: () => void;
}

export const FormFieldEditor: React.FC<FormFieldEditorProps> = ({ field, onUpdate, onDelete }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onUpdate({
      ...field,
      [name]: name === 'value' ? value : Number(value),
    });
  };

  return (
    <div className="form-field-editor">
      <div className="field-header">
        <h3>Edit Field</h3>
        <button onClick={onDelete} className="button danger" title="Delete field">
          Delete
        </button>
      </div>

      <div className="field-properties">
        <div className="field-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={field.name}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="field-group">
          <label htmlFor="field_type">Type:</label>
          <select
            id="field_type"
            name="field_type"
            value={field.field_type}
            onChange={handleChange}
            className="select"
          >
            <option value="text">Text</option>
            <option value="checkbox">Checkbox</option>
            <option value="radio">Radio</option>
            <option value="signature">Signature</option>
            <option value="dropdown">Dropdown</option>
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="value">Value:</label>
          <input
            type="text"
            id="value"
            name="value"
            value={field.value || ''}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="field-dimensions">
          <div className="field-group">
            <label htmlFor="x">X:</label>
            <input
              type="number"
              id="x"
              name="x"
              value={field.x}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="field-group">
            <label htmlFor="y">Y:</label>
            <input
              type="number"
              id="y"
              name="y"
              value={field.y}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="field-group">
            <label htmlFor="width">Width:</label>
            <input
              type="number"
              id="width"
              name="width"
              value={field.width}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="field-group">
            <label htmlFor="height">Height:</label>
            <input
              type="number"
              id="height"
              name="height"
              value={field.height}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="field-group">
            <label htmlFor="page">Page:</label>
            <input
              type="number"
              id="page"
              name="page"
              value={field.page}
              onChange={handleChange}
              className="input"
              min="1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};