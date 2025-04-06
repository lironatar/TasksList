import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../utils/api';
import { AuthContext } from '../App';

// Helper function to generate a random username
const generateUsername = (email: string) => {
  // Extract part before @ in email
  const emailName = email.split('@')[0];
  // Add a random 4-digit number
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${emailName}${randomNum}`;
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showVerification, setShowVerification] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      // Validate all fields are present
      if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
        throw new Error('נא למלא את כל השדות');
      }
      
      // Register with our Auth API
      const response = await register({
        email: formData.email, 
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`
      });
      
      console.log('Registration response:', response);
      
      if (response) {
        setMessage('ההרשמה הצליחה! נשלח קוד אימות לאימייל שלך.');
        setShowVerification(true);
        
        // Navigate to login page after registration
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'ההרשמה הושלמה בהצלחה! נא לבדוק את האימייל שלך לקבלת קוד אימות.',
              email: formData.email,
              showVerification: true
            } 
          });
        }, 2000);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.response?.data?.detail || error.message || 'שגיאה בהרשמה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">הרשמה לחשבון חדש</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            או{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              התחבר לחשבון קיים
            </Link>
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                כתובת אימייל
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="הזן כתובת אימייל"
                dir="ltr"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                שם פרטי
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={handleInputChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="הזן שם פרטי"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                שם משפחה
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleInputChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="הזן שם משפחה"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                סיסמה
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="הזן סיסמה"
                dir="ltr"
              />
              <p className="mt-1 text-sm text-gray-500">הסיסמה חייבת להכיל לפחות 6 תווים</p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'מבצע הרשמה...' : 'הירשם'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            בהרשמה אתה מסכים ל
            <Link 
              to="/terms" 
              className="font-medium text-blue-600 hover:text-blue-500 mx-1"
              onClick={(e) => {
                e.preventDefault();
                alert('תנאי השימוש יהיו זמינים בקרוב');
              }}
            >
              תנאי השימוש
            </Link>
            ול
            <Link 
              to="/privacy" 
              className="font-medium text-blue-600 hover:text-blue-500 mx-1"
              onClick={(e) => {
                e.preventDefault();
                alert('מדיניות הפרטיות תהיה זמינה בקרוב');
              }}
            >
              מדיניות הפרטיות
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 