import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { userApi } from '../utils/api';
import { CircularProgress } from '@mui/material';

// Default icons as fallback
const DEFAULT_ICONS = [
  'https://img.icons8.com/color/96/user-male-circle--v1.png',
  'https://img.icons8.com/color/96/user-female-circle--v1.png',
  'https://img.icons8.com/fluency/96/user-male-circle.png'
];

interface ProfileIcon {
  id: string;
  path: string;
  label: string;
}

interface ProfileIconSelectorProps {
  currentIcon: string;
  onSelect: (icon: string) => void;
  onClose: () => void;
}

const ProfileIconSelector: React.FC<ProfileIconSelectorProps> = ({
  currentIcon,
  onSelect,
  onClose
}) => {
  const [selectedIcon, setSelectedIcon] = useState<string>(currentIcon);
  const [icons, setIcons] = useState<ProfileIcon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const baseUrl = 'http://localhost:8000';
  
  useEffect(() => {
    const fetchIcons = async () => {
      try {
        setIsLoading(true);
        const data = await userApi.getProfileIcons();
        setIcons(data);
      } catch (error) {
        console.error('Failed to fetch profile icons:', error);
        // Use default icons as fallback
        setIcons([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIcons();
  }, []);

  const handleSelect = (icon: string) => {
    setSelectedIcon(icon);
  };

  const handleSave = () => {
    onSelect(selectedIcon);
    onClose();
  };

  // Helper function to get the correct image URL
  const getImageUrl = (path: string) => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    } else if (path.startsWith('/api/v1')) {
      return `${baseUrl}${path}`;
    } else {
      return path;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-72"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Profile Icon</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-4">
          <CircularProgress size={24} />
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3 mb-4">
          {/* Show backend icons if available, otherwise use default */}
          {icons.length > 0 ? (
            icons.map((icon) => (
              <div
                key={icon.id}
                className={`w-12 h-12 rounded-full overflow-hidden cursor-pointer border-2 transition-all ${
                  selectedIcon === icon.path 
                    ? 'border-blue-500 scale-110' 
                    : 'border-transparent hover:border-gray-300'
                }`}
                onClick={() => handleSelect(icon.path)}
              >
                <img
                  src={getImageUrl(icon.path)}
                  alt={icon.label}
                  className="w-full h-full object-cover"
                />
              </div>
            ))
          ) : (
            DEFAULT_ICONS.map((icon, index) => (
              <div
                key={index}
                className={`w-12 h-12 rounded-full overflow-hidden cursor-pointer border-2 transition-all ${
                  selectedIcon === icon 
                    ? 'border-blue-500 scale-110' 
                    : 'border-transparent hover:border-gray-300'
                }`}
                onClick={() => handleSelect(icon)}
              >
                <img
                  src={icon}
                  alt={`Profile icon ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))
          )}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Save
        </button>
      </div>
    </motion.div>
  );
};

export default ProfileIconSelector; 