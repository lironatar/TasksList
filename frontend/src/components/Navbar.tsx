import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsLoggedIn(!!session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error: any) {
      alert('שגיאה בהתנתקות: ' + error.message);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Don't show navbar on landing page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to={isLoggedIn ? '/dashboard' : '/'} className="text-xl font-bold">
          רשימות משימות
        </Link>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={toggleMenu}
            className="text-white focus:outline-none"
          >
            <svg 
              className="h-6 w-6 fill-current" 
              viewBox="0 0 24 24"
            >
              <path 
                fillRule="evenodd" 
                d={isMenuOpen 
                  ? "M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z" 
                  : "M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                }
              />
            </svg>
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden md:flex md:items-center md:space-x-4 rtl:space-x-reverse">
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="hover:text-gray-300">
                לוח הבקרה
              </Link>
              <button 
                onClick={handleLogout} 
                className="hover:text-gray-300"
              >
                התנתק
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-300">
                התחברות
              </Link>
              <Link to="/register" className="hover:text-gray-300">
                הרשמה
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden pt-2">
          <div className="flex flex-col space-y-2">
            {isLoggedIn ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="block py-2 hover:text-gray-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  לוח הבקרה
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }} 
                  className="block text-right w-full py-2 hover:text-gray-300"
                >
                  התנתק
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block py-2 hover:text-gray-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  התחברות
                </Link>
                <Link 
                  to="/register" 
                  className="block py-2 hover:text-gray-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  הרשמה
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 