import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../utils/api';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../App';

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
  const { login } = useContext(AuthContext);
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
    setError('');
    setMessage('');
    
    if (!formData.email || !formData.password) {
      setError('יש למלא את כל השדות');
      return;
    }
    
    setLoading(true);
    
    try {
      // Sign in with our Auth API using the context login function
      try {
        const data = await login({ email: formData.email, password: formData.password });
        
        if (!data) {
          throw new Error('שגיאה בהתחברות');
        }
        
        if (data.user) {
          setMessage('התחברת בהצלחה! מעביר אותך לדף הראשי...');
          
          // Navigate after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        } else if (data.needsVerification) {
          // Handle the case when the user needs to verify their email
          setShowVerification(true);
          
          // Request a verification code to be sent
          try {
            await authApi.verify({ email: formData.email, code: '' });
            setError('האימייל שלך לא אומת. נא להזין את קוד האימות שנשלח לאימייל שלך.');
          } catch (verifyError) {
            console.error('Error sending verification code:', verifyError);
            setError('לא ניתן לשלוח קוד אימות. נסה שוב מאוחר יותר.');
          }
        }
      } catch (error: any) {
        console.error('Login error:', error);
        
        if (error.response?.data?.detail === 'User not verified') {
          // Request a verification code to be sent
          try {
            await authApi.verify({ email: formData.email, code: '' });
            setShowVerification(true);
            setError('האימייל שלך לא אומת. נא להזין את קוד האימות שנשלח לאימייל שלך.');
          } catch (verifyError) {
            console.error('Error sending verification code:', verifyError);
            setError('לא ניתן לשלוח קוד אימות. נסה שוב מאוחר יותר.');
          }
        } else {
          setError(error.response?.data?.detail || 'שגיאה בהתחברות');
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'שגיאה לא צפויה. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!verificationCode) {
      setError('יש להזין קוד אימות');
      return;
    }
    
    setLoading(true);
    
    try {
      // Verify the code using our API
      const response = await authApi.verify({ email: formData.email, code: verificationCode });
      
      if (response) {
        setMessage('האימייל אומת בהצלחה! כעת ניתן להתחבר למערכת.');
        
        // After successful verification, attempt to login automatically
        if (formData.email && formData.password) {
          setTimeout(async () => {
            setMessage('מתחבר למערכת...');
            try {
              const data = await login({ email: formData.email, password: formData.password });
              if (data && data.user) {
                setMessage('התחברת בהצלחה! מעביר אותך לדף הראשי...');
                // Navigate to dashboard
                setTimeout(() => {
                  navigate('/dashboard');
                }, 1000);
              }
            } catch (loginError) {
              console.error('Error auto logging in after verification:', loginError);
              setError('האימות הצליח, אך ההתחברות נכשלה. אנא נסה להתחבר שוב.');
              setShowVerification(false);
            }
          }, 1500);
        } else {
          // If we don't have login credentials, just return to login form
          setTimeout(() => {
            setShowVerification(false);
          }, 2000);
        }
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setError(error.response?.data?.detail || 'קוד האימות שגוי או שפג תוקפו');
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
      // Use the verify API endpoint with empty code to request a new verification code
      await authApi.verify({ email: formData.email, code: '' });
      setMessage('קוד אימות חדש נשלח לאימייל שלך');
      setResendTimer(120); // 2 minutes
    } catch (err: any) {
      console.error('Error sending verification code:', err);
      setError(err.response?.data?.detail || err.message || 'שגיאה בשליחת קוד האימות');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerificationCode = async () => {
    if (resendTimer > 0) {
      return;
    }
    
    try {
      // Request a new verification code - sending empty code signals to generate a new one
      await authApi.verify({ email: formData.email, code: '' });
      setMessage('קוד אימות חדש נשלח לאימייל שלך');
      setResendTimer(120); // 2 minutes
    } catch (err: any) {
      console.error('Resend error:', err);
      setError('שגיאה בשליחת קוד אימות חדש. אנא נסה שוב מאוחר יותר.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {showVerification ? 'אימות אימייל' : 'התחברות לחשבון'}
          </h2>
          <AnimatePresence>
            {message && (
              <motion.div 
                className="mt-4 p-3 bg-green-100 text-green-700 rounded"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {error && (
              <motion.div 
                className="mt-4 p-3 bg-red-100 text-red-700 rounded"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form className="space-y-6" onSubmit={showVerification ? handleVerificationSubmit : handleSubmit}>
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
              placeholder="הזן את כתובת האימייל שלך"
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
                placeholder="הזן את הסיסמה שלך"
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
              disabled={loading || (showVerification && resendTimer > 0)}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {showVerification ? 'שולח קוד אימות...' : 'מתחבר...'}
                </div>
              ) : (
                showVerification ? 'אמת קוד' : 'התחבר'
              )}
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

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleResendVerificationCode}
              className={`mt-2 text-sm ${
                resendTimer > 0 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-blue-600 hover:text-blue-800'
              }`}
              disabled={resendTimer > 0}
            >
              שלח קוד חדש {resendTimer > 0 && `(${resendTimer})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 