import React from 'react';
import styles from './ThemeToggle.module.css';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  className?: string;
  style?: React.CSSProperties;
}


export default function ThemeToggle({ theme, setTheme, className = "", style }: ThemeToggleProps) {
  const isDark = theme === 'dark';

  return (
    <button 
      className={`${styles.theme__icon} ${isDark ? styles.dark : ""} ${className}`}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      style={style}
      aria-label="Toggle theme"
    >

      <span></span>
      <span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </span>
      <span></span>
    </button>
  );
}
