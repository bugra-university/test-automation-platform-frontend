import React, { useEffect } from 'react';
import ReactCountryFlag from 'react-country-flag';

// Language flag component
// Using react-country-flag library for better flag rendering
interface LanguageFlagProps {
  code: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Map of language codes to appropriate flag emoji or country codes
 * For country flags, we use emoji flags based on ISO 3166-1 alpha-2 country codes
 */
export const languageToCountry: Record<string, string> = {
  original: 'tr', // Turkish flag for original
  en: 'gb',      // UK flag for English
  de: 'de',      // German flag
  fr: 'fr',      // French flag
  es: 'es',      // Spanish flag
  it: 'it',      // Italian flag
  ru: 'ru',      // Russian flag
  pl: 'pl',      // Polish flag
  zh: 'cn',      // Chinese flag (using China)
};

// Function to convert country code to flag emoji (using Unicode regional indicator symbols)
export const countryCodeToFlagEmoji = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) return '';
  
  // Convert each letter to the corresponding Regional Indicator Symbol
  // Using Array.from instead of spread operator for better ES5 compatibility
  const codePoints = Array.from(countryCode.toUpperCase())
    .map(char => 127397 + char.charCodeAt(0));
  
  // Convert code points to emoji string
  return String.fromCodePoint(...codePoints);
};

/**
 * Component to display a language flag
 */
export const LanguageFlag: React.FC<LanguageFlagProps> = ({ 
  code, 
  size = 'md', 
  className = '' 
}) => {
  const countryCode = languageToCountry[code] || code;

  // Convert size prop to pixel values for SVG flags
  const sizePixels = {
    sm: 24,
    md: 28,
    lg: 36
  };
  
  return (
    <div className="flag-container">
      <ReactCountryFlag
        countryCode={countryCode.toUpperCase()}
        svg
        style={{
          width: `${sizePixels[size]}px`,
          height: `${sizePixels[size] * 0.75}px`,
          verticalAlign: 'middle'
        }}
        title={code}
        className={`${className} react-country-flag`}
      />
    </div>
  );
};

/**
 * Function to get a language flag React element
 */
export const getLanguageFlag = (code: string): React.ReactNode => {
  return <LanguageFlag code={code} />;
};

export default LanguageFlag;
