// Available profile icons
// These are the paths to the profile icons in the public folder
export const profileIcons = [
  '/profile-icons/avatar1.png', 
  '/profile-icons/avatar2.png',
  '/profile-icons/avatar3.png',
  '/profile-icons/avatar4.png',
  '/profile-icons/avatar5.png',
  '/profile-icons/avatar6.png',
  '/profile-icons/avatar7.png',
  '/profile-icons/avatar8.png',
];

// Default icon colors as fallback if image doesn't load
export const iconColors = [
  '#4299E1', // blue
  '#48BB78', // green
  '#ED8936', // orange
  '#9F7AEA', // purple
  '#F56565', // red
  '#38B2AC', // teal
  '#ECC94B', // yellow
  '#667EEA', // indigo
];

/**
 * Get a random profile icon from the available options
 */
export const getRandomProfileIcon = (): string => {
  const randomIndex = Math.floor(Math.random() * profileIcons.length);
  return profileIcons[randomIndex];
};

/**
 * Get initials from a name (e.g. "John Doe" -> "JD")
 */
export const getInitials = (name: string): string => {
  if (!name) return '?';
  
  const parts = name.split(' ');
  if (parts.length === 1) {
    return name.substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Get a color based on a string (consistent for the same string)
 */
export const getColorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % iconColors.length;
  return iconColors[index];
}; 