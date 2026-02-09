import React from 'react';

/**
 * FullScreen utility for managing fullscreen display of content elements
 */
interface FullScreenProps {
  elementSelector?: string;
  isTableVisible: boolean;
}

/**
 * Handles toggling fullscreen mode for a specified element (defaults to '.left-container')
 * @param elementSelector - CSS selector for the element to make fullscreen
 * @param isTableVisible - Flag indicating if the table is visible (required for fullscreen)
 * @returns Object containing the handleFullscreen function
 */
export const FullScreen = ({
  elementSelector = '.left-container',
  isTableVisible
}: FullScreenProps) => {

  // Function to handle fullscreen mode
  const handleFullscreen = () => {
    if (isTableVisible) {
      const container = document.querySelector(elementSelector);
      if (container) {
        if (!document.fullscreenElement) {
          container.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
          });
        } else {
          document.exitFullscreen();
        }
      }
    } else {
      alert('Excel table must be visible to enter fullscreen mode');
    }
  };

  return { handleFullscreen };
};

export default FullScreen;
