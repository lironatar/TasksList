import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{direction: 'rtl'}}>
      {/* Use the main Navbar component */}
      <Navbar />

      {/* Hero Section */}
      <div className="bg-blue-50 py-20" style={{backgroundColor: '#bfdbfe'}}>
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 order-2 md:order-1">
              <img 
                src="https://source.unsplash.com/random/600x400/?tasks,management"
                alt="ניהול משימות" 
                className="max-w-full h-auto rounded-lg shadow-lg"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://via.placeholder.com/600x400?text=ניהול+משימות';
                }}
              />
            </div>
            <div className="md:w-1/2 mb-10 md:mb-0 order-1 md:order-2">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">ניהול משימות בצורה קלה ופשוטה</h1>
              <p className="text-xl text-gray-600 mb-8">
                ארגן את המשימות שלך, נהל רשימות משימות ושפר את הפרודוקטיביות שלך עם האפליקציה הקלה לשימוש שלנו.
              </p>
              <div className="flex gap-4">
                <Link to="/register" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  התחל עכשיו - בחינם
                </Link>
                <a href="#features" className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition">
                  למד עוד
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-12 bg-gray-50" style={{backgroundColor: '#e2e8f0'}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-3">תכונות מרכזיות</h2>
          </div>
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white p-6 rounded-lg shadow-md" style={{boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'}}>
                <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-md mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">רשימות משימות מרובות</h3>
                <p className="text-gray-600">צור וארגן רשימות משימות מרובות לפרויקטים שונים או תחומי עניין.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md" style={{boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'}}>
                <div className="w-12 h-12 flex items-center justify-center bg-green-100 text-green-600 rounded-md mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">אימות אימייל</h3>
                <p className="text-gray-600">אבטחה משופרת עם אימות אימייל לשמירה על חשבונך.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md" style={{boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'}}>
                <div className="w-12 h-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-md mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">עדכון סטטוס</h3>
                <p className="text-gray-600">עקוב אחר התקדמות המשימות שלך עם עדכוני סטטוס בזמן אמת.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-20" style={{backgroundColor: '#e2e8f0'}}>
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">איך זה עובד</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">הרשמה</h3>
              <p className="text-gray-600">צור חשבון בחינם ואמת את האימייל שלך.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">צור רשימת משימות</h3>
              <p className="text-gray-600">הגדר רשימת משימות חדשה עם כותרת ותיאור.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">הוסף משימות</h3>
              <p className="text-gray-600">הוסף עד 10 משימות לכל רשימה עם פרטים ועדיפויות.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">4</div>
              <h3 className="text-xl font-semibold mb-2">נהל והשלם</h3>
              <p className="text-gray-600">עקוב אחר התקדמות המשימות שלך ועדכן את הסטטוס.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">מוכן להתחיל?</h2>
          <p className="text-xl mb-8">הצטרף לאלפי משתמשים שכבר נהנים מניהול משימות פשוט ויעיל.</p>
          <Link 
            to="/register" 
            className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition inline-block font-semibold"
          >
            הירשם בחינם
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">ניווט</h3>
                <ul className="space-y-2">
                  <li><Link to="/" className="text-gray-400 hover:text-white">ראשי</Link></li>
                  <li><a href="#features" className="text-gray-400 hover:text-white">תכונות</a></li>
                  <li><Link to="/login" className="text-gray-400 hover:text-white">התחברות</Link></li>
                  <li><Link to="/register" className="text-gray-400 hover:text-white">הרשמה</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">משאבים</h3>
                <ul className="space-y-2">
                  <li><a href="/docs" className="text-gray-400 hover:text-white">תיעוד</a></li>
                  <li><a href="/user-guide" className="text-gray-400 hover:text-white">מדריך למשתמש</a></li>
                  <li><a href="/faq" className="text-gray-400 hover:text-white">שאלות נפוצות</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">חוקיות</h3>
                <ul className="space-y-2">
                  <li><a href="/terms" className="text-gray-400 hover:text-white">תנאי שימוש</a></li>
                  <li><a href="/privacy" className="text-gray-400 hover:text-white">מדיניות פרטיות</a></li>
                </ul>
              </div>
            </div>
            <div className="mb-6 md:mb-0 md:w-1/3">
              <h2 className="text-2xl font-bold mb-4">רשימות משימות</h2>
              <p className="text-gray-400">אפליקציה לניהול משימות פשוט ויעיל.</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-10 pt-6 text-center">
            <p className="text-gray-400">&copy; 2023 רשימות משימות. כל הזכויות שמורות.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 