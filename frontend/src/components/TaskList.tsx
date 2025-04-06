import React, { useState } from 'react';
import { taskListsApi } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Task {
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
}

const TaskList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [listTitle, setListTitle] = useState('');
  
  const [tasks, setTasks] = useState<Task[]>([
    { 
      title: '', 
      priority: 'medium' as const, 
      status: 'pending' as const 
    }
  ]);

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
    setTasks([
      ...tasks, 
      { 
        title: '', 
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
    if (!listTitle.trim()) {
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
      // Create the task list with its tasks
      const data = {
        title: listTitle.trim(),
        description: '', // Add empty description to ensure it's included
        tasks: tasks.map(task => ({
          title: task.title.trim(),
          description: '', // Add empty description to ensure it's included
          priority: task.priority || 'medium',
          status: task.status || 'pending'
        }))
      };
      
      console.log('Sending task list data:', JSON.stringify(data));
      
      const result = await taskListsApi.createTaskList(data);
      console.log('Task list created successfully:', result);
      
      // Success message and reset form
      setSuccess('רשימת המשימות נוצרה בהצלחה!');
      setListTitle('');
      setTasks([{ title: '', priority: 'medium', status: 'pending' }]);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating task list:', err);
      // Log more detailed error information
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error headers:', err.response?.headers);
      
      setError(err.response?.data?.detail || err.message || 'אירעה שגיאה בעת יצירת רשימת המשימות');
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
          className="mb-6 rounded-lg p-4 bg-blue-50 shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              שם רשימת המשימות *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              placeholder="הזן שם לרשימת המשימות"
              required
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xl mr-1">➕</span>
              הוסף משימה
            </motion.button>
          </div>
          
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <motion.div 
                key={index}
                className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm relative"
                variants={taskVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <button
                  type="button"
                  onClick={() => removeTask(index)}
                  className="absolute top-2 left-2 text-red-500 hover:text-red-700 focus:outline-none"
                  title="הסר משימה"
                >
                  ❌
                </button>
                
                <div className="mb-3">
                  <label htmlFor={`task-${index}-title`} className="block text-sm font-medium text-gray-700 mb-1">
                    שם משימה *
                  </label>
                  <input
                    type="text"
                    id={`task-${index}-title`}
                    name="title"
                    value={task.title}
                    onChange={(e) => handleTaskChange(index, e)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="הזן שם משימה"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor={`task-${index}-priority`} className="block text-sm font-medium text-gray-700 mb-1">
                      עדיפות
                    </label>
                    <select
                      id={`task-${index}-priority`}
                      name="priority"
                      value={task.priority}
                      onChange={(e) => handleTaskChange(index, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">נמוכה 🙂</option>
                      <option value="medium">בינונית 😐</option>
                      <option value="high">גבוהה 😬</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor={`task-${index}-status`} className="block text-sm font-medium text-gray-700 mb-1">
                      סטטוס
                    </label>
                    <select
                      id={`task-${index}-status`}
                      name="status"
                      value={task.status}
                      onChange={(e) => handleTaskChange(index, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">ממתין</option>
                      <option value="in_progress">בתהליך</option>
                      <option value="completed">הושלם</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <div className="mt-8 text-center">
          <motion.button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                שומר...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <span className="text-xl mr-2">💾</span>
                שמור רשימת משימות
              </span>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default TaskList; 