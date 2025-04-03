import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import axios, { AxiosResponse } from 'axios';

interface LocationState {
  message?: string;
  email?: string;
  showVerification?: boolean;
  needsVerification?: boolean;
}

interface VerificationResponse {
  message: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [formData, setFormData] = useState({
    email: state?.email || '',
    password: ''
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(state?.showVerification || state?.needsVerification || false);
  const [error, setError] = useState<string>('');
  const [resendTimer, setResendTimer] = useState(0);
  const [message, setMessage] = useState(state?.message || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state?.needsVerification) {
      setShowVerification(true);
      setMessage('עליך לאמת את כתובת האימייל שלך לפני שתוכל להתחבר.');
      
      // Send verification code automatically
      if (formData.email) {
        handleSendVerificationCode();
      }
    }
  }, [state?.needsVerification, formData.email]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

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
      if (!formData.email || !formData.password) {
        throw new Error('נא למלא את כל השדות');
      }

      // Sign in with Supabase Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        throw signInError;
      }

      // Check if the user is verified
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_verified')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          throw new Error('שגיאה בבדיקת סטטוס האימות');
        }

        if (!profileData || !profileData.is_verified) {
          // User is not verified, sign them out and show verification form
          await supabase.auth.signOut();
          
          // Send a new verification code
          await axios.post('http://localhost:8000/api/v1/verification/send-code', { 
            email: formData.email 
          });
          
          setShowVerification(true);
          setError('האימייל שלך לא אומת. נא להזין את קוד האימות שנשלח לאימייל שלך.');
          setLoading(false);
          return;
        }
      }

      // User is verified, navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'שגיאה בהתחברות');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!verificationCode) {
        throw new Error('נא להזין את קוד האימות');
      }

      if (!formData.email) {
        throw new Error('אימייל חסר, נא לרענן את הדף ולנסות שוב');
      }

      // Verify the code
      const response = await axios.post('http://localhost:8000/api/v1/verification/verify-code', {
        email: formData.email,
        code: verificationCode
      });

      if (response.status === 200) {
        setMessage('האימייל אומת בהצלחה! עכשיו אתה יכול להתחבר.');
        setShowVerification(false);
        setVerificationCode('');
      } else {
        throw new Error('אימות נכשל. נא לנסות שוב.');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.response?.data?.detail || err.message || 'שגיאה באימות הקוד');
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerificationCode = async () => {
    if (!formData.email) {
      setError('נא להזין כתובת אימייל');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await axios.post('http://localhost:8000/api/v1/verification/send-code', {
        email: formData.email
      });
      
      setMessage('קוד אימות חדש נשלח לאימייל שלך');
    } catch (err: any) {
      console.error('Error sending verification code:', err);
      setError(err.response?.data?.detail || err.message || 'שגיאה בשליחת קוד האימות');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await axios.post('http://localhost:8000/api/v1/verification/resend-code', { email: formData.email });
      setResendTimer(120); // Reset timer to 2 minutes
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {showVerification ? 'אימות אימייל' : 'התחברות לחשבון'}
          </h2>
          {message && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        <form className="space-y-6" onSubmit={showVerification ? handleVerifyCode : handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
              disabled={showVerification}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              dir="ltr"
            />
          </div>

          {!showVerification ? (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                סיסמה
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                dir="ltr"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700">
                קוד אימות (6 ספרות)
              </label>
              <input
                id="verification-code"
                name="verificationCode"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                dir="ltr"
              />
              <p className="mt-2 text-sm text-gray-500">
                לא קיבלת קוד?{' '}
                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  שלח שוב
                </button>
              </p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'מעבד...' : showVerification ? 'אמת קוד' : 'התחבר'}
            </button>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-sm">
              {!showVerification ? (
                <p>
                  אין לך חשבון?{' '}
                  <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                    הירשם עכשיו
                  </Link>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowVerification(false)}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  חזור להתחברות
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 