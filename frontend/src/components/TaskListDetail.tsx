import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { motion } from 'framer-motion';
import ReactConfetti from 'react-confetti';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  due_date?: string;
}

interface TaskListType {
  id: string;
  title: string;
  description: string;
  created_at: string;
  user_id: string;
}

interface NewTask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
}

const TaskListDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [taskList, setTaskList] = useState<TaskListType | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState('');
  const [confetti, setConfetti] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState<NewTask>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending'
  });
  const [addTaskError, setAddTaskError] = useState('');
  const [addTaskSuccess, setAddTaskSuccess] = useState('');

  useEffect(() => {
    const fetchTaskListAndTasks = async () => {
      try {
        if (!id) {
          setError('מזהה רשימת המשימות חסר');
          setLoading(false);
          return;
        }

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }

        // Fetch task list details
        const { data: listData, error: listError } = await supabase
          .from('task_lists')
          .select('*')
          .eq('id', id)
          .single();

        if (listError) {
          throw new Error(listError.message);
        }

        if (!listData) {
          setError('רשימת המשימות לא נמצאה');
          setLoading(false);
          return;
        }

        // Check if the task list belongs to the current user
        if (listData.user_id !== user.id) {
          setError('אין לך הרשאה לצפות ברשימת משימות זו');
          setLoading(false);
          return;
        }

        setTaskList(listData);

        // Fetch tasks for this task list
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('list_id', id)
          .order('created_at', { ascending: true });

        if (tasksError) {
          throw new Error(tasksError.message);
        }

        setTasks(tasksData || []);
      } catch (err: any) {
        console.error('שגיאה בטעינת רשימת המשימות:', err);
        setError(err.message || 'אירעה שגיאה בעת טעינת רשימת המשימות');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskListAndTasks();
  }, [id, navigate]);

  const handleStatusChange = async (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) {
        throw new Error(error.message);
      }

      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));

      // Show confetti if the task is completed
      if (newStatus === 'completed') {
        setConfetti(taskId);
        setTimeout(() => setConfetti(null), 3000);
      }
    } catch (err: any) {
      console.error('שגיאה בעדכון סטטוס המשימה:', err);
      alert('שגיאה בעדכון סטטוס המשימה: ' + err.message);
    }
  };

  const handlePriorityChange = async (taskId: string, newPriority: 'low' | 'medium' | 'high') => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ priority: newPriority })
        .eq('id', taskId);

      if (error) {
        throw new Error(error.message);
      }

      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, priority: newPriority } : task
      ));
    } catch (err: any) {
      console.error('שגיאה בעדכון עדיפות המשימה:', err);
      alert('שגיאה בעדכון עדיפות המשימה: ' + err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const translatePriority = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'נמוכה';
      case 'medium':
        return 'בינונית';
      case 'high':
        return 'גבוהה';
      default:
        return priority;
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return 'ממתין';
      case 'in_progress':
        return 'בתהליך';
      case 'completed':
        return 'הושלם';
      default:
        return status.replace('_', ' ');
    }
  };

  const handleNewTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddTaskError('');
    setAddTaskSuccess('');

    if (!newTask.title.trim()) {
      setAddTaskError('נדרשת כותרת למשימה');
      return;
    }

    try {
      // Insert new task
      const { error } = await supabase
        .from('tasks')
        .insert({
          list_id: id,
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          status: newTask.status
        });

      if (error) {
        throw new Error(error.message);
      }

      // Refetch tasks after adding a new one
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('list_id', id)
        .order('created_at', { ascending: true });

      if (tasksError) {
        throw new Error(tasksError.message);
      }

      setTasks(tasksData || []);
      setAddTaskSuccess('המשימה נוספה בהצלחה!');
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending'
      });

      // Hide the form after a short delay
      setTimeout(() => {
        setAddTaskSuccess('');
        setIsAddingTask(false);
      }, 2000);
    } catch (err: any) {
      console.error('שגיאה בהוספת משימה:', err);
      setAddTaskError(err.message || 'אירעה שגיאה בעת הוספת המשימה');
    }
  };

  if (loading) {
    return <div className="text-center py-10">טוען...</div>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
        <Link
          to="/dashboard"
          className="text-blue-600 hover:text-blue-800"
        >
          ← חזרה ללוח הבקרה
        </Link>
      </div>
    );
  }

  if (!taskList) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded mb-6">
          רשימת המשימות לא נמצאה.
        </div>
        <Link
          to="/dashboard"
          className="text-blue-600 hover:text-blue-800"
        >
          ← חזרה ללוח הבקרה
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {confetti && <ReactConfetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={200}
        gravity={0.2}
      />}
      
      <div className="flex items-center mb-6">
        <Link
          to="/dashboard"
          className="text-blue-600 hover:text-blue-800 ml-4"
        >
          ← חזרה ללוח הבקרה
        </Link>
        <h1 className="text-2xl font-bold">{taskList.title}</h1>
      </div>
      
      {taskList.description && (
        <div className="mb-6 bg-gray-50 p-4 rounded">
          <p>{taskList.description}</p>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-700">התקדמות</h3>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-600 ml-2">
                {tasks.filter(t => t.status === 'completed').length} / {tasks.length} הושלמו
              </span>
              <span className="text-sm font-medium text-gray-600">
                ({Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)}%)
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div 
              className="bg-green-600 h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${(tasks.filter(t => t.status === 'completed').length / tasks.length) * 100}%` 
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <div className="flex items-center">
              <span className="h-3 w-3 rounded-full bg-yellow-300 mr-1"></span>
              <span className="text-xs text-gray-500">ממתין: {tasks.filter(t => t.status === 'pending').length}</span>
            </div>
            <div className="flex items-center">
              <span className="h-3 w-3 rounded-full bg-blue-400 mr-1"></span>
              <span className="text-xs text-gray-500">בתהליך: {tasks.filter(t => t.status === 'in_progress').length}</span>
            </div>
            <div className="flex items-center">
              <span className="h-3 w-3 rounded-full bg-green-500 mr-1"></span>
              <span className="text-xs text-gray-500">הושלם: {tasks.filter(t => t.status === 'completed').length}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">משימות ({tasks.length})</h2>
          <motion.button
            onClick={() => setIsAddingTask(!isAddingTask)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isAddingTask ? '❌ ביטול' : '➕ הוסף משימה'}
          </motion.button>
        </div>

        {isAddingTask && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-blue-50 rounded-lg shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-4">הוספת משימה חדשה</h3>
            
            {addTaskError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {addTaskError}
              </div>
            )}
            
            {addTaskSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                {addTaskSuccess}
              </div>
            )}
            
            <form onSubmit={handleAddTask}>
              <div className="mb-3">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  כותרת *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newTask.title}
                  onChange={handleNewTaskChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="הזן כותרת למשימה"
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  תיאור
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newTask.description}
                  onChange={handleNewTaskChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="הזן תיאור למשימה"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    עדיפות
                  </label>
                  <div className="relative">
                    <select
                      id="priority"
                      name="priority"
                      value={newTask.priority}
                      onChange={handleNewTaskChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
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
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    סטטוס
                  </label>
                  <div className="relative">
                    <select
                      id="status"
                      name="status"
                      value={newTask.status}
                      onChange={handleNewTaskChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
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
              
              <div className="flex justify-end">
                <motion.button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  שמור משימה
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
        
        {tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">אין משימות ברשימה זו.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <motion.div 
                key={task.id} 
                className={`bg-white rounded-lg shadow-md p-5 ${task.status === 'completed' ? 'border-l-4 border-green-500' : ''}`}
                whileHover={{ scale: 1.01 }}
                layout
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className={`text-lg font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </h3>
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {translatePriority(task.priority)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {translateStatus(task.status)}
                    </span>
                  </div>
                </div>
                
                {task.description && (
                  <p className={`text-gray-600 mb-4 ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                    {task.description}
                  </p>
                )}
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  {task.due_date && (
                    <span className="text-sm text-gray-500">
                      תאריך יעד: {new Date(task.due_date).toLocaleDateString('he-IL')}
                    </span>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
                    <div>
                      <label htmlFor={`priority-${task.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                        עדיפות
                      </label>
                      <div className="relative">
                        <select
                          id={`priority-${task.id}`}
                          value={task.priority}
                          onChange={(e) => handlePriorityChange(task.id, e.target.value as 'low' | 'medium' | 'high')}
                          className={`w-full text-xs px-2 py-1 border rounded-md ${getPriorityColor(task.priority)} appearance-none`}
                        >
                          <option value="low">נמוכה 🙂</option>
                          <option value="medium">בינונית 😐</option>
                          <option value="high">גבוהה 😬</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-1 text-gray-700">
                          <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor={`status-${task.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                        סטטוס
                      </label>
                      <div className="flex space-x-1 rtl:space-x-reverse">
                        <motion.button
                          onClick={() => handleStatusChange(task.id, 'pending')}
                          className={`text-xs px-2 py-1 rounded-md flex items-center ${
                            task.status === 'pending' 
                              ? 'bg-yellow-200 text-yellow-800' 
                              : 'bg-gray-100 text-gray-800 hover:bg-yellow-100'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="mr-1">⏳</span>
                          ממתין
                        </motion.button>
                        <motion.button
                          onClick={() => handleStatusChange(task.id, 'in_progress')}
                          className={`text-xs px-2 py-1 rounded-md flex items-center ${
                            task.status === 'in_progress' 
                              ? 'bg-blue-200 text-blue-800' 
                              : 'bg-gray-100 text-gray-800 hover:bg-blue-100'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="mr-1">🔄</span>
                          בתהליך
                        </motion.button>
                        <motion.button
                          onClick={() => handleStatusChange(task.id, 'completed')}
                          className={`text-xs px-2 py-1 rounded-md flex items-center ${
                            task.status === 'completed' 
                              ? 'bg-green-200 text-green-800' 
                              : 'bg-gray-100 text-gray-800 hover:bg-green-100'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="mr-1">✅</span>
                          הושלם
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskListDetail;