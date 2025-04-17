import React from 'react';
import { BaseFormElement, FormElementProps } from './BaseFormElement';

interface CheckboxProps extends FormElementProps {
  checked: boolean;
  label: string;
  onChange: (id: string, checked: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  name,
  x,
  y,
  width,
  height,
  page,
  isSelected,
  onClick,
  onMove,
  onResize,
  checked,
  label,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(id, e.target.checked);
  };

  return (
    <BaseFormElement
      id={id}
      name={name}
      x={x}
      y={y}
      width={width}
      height={height}
      page={page}
      isSelected={isSelected}
      onClick={onClick}
      onMove={onMove}
      onResize={onResize}
    >
      <div className="flex items-center h-full px-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          className="h-4 w-4"
          onClick={(e) => e.stopPropagation()}
        />
        <label 
          className="ml-2 text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {label}
        </label>
      </div>
    </BaseFormElement>
  );
}; 