import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import axios from 'axios';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form data
      if (!formData.email || !formData.password || !formData.username) {
        throw new Error('נא למלא את כל השדות');
      }

      // Register with Supabase Auth and include username in metadata
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      // Create a profile for the user with is_verified = false
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: formData.email,
              username: formData.username,
              is_verified: false
            });
          
          if (profileError) {
            console.error('שגיאה ביצירת פרופיל:', profileError);
          }
        } catch (profileErr) {
          console.error('שגיאה ביצירת פרופיל:', profileErr);
        }
      }

      // Send verification code
      await axios.post('http://localhost:8000/api/v1/verification/send-code', { 
        email: formData.email 
      });

      // Navigate to login page with verification state
      navigate('/login', { 
        state: { 
          message: 'ההרשמה הושלמה בהצלחה! נא לבדוק את האימייל שלך לקבלת קוד אימות בן 6 ספרות.',
          email: formData.email,
          showVerification: true
        } 
      });
    } catch (err: any) {
      setError(err.message || 'שגיאה בתהליך ההרשמה');
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
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                שם משתמש
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="הזן שם משתמש"
              />
            </div>
            
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
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500 mx-1">
              תנאי השימוש
            </a>
            ול
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500 mx-1">
              מדיניות הפרטיות
            </a>
            שלנו
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 