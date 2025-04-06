import React from 'react';

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
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full overflow-hidden cursor-pointer`}
      onClick={onClick}
    >
      <img 
        src={icon} 
        alt="Profile" 
        className="w-full h-full object-cover"
        onError={(e) => {
          // If image fails to load, show a fallback
          (e.target as HTMLImageElement).src = '/profile-icons/avatar1.png';
        }}
      />
    </div>
  );
};

export default ProfileIcon; 