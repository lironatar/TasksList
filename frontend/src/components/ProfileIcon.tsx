import React, { useState, useEffect } from 'react';

interface ProfileIconProps {
  icon: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const ProfileIcon: React.FC<ProfileIconProps> = ({ 
  icon, 
  size = 'md',
  onClick 
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  useEffect(() => {
    // Reset loading state when icon changes
    setIsLoading(true);
    
    // If the icon is a full URL (starts with http), use it directly
    if (icon && (icon.startsWith('http://') || icon.startsWith('https://'))) {
      setImageSrc(icon);
    } 
    // If it's a relative path from the backend (starts with /api/v1)
    else if (icon && icon.startsWith('/api/v1')) {
      setImageSrc(`http://localhost:8000${icon}`);
    }
    // If it's a local path (starts with /)
    else if (icon && icon.startsWith('/')) {
      setImageSrc(icon);
    }
    // Default fallback
    else {
      setImageSrc('/profile-icons/avatar1.png');
    }
  }, [icon]);

  const handleImageError = () => {
    setImageSrc('/profile-icons/avatar1.png');
  };

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full overflow-hidden cursor-pointer ${isLoading ? 'bg-gray-200' : ''}`}
      onClick={onClick}
    >
      <img 
        src={imageSrc} 
        alt="Profile" 
        className="w-full h-full object-cover"
        onError={handleImageError}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};

export default ProfileIcon; 