import React, { useState } from 'react';
import { BaseFormElement, FormElementProps } from './BaseFormElement';

interface DropdownProps extends FormElementProps {
  options: string[];
  selectedOption: string;
  onChange: (id: string, value: string) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({
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
  options,
  selectedOption,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string) => {
    onChange(id, option);
    setIsOpen(false);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
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
      <div className="relative w-full h-full">
        <button
          className="w-full h-full px-2 text-left flex items-center justify-between bg-white"
          onClick={toggleDropdown}
        >
          <span className="truncate">{selectedOption || 'Select an option'}</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-20 max-h-40 overflow-y-auto">
            {options.map((option, index) => (
              <div
                key={index}
                className={`px-2 py-1 cursor-pointer hover:bg-gray-100 ${
                  option === selectedOption ? 'bg-blue-100' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(option);
                }}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseFormElement>
  );
}; 