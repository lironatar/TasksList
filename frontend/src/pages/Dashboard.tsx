import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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
  const [loading, setLoading] = useState(true);
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const fetchUserAndTaskLists = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }

        // Get user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setUserName(profileData.username);
        }

        // Get user's task lists
        const { data: listsData, error: listsError } = await supabase
          .from('task_lists')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (listsError) {
          console.error('שגיאה בטעינת רשימות המשימות:', listsError);
          return;
        }

        // If there are no task lists, we're done
        if (!listsData || listsData.length === 0) {
          setTaskLists([]);
          setLoading(false);
          return;
        }

        // For each task list, count the total tasks and completed tasks
        const taskListsWithCounts = await Promise.all(
          listsData.map(async (list) => {
            // Get total tasks
            const { count: totalCount, error: totalCountError } = await supabase
              .from('tasks')
              .select('*', { count: 'exact', head: true })
              .eq('list_id', list.id);
            
            if (totalCountError) {
              console.error(`שגיאה בספירת משימות לרשימה ${list.id}:`, totalCountError);
              return { ...list, task_count: 0, completed_count: 0 };
            }
            
            // Get completed tasks
            const { count: completedCount, error: completedCountError } = await supabase
              .from('tasks')
              .select('*', { count: 'exact', head: true })
              .eq('list_id', list.id)
              .eq('status', 'completed');
            
            if (completedCountError) {
              console.error(`שגיאה בספירת משימות שהושלמו לרשימה ${list.id}:`, completedCountError);
              return { ...list, task_count: totalCount || 0, completed_count: 0 };
            }
            
            return { 
              ...list, 
              task_count: totalCount || 0,
              completed_count: completedCount || 0
            };
          })
        );

        setTaskLists(taskListsWithCounts);
      } catch (error) {
        console.error('שגיאה:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndTaskLists();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">ברוך הבא, {userName || 'משתמש'}!</h1>
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
          <Link
            to="/create-task-list"
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            צור רשימת משימות חדשה
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10">טוען...</div>
        ) : taskLists.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 mb-4">אין לך עדיין רשימות משימות.</p>
            <Link
              to="/create-task-list"
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