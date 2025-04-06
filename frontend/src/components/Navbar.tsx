import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../App';
import ProfileIcon from './ProfileIcon';
import ProfileIconSelector from './ProfileIconSelector';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfileIcon } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileIconSelector, setShowProfileIconSelector] = useState(false);

  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleProfileIconChange = (icon: string) => {
    if (updateProfileIcon && user) {
      updateProfileIcon(icon);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('authToken'); // Clear the token from localStorage
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-500">
                TasksLists
              </Link>
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex space-x-4">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500"
                  >
                    Dashboard
                  </Link>
                  <li className="mx-2">
                    <Link
                      to="/simple-task-list"
                      className="text-blue-200 hover:text-white transition-colors"
                    >
                      רשימה פשוטה
                    </Link>
                  </li>
                  <div className="relative ml-3">
                    <div>
                      <button 
                        onClick={() => setShowProfileIconSelector(!showProfileIconSelector)}
                        className="flex text-sm rounded-full focus:outline-none"
                      >
                        <ProfileIcon 
                          icon={user.profile_icon || 'https://img.icons8.com/color/96/user-male-circle--v1.png'} 
                          size="md" 
                        />
                      </button>
                    </div>
                    <AnimatePresence>
                      {showProfileIconSelector && (
                        <div className="absolute right-0 mt-2 w-48 z-10">
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="py-1 bg-white dark:bg-gray-800 rounded-md shadow-lg"
                          >
                            <button
                              onClick={() => setShowProfileIconSelector(true)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                              Change Profile Icon
                            </button>
                            <button
                              onClick={handleLogout}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                              Sign out
                            </button>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={handleToggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="sm:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500"
                  >
                    Dashboard
                  </Link>
                  <li className="mx-2">
                    <Link
                      to="/simple-task-list"
                      className="text-blue-200 hover:text-white transition-colors"
                    >
                      רשימה פשוטה
                    </Link>
                  </li>
                  <div className="flex justify-between items-center px-3 py-2">
                    <div className="flex items-center">
                      <ProfileIcon 
                        icon={user.profile_icon || 'https://img.icons8.com/color/96/user-male-circle--v1.png'} 
                        size="sm" 
                      />
                      <span className="ml-3 text-gray-700 dark:text-gray-300">{user.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowProfileIconSelector(true)}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Change Profile Icon
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Icon Selector Modal */}
      <AnimatePresence>
        {showProfileIconSelector && user && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={() => setShowProfileIconSelector(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <ProfileIconSelector
                currentIcon={user.profile_icon || 'https://img.icons8.com/color/96/user-male-circle--v1.png'}
                onSelect={handleProfileIconChange}
                onClose={() => setShowProfileIconSelector(false)}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar; 