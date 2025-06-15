import React, { useEffect } from 'react';
import { languageToCountry } from './languageFlags';
import { supportedLanguages } from './translateApi';
import ReactCountryFlag from 'react-country-flag';

/**
 * This component preloads all language flags to ensure they're rendered
 * before they're needed in the UI. This prevents any delay in showing flags.
 */
export const FlagPreloader: React.FC = () => {
  useEffect(() => {
    // Preload all SVG flags by forcing the browser to render them offscreen
    const preloadFlags = () => {
      // Create a hidden container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.zIndex = '-1';
      
      // Add all SVG flags to force their rendering
      supportedLanguages.forEach(lang => {
        const countryCode = languageToCountry[lang.code] || lang.code;
        
        // Create a wrapper element
        const flagWrapper = document.createElement('div');
        flagWrapper.style.margin = '10px';
        flagWrapper.style.display = 'block';
        
        // Use ReactDOM to render the ReactCountryFlag component into the wrapper
        const flagElement = document.createElement('div');
        flagWrapper.appendChild(flagElement);
        
        // Manually create an image element with the SVG flag
        const img = document.createElement('img');
        img.src = `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
        img.alt = countryCode;
        img.style.width = '28px';
        img.style.height = '21px';
        flagWrapper.appendChild(img);
        
        container.appendChild(flagWrapper);
      });
      
      // Add to document briefly
      document.body.appendChild(container);
      
      // Keep flags loaded longer to ensure they're rendered
      setTimeout(() => {
        document.body.removeChild(container);
      }, 3000);
    };
    
    preloadFlags();
  }, []);
  
  return null; // This component doesn't render anything visible
};

export default FlagPreloader;
