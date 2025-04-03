import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Task {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
}

const TaskList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [listData, setListData] = useState({
    title: '',
    description: ''
  });
  
  const [tasks, setTasks] = useState<Task[]>([
    { 
      title: '', 
      description: '', 
      priority: 'medium' as const, 
      status: 'pending' as const 
    }
  ]);

  const handleListChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setListData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTaskChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newTasks = [...tasks];
    newTasks[index] = {
      ...newTasks[index],
      [name]: value
    };
    setTasks(newTasks);
  };

  const addTask = () => {
    if (tasks.length >= 10) {
      setError('ניתן להוסיף עד 10 משימות בלבד.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setTasks([
      ...tasks, 
      { 
        title: '', 
        description: '', 
        priority: 'medium', 
        status: 'pending' 
      }
    ]);
  };

  const removeTask = (index: number) => {
    if (tasks.length === 1) {
      setError('נדרשת לפחות משימה אחת.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate task list data
    if (!listData.title.trim()) {
      setError('נדרשת כותרת לרשימת המשימות');
      setLoading(false);
      return;
    }

    // Validate tasks
    const invalidTasks = tasks.filter(task => !task.title.trim());
    if (invalidTasks.length > 0) {
      setError('כל המשימות חייבות לכלול כותרת');
      setLoading(false);
      return;
    }

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('עליך להיות מחובר כדי ליצור רשימת משימות');
        setLoading(false);
        return;
      }

      // Create the task list
      const { data: taskList, error: listError } = await supabase
        .from('task_lists')
        .insert({
          user_id: user.id,
          title: listData.title,
          description: listData.description
        })
        .select('id')
        .single();

      if (listError) {
        throw listError;
      }

      // Create the tasks associated with the list
      const tasksToInsert = tasks.map(task => ({
        list_id: taskList.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status
      }));

      const { error: tasksError } = await supabase
        .from('tasks')
        .insert(tasksToInsert);

      if (tasksError) {
        throw tasksError;
      }

      // Success message and reset form
      setSuccess('רשימת המשימות נוצרה בהצלחה!');
      setListData({ title: '', description: '' });
      setTasks([{ title: '', description: '', priority: 'medium', status: 'pending' }]);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'אירעה שגיאה בעת יצירת רשימת המשימות');
    } finally {
      setLoading(false);
    }
  };

  // Function to get emoji and color for priority
  const getPriorityDisplay = (priority: string) => {
    switch (priority) {
      case 'low':
        return { emoji: '🙂', color: 'bg-green-100 border-green-300 text-green-800' };
      case 'medium':
        return { emoji: '😐', color: 'bg-yellow-100 border-yellow-300 text-yellow-800' };
      case 'high':
        return { emoji: '😬', color: 'bg-red-100 border-red-300 text-red-800' };
      default:
        return { emoji: '😐', color: 'bg-gray-100 border-gray-300 text-gray-800' };
    }
  };

  // Animated variants for tasks
  const taskVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <motion.h2 
        className="text-2xl font-bold mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        ✨ יצירת רשימת משימות חדשה ✨
      </motion.h2>
      
      {error && (
        <motion.div 
          className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-300 shadow-sm"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center">
            <span className="text-xl mr-2">⚠️</span>
            <span>{error}</span>
          </div>
        </motion.div>
      )}
      
      {success && (
        <motion.div 
          className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg border border-green-300 shadow-sm"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center">
            <span className="text-xl mr-2">🎉</span>
            <span>{success}</span>
          </div>
        </motion.div>
      )}
      
      <form onSubmit={handleSubmit}>
        <motion.div 
          className="mb-6 border-b pb-6 rounded-lg p-4 bg-blue-50 shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <span className="text-2xl mr-2">📝</span>
            פרטי רשימת המשימות
          </h3>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              כותרת *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={listData.title}
              onChange={handleListChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              placeholder="הזן כותרת לרשימת המשימות"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              תיאור
            </label>
            <textarea
              id="description"
              name="description"
              value={listData.description}
              onChange={handleListChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              placeholder="הזן תיאור לרשימת המשימות"
              rows={3}
            />
          </div>
        </motion.div>
        
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold flex items-center">
              <span className="text-2xl mr-2">📋</span>
              משימות
            </h3>
            <motion.button
              type="button"
              onClick={addTask}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md flex items-center"
              disabled={tasks.length >= 10}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xl mr-1">➕</span>
              הוסף משימה
              <span className="ml-1 text-sm bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center">
                {tasks.length}/10
              </span>
            </motion.button>
          </div>
          
          {tasks.map((task, index) => (
            <motion.div 
              key={index} 
              className="mb-6 p-4 border border-gray-200 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow"
              variants={taskVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium flex items-center">
                  <span className="text-xl mr-2">🔹</span>
                  משימה #{index + 1}
                </h4>
                <motion.button
                  type="button"
                  onClick={() => removeTask(index)}
                  className="text-red-600 hover:text-red-800 focus:outline-none bg-red-50 hover:bg-red-100 px-2 py-1 rounded-full transition-colors flex items-center"
                  disabled={tasks.length === 1}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="text-lg mr-1">🗑️</span>
                  הסר
                </motion.button>
              </div>
              
              <div className="mb-3">
                <label htmlFor={`task-title-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  כותרת *
                </label>
                <input
                  type="text"
                  id={`task-title-${index}`}
                  name="title"
                  value={task.title}
                  onChange={(e) => handleTaskChange(index, e)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  placeholder="הזן כותרת למשימה"
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor={`task-description-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  תיאור
                </label>
                <textarea
                  id={`task-description-${index}`}
                  name="description"
                  value={task.description}
                  onChange={(e) => handleTaskChange(index, e)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  placeholder="הזן תיאור למשימה"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`task-priority-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    עדיפות
                  </label>
                  <div className="relative">
                    <select
                      id={`task-priority-${index}`}
                      name="priority"
                      value={task.priority}
                      onChange={(e) => handleTaskChange(index, e)}
                      className={`w-full px-3 py-2 border ${getPriorityDisplay(task.priority).color} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm`}
                    >
                      <option value="low">נמוכה 🙂</option>
                      <option value="medium">בינונית 😐</option>
                      <option value="high">גבוהה 😬</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor={`task-status-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    סטטוס
                  </label>
                  <div className="relative">
                    <select
                      id={`task-status-${index}`}
                      name="status"
                      value={task.status}
                      onChange={(e) => handleTaskChange(index, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm"
                    >
                      <option value="pending">ממתין ⏳</option>
                      <option value="in_progress">בתהליך 🔄</option>
                      <option value="completed">הושלם ✅</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="flex justify-center">
          <motion.button
            type="submit"
            className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg text-lg font-medium flex items-center"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                מעבד...
              </>
            ) : (
              <>
                <span className="text-xl mr-2">✨</span>
                צור רשימת משימות
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default TaskList; 