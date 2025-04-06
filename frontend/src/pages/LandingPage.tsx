import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{direction: 'rtl'}}>
      {/* Use the main Navbar component */}
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 order-1 md:order-1">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-white">
                ניהול משימות <span className="text-yellow-300">שיתופי</span> למשרד המודרני
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                שתף פעולה, עקוב אחר התקדמות, והשג יותר בצוות עם פלטפורמת ניהול המשימות השיתופית שלנו.
              </p>
              <div className="flex gap-4">
                <Link to="/register" className="px-6 py-3 bg-yellow-400 text-blue-900 font-bold rounded-lg hover:bg-yellow-300 transition duration-300 transform hover:scale-105">
                  התחל שיתוף פעולה - בחינם
                </Link>
                <a href="#features" className="px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition duration-300">
                  גלה יכולות
                </a>
              </div>
            </div>
            <div className="md:w-1/2 order-2 md:order-2 flex justify-center">
              <img 
                src="https://source.unsplash.com/random/600x400/?team,collaboration"
                alt="שיתוף פעולה בצוות" 
                className="max-w-full h-auto rounded-lg shadow-2xl transform rotate-2 hover:rotate-0 transition duration-500"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://via.placeholder.com/600x400?text=שיתוף+פעולה+בצוות';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-blue-600 font-semibold tracking-wider uppercase">תכונות מרכזיות</span>
            <h2 className="text-3xl font-bold mt-2 mb-8">עבודה יעילה יותר בצוות</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg mb-16">גלה כיצד רשימות המשימות השיתופיות שלנו מסייעות לצוותים להיות יותר מאורגנים, לתקשר טוב יותר ולהשיג יותר.</p>
          </div>
          
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className="w-14 h-14 flex items-center justify-center bg-blue-100 text-blue-600 rounded-xl mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">שיתוף פעולה בזמן אמת</h3>
                <p className="text-gray-600">עבוד יחד עם חברי צוות על אותן רשימות משימות בזמן אמת, ללא כפילויות או סתירות.</p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className="w-14 h-14 flex items-center justify-center bg-green-100 text-green-600 rounded-xl mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">תזמון חכם וחלוקת משימות</h3>
                <p className="text-gray-600">חלק משימות בקלות לחברי צוות, עקוב אחר לוחות זמנים וקבל תזכורות לקראת תאריכי יעד.</p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className="w-14 h-14 flex items-center justify-center bg-purple-100 text-purple-600 rounded-xl mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">דוחות וניתוח ביצועים</h3>
                <p className="text-gray-600">קבל תובנות מפורטות על התקדמות המשימות וביצועי הצוות באמצעות דוחות ודשבורדים.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold tracking-wider uppercase">הצלחות לקוחות</span>
            <h2 className="text-3xl font-bold mt-2">מה צוותים אומרים</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  ר
                </div>
                <div className="mr-4">
                  <h4 className="font-semibold">רותם מערכות</h4>
                  <p className="text-gray-500 text-sm">חברת תוכנה</p>
                </div>
              </div>
              <p className="text-gray-600">"מאז שהתחלנו להשתמש במערכת, הפרודוקטיביות של הצוות שלנו עלתה ב-35%. היכולת לשתף משימות ולעקוב אחר התקדמות בזמן אמת היא פשוט מדהימה."</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  ד
                </div>
                <div className="mr-4">
                  <h4 className="font-semibold">דביר פרויקטים</h4>
                  <p className="text-gray-500 text-sm">ניהול פרויקטים</p>
                </div>
              </div>
              <p className="text-gray-600">"אנחנו מנהלים עשרות פרויקטים במקביל וחיפשנו פתרון שיאפשר לנו לשתף פעולה ביעילות. המערכת היא בדיוק מה שחיפשנו, קלה לשימוש ומאוד יעילה."</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  א
                </div>
                <div className="mr-4">
                  <h4 className="font-semibold">אביב יזמות</h4>
                  <p className="text-gray-500 text-sm">סטארט-אפ</p>
                </div>
              </div>
              <p className="text-gray-600">"כסטארט-אפ קטן, היינו צריכים כלי שיגדל איתנו. הפלטפורמה נתנה לנו את הגמישות להתאים את תהליכי העבודה שלנו תוך כדי צמיחה, ועכשיו כל הצוות מסונכרן."</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Updated for Collaboration */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold tracking-wider uppercase">מדריך מהיר</span>
            <h2 className="text-3xl font-bold mt-2">איך זה עובד</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center bg-white p-6 rounded-xl shadow-md">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-xl font-semibold mb-3">צור צוות</h3>
              <p className="text-gray-600">הרשם והקם את הצוות שלך, הזמן את חברי הצוות בקלות דרך המערכת.</p>
            </div>
            <div className="text-center bg-white p-6 rounded-xl shadow-md">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-xl font-semibold mb-3">צור פרויקט משותף</h3>
              <p className="text-gray-600">הגדר פרויקט עם משימות, תאריכי יעד והקצאות לחברי צוות.</p>
            </div>
            <div className="text-center bg-white p-6 rounded-xl shadow-md">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-xl font-semibold mb-3">עבוד בשיתוף פעולה</h3>
              <p className="text-gray-600">שתף עדכונים, צרף קבצים והוסף הערות למשימות בזמן אמת.</p>
            </div>
            <div className="text-center bg-white p-6 rounded-xl shadow-md">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">4</div>
              <h3 className="text-xl font-semibold mb-3">נתח והתקדם</h3>
              <p className="text-gray-600">עקוב אחר התקדמות הצוות, זהה צווארי בקבוק ושפר את התהליכים.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">מוכנים להפוך את הצוות שלכם ליעיל יותר?</h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto">הצטרפו לאלפי צוותים שמשתמשים בפלטפורמה שלנו להשיג יותר ביחד. בין אם אתם צוות קטן או ארגון גדול, אנחנו מתאימים את הפתרון שלנו לצרכים שלכם.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="px-8 py-4 bg-yellow-400 text-blue-900 font-bold rounded-lg hover:bg-yellow-300 transition duration-300 transform hover:scale-105"
            >
              התחל תקופת ניסיון בחינם
            </Link>
            <Link 
              to="/contact" 
              className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition duration-300"
            >
              קבע פגישת ייעוץ
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-10 md:mb-0 md:w-1/3">
              <h2 className="text-2xl font-bold mb-6">רשימות משימות שיתופיות</h2>
              <p className="text-gray-400 mb-6">פלטפורמת ניהול משימות שיתופית שמסייעת לצוותים לעבוד טוב יותר יחד.</p>
              <div className="flex space-x-4 rtl:space-x-reverse">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                </a>
              </div>
            </div>
            
            <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">ניווט מהיר</h3>
                <ul className="space-y-3">
                  <li><Link to="/" className="text-gray-400 hover:text-white transition">ראשי</Link></li>
                  <li><a href="#features" className="text-gray-400 hover:text-white transition">תכונות</a></li>
                  <li><Link to="/pricing" className="text-gray-400 hover:text-white transition">מחירים</Link></li>
                  <li><Link to="/login" className="text-gray-400 hover:text-white transition">התחברות</Link></li>
                  <li><Link to="/register" className="text-gray-400 hover:text-white transition">הרשמה</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">משאבים</h3>
                <ul className="space-y-3">
                  <li><a href="/docs" className="text-gray-400 hover:text-white transition">תיעוד</a></li>
                  <li><a href="/user-guide" className="text-gray-400 hover:text-white transition">מדריך למשתמש</a></li>
                  <li><a href="/blog" className="text-gray-400 hover:text-white transition">בלוג</a></li>
                  <li><a href="/webinars" className="text-gray-400 hover:text-white transition">וובינרים</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">חוקיות</h3>
                <ul className="space-y-3">
                  <li><a href="/terms" className="text-gray-400 hover:text-white transition">תנאי שימוש</a></li>
                  <li><a href="/privacy" className="text-gray-400 hover:text-white transition">מדיניות פרטיות</a></li>
                  <li><a href="/security" className="text-gray-400 hover:text-white transition">אבטחת מידע</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} רשימות משימות שיתופיות. כל הזכויות שמורות.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 