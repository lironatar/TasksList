import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authApi, taskListsApi, tasksApi } from '../utils/api';
import { AuthContext } from '../App';

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
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [userFirstName, setUserFirstName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTaskLists = async () => {
      try {
        setLoading(true);
        
        if (user) {
          // Set first name from the user context
          if (user.name) {
            // Extract first name from the full name
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

  const handleLogout = async () => {
    await authApi.logout();
    navigate('/login');
    // Refresh to clear state
    window.location.reload();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">ברוך הבא {userFirstName}!</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          התנתק
        </button>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">רשימות המשימות שלך</h2>
          <div className="space-x-2 rtl:space-x-reverse">
            <Link
              to="/task-list"
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              צור רשימת משימות חדשה
            </Link>
            <Link
              to="/simple-task-list"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-200"
            >
              יצירת רשימה פשוטה
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
    </div>
  );
};

export default Dashboard; 