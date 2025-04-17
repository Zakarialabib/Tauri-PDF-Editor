import React from 'react';
import { BaseFormElement, FormElementProps } from './BaseFormElement';

interface TextFieldProps extends FormElementProps {
  value: string;
  placeholder: string;
  fontSize?: number;
  onChange: (id: string, value: string) => void;
}

export const TextField: React.FC<TextFieldProps> = ({
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
  value,
  placeholder,
  fontSize = 14,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(id, e.target.value);
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
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        className="w-full h-full px-2 outline-none"
        style={{ fontSize: `${fontSize}px` }}
        onClick={(e) => e.stopPropagation()}
      />
    </BaseFormElement>
  );
}; 