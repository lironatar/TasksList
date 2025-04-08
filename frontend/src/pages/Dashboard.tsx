import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { taskListsApi } from '../utils/api';
import { AuthContext } from '../App';
import ProfileIcon from '../components/ProfileIcon';
import ProfileIconSelector from '../components/ProfileIconSelector';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  due_date?: string;
}

interface TaskList {
  id: string;
  title: string;
  description: string;
  created_at: string;
  task_count: number;
  completed_count: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfileIcon } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [userFirstName, setUserFirstName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showIconEdit, setShowIconEdit] = useState(false);
  const [showProfileIconSelector, setShowProfileIconSelector] = useState(false);

  useEffect(() => {
    const fetchTaskLists = async () => {
      try {
        setLoading(true);
        
        if (user) {
          // Set first name from the user context
          if (user.first_name) {
            // Directly use first_name if available
            setUserFirstName(user.first_name);
          } else if (user.name) {
            // Fallback to splitting full name
            const firstName = user.name.split(' ')[0];
            setUserFirstName(firstName || '');
          }

          // Get user's task lists
          const response = await taskListsApi.getTaskLists();
          setTaskLists(response);
        }
      } catch (error) {
        console.error('Error fetching task lists:', error);
        setError('אירעה שגיאה בטעינת רשימות המשימות');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskLists();
  }, [user]);

  const handleProfileIconChange = (icon: string) => {
    if (updateProfileIcon && user) {
      updateProfileIcon(icon);
    }
    setShowProfileIconSelector(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6" style={{ direction: 'rtl' }}>
      <div className="flex items-center mb-8">
        <h1 className="text-2xl font-bold">ברוך הבא {userFirstName}!</h1>
        <div 
          className="relative cursor-pointer mr-3"
          onMouseEnter={() => setShowIconEdit(true)}
          onMouseLeave={() => setShowIconEdit(false)}
          onClick={() => setShowProfileIconSelector(true)}
        >
          <ProfileIcon 
            icon={user?.profile_icon || 'https://img.icons8.com/color/96/user-male-circle--v1.png'} 
            size="lg" 
          />
          {showIconEdit && (
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">רשימות המשימות שלך</h2>
          <div>
            <Link
              to="/task-list"
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              צור רשימת משימות חדשה
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">טוען...</div>
        ) : taskLists.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 mb-4">אין לך עדיין רשימות משימות.</p>
            <Link
              to="/task-list"
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              צור את רשימת המשימות הראשונה שלך
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {taskLists.map((list) => (
              <motion.div 
                key={list.id} 
                className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-lg font-semibold mb-2">{list.title}</h3>
                {list.description && (
                  <p className="text-gray-600 mb-3 text-sm">{list.description}</p>
                )}
                
                {list.task_count > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>התקדמות</span>
                      <span>
                        {list.completed_count} / {list.task_count}
                        {list.task_count > 0 && ` (${Math.round((list.completed_count / list.task_count) * 100)}%)`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <motion.div 
                        className="bg-green-500 h-1.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${list.task_count > 0 ? (list.completed_count / list.task_count) * 100 : 0}%` 
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {list.task_count || 0} משימות
                  </span>
                  <Link
                    to={`/task-list/${list.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    צפה בפרטים ←
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Icon Selector Modal */}
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
    </div>
  );
};

export default Dashboard; 