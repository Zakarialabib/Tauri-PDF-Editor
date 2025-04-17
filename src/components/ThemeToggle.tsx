import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const accentColors = [
  { name: 'blue', label: 'Blue' },
  { name: 'purple', label: 'Purple' },
  { name: 'green', label: 'Green' },
  { name: 'orange', label: 'Orange' },
] as const;

export const ThemeToggle: React.FC = () => {
  const { theme, accentColor, toggleTheme, setAccentColor } = useTheme();

  return (
    <div className="theme-toggle slide-in">
      <button
        onClick={toggleTheme}
        className="button theme-button"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
      
      <div className="accent-colors">
        {accentColors.map(({ name, label }) => (
          <button
            key={name}
            onClick={() => setAccentColor(name)}
            className={`color-button ${accentColor === name ? 'active' : ''}`}
            style={{ backgroundColor: `var(--accent-${name})` }}
            title={`Set accent color to ${label}`}
          >
            {/* name or label  */}
            {label}
          </button> 
        ))}
      </div>
    </div>
  );
};