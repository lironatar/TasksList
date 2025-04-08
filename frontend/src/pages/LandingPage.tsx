import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50" style={{ direction: 'rtl' }}>
      <Navbar />

      {/* Hero Section - More Playful */}
      <motion.div 
        className="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 py-28 text-white"
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        <div className="container mx-auto px-6 text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold leading-tight mb-6"
            variants={fadeInUp}
          >
            הפכו משימות <span className="text-yellow-300">לחגיגה</span> של שיתוף פעולה!
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-purple-100 mb-10 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            נמאס מרשימות משעממות? נהלו משימות בכיף, עקבו אחר התקדמות, והשיגו יעדים יחד עם הפלטפורמה הצבעונית שלנו.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={fadeInUp}
          >
            <Link 
              to="/register" 
              className="px-6 py-2.5 bg-yellow-400 text-purple-900 font-bold rounded-full hover:bg-yellow-300 transition duration-300 transform hover:scale-105 shadow-lg"
            >
              התחילו לשחק - זה בחינם!
            </Link>
            <a 
              href="#features" 
              className="px-6 py-2.5 border-2 border-yellow-300 text-yellow-300 rounded-full hover:bg-yellow-300 hover:text-purple-900 transition duration-300"
            >
              גלו את הקסם ✨
            </a>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Illustration Section */}
      <div className="py-16 bg-white flex justify-center">
         {/* Replace with a playful illustration - using a placeholder for now */}
         <motion.img 
           src="https://illustrations.popsy.co/red/team-work.svg" // Example illustration from Popsy
           alt="צוות עובד בשיתוף פעולה מהנה" 
           className="max-w-lg w-full h-auto"
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5, delay: 0.2 }}
           onError={(e) => {
             e.currentTarget.onerror = null;
             e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Playful+Teamwork+Illustration';
           }}
         />
      </div>


      {/* Features Section - More Dynamic */}
      <section id="features" className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeInUp}
          >
            <span className="text-pink-600 font-semibold tracking-wider uppercase">מה בתפריט?</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">כלים שיעשו לכם חשק לעבוד</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg mb-16">כי ניהול משימות לא חייב להיות אפור ומשעמם.</p>
          </motion.div>
          
          <motion.div 
            className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            {/* Feature Card 1 */}
            <motion.div 
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              variants={fadeInUp}
            >
              <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full mb-6 shadow-md">
                 {/* Replace with a fun icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">שיחות וצ'אטים על משימות</h3>
              <p className="text-gray-600">דברו על המשימה במקום אחד, בלי מיילים ארוכים ומסורבלים.</p>
            </motion.div>
            
            {/* Feature Card 2 */}
            <motion.div 
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              variants={fadeInUp}
            >
              <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 text-white rounded-full mb-6 shadow-md">
                 {/* Replace with a fun icon */}
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">חגיגת V קטנה (וגדולה!)</h3>
              <p className="text-gray-600">סיימתם משימה? קבלו אנימציה כיפית! כי מגיע לכם לחגוג הצלחות.</p>
            </motion.div>
            
            {/* Feature Card 3 */}
            <motion.div 
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              variants={fadeInUp}
            >
              <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-full mb-6 shadow-md">
                 {/* Replace with a fun icon */}
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.539 1.118l-3.975-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">מדבקות ופרסים לצוות</h3>
              <p className="text-gray-600">עודדו את הצוות עם מערכת תגמולים וירטואלית, כי עבודה טובה ראויה לציון!</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section - Simplified & Animated */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeInUp}
          >
            <span className="text-purple-600 font-semibold tracking-wider uppercase">קל ופשוט</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">איך מתחילים את הכיף?</h2>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
             initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            {/* Step 1 */}
            <motion.div className="text-center" variants={fadeInUp}>
              <div className="relative mb-4">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto shadow-lg">1</div>
                 {/* Optional: Add connecting line/arrow visual */}
              </div>
              <h3 className="text-xl font-semibold mb-2">הזמינו חברים</h3>
              <p className="text-gray-600 text-sm">אספו את הצוות המנצח שלכם.</p>
            </motion.div>
             {/* Step 2 */}
            <motion.div className="text-center" variants={fadeInUp}>
              <div className="relative mb-4">
                <div className="bg-gradient-to-br from-pink-500 to-red-500 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto shadow-lg">2</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">צרו משימה ראשונה</h3>
              <p className="text-gray-600 text-sm">כתבו מה צריך לעשות, ותנו לדמיון להמריא.</p>
            </motion.div>
             {/* Step 3 */}
            <motion.div className="text-center" variants={fadeInUp}>
              <div className="relative mb-4">
                <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto shadow-lg">3</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">שתפו פעולה</h3>
              <p className="text-gray-600 text-sm">הוסיפו הערות, קבצים, וראו איך הקסם קורה.</p>
            </motion.div>
             {/* Step 4 */}
            <motion.div className="text-center" variants={fadeInUp}>
              <div className="relative mb-4">
                <div className="bg-gradient-to-br from-orange-500 to-yellow-400 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto shadow-lg">4</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">חגגו הצלחות!</h3>
              <p className="text-gray-600 text-sm">סיימתם? סמנו V ותתכוננו לקונפטי!</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Testimonials Section - Optional, can be simplified or removed if too serious */}
      {/* ... Keep or adapt testimonials section ... */}

      {/* CTA Section - Playful */}
      <motion.div 
        className="py-24 bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600 text-white"
         initial="initial"
         whileInView="animate"
         viewport={{ once: true, amount: 0.5 }}
         variants={stagger}
      >
        <div className="container mx-auto px-6 text-center">
          <motion.h2 className="text-3xl md:text-4xl font-bold mb-6" variants={fadeInUp}>מוכנים להפסיק לנהל ולהתחיל לשחק?</motion.h2>
          <motion.p className="text-xl mb-10 max-w-3xl mx-auto text-teal-100" variants={fadeInUp}>
             הצטרפו לצוותים שכבר גילו שניהול משימות יכול להיות מהנה. התחילו בחינם ותראו בעצמכם.
          </motion.p>
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center" variants={fadeInUp}>
            <Link 
              to="/register" 
              className="px-7 py-3 bg-white text-blue-700 font-bold rounded-full hover:bg-gray-100 transition duration-300 transform hover:scale-105 shadow-lg"
            >
              כן! בואו נתחיל! 🎉
            </Link>
            {/* Optional: Add a secondary, less prominent CTA if needed */}
             {/* <Link 
              to="/contact" 
              className="px-8 py-4 border-2 border-teal-200 text-teal-100 rounded-full hover:bg-teal-100 hover:text-blue-700 transition duration-300"
            >
              יש לי שאלה
            </Link> */}
          </motion.div>
        </div>
      </motion.div>

      {/* Footer - Keep it clean */}
      <footer className="bg-gray-800 text-gray-400 py-12">
         <div className="container mx-auto px-6 text-center text-sm">
           <p className="mb-2">&copy; {new Date().getFullYear()} שם האפליקציה שלכם בע"מ. כל הזכויות שמורות.</p>
           <div className="space-x-4 rtl:space-x-reverse">
             <Link to="/terms" className="hover:text-white">תנאי שימוש</Link>
             <span>|</span>
             <Link to="/privacy" className="hover:text-white">מדיניות פרטיות</Link>
           </div>
         </div>
       </footer>
    </div>
  );
};

export default LandingPage; 