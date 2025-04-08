import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { taskListsApi, tasksApi } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import { AuthContext } from '../App';

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
  const { user } = useContext(AuthContext);
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
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTaskData, setEditTaskData] = useState<{
    title?: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    status?: 'pending' | 'in_progress' | 'completed';
  }>({});
  const [editListTitle, setEditListTitle] = useState('');
  const [editListDescription, setEditListDescription] = useState('');
  const [taskMessage, setTaskMessage] = useState('');
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [inputPulsing, setInputPulsing] = useState(true);
  const [runConfetti, setRunConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const fetchTaskListAndTasks = async () => {
      try {
        if (!id) {
          setError('מזהה רשימת המשימות חסר');
          setLoading(false);
          return;
        }

        if (!user) {
          navigate('/login');
          return;
        }

        // Fetch task list details
        try {
          const listData = await taskListsApi.getTaskList(id);
          
          if (!listData) {
            setError('רשימת המשימות לא נמצאה');
            setLoading(false);
            return;
          }
          
          setTaskList(listData);
          
          // Fetch tasks for this task list
          const tasksData = await tasksApi.getTasks(id);
          setTasks(tasksData || []);
        } catch (err: any) {
          if (err.response?.status === 404) {
            setError('רשימת המשימות לא נמצאה');
          } else if (err.response?.status === 403) {
            setError('אין לך הרשאה לצפות ברשימת משימות זו');
          } else {
            throw err;
          }
        }
      } catch (err: any) {
        console.error('שגיאה בטעינת רשימת המשימות:', err);
        setError(err.response?.data?.detail || err.message || 'אירעה שגיאה בעת טעינת רשימת המשימות');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskListAndTasks();
  }, [id, navigate, user]);

  // Effect for keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+N shortcut to focus on the task input
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        const taskInput = document.getElementById('quickAddTaskInput');
        if (taskInput) {
          taskInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Stop pulsing effect after 3 seconds
    const timer = setTimeout(() => {
      setInputPulsing(false);
    }, 3000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, []);

  // Effect to update window size for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effect to turn off confetti after a delay
  useEffect(() => {
    if (runConfetti) {
      const timer = setTimeout(() => {
        setRunConfetti(false);
      }, 5000); // Run confetti for 5 seconds
      return () => clearTimeout(timer);
    }
  }, [runConfetti]);

  const handleStatusChange = async (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    try {
      await taskListsApi.updateTaskStatus(taskId, newStatus);
      
      // Update task in state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      // Trigger confetti if task is completed!
      if (newStatus === 'completed') {
        setRunConfetti(true);
      }

    } catch (error) {
      console.error('Error updating task status:', error);
      setError('אירעה שגיאה בעדכון סטטוס המשימה');
    }
  };

  const handlePriorityChange = async (taskId: string, newPriority: 'low' | 'medium' | 'high') => {
    try {
      await taskListsApi.updateTaskPriority(taskId, newPriority);
      
      // Update task in state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, priority: newPriority } : task
        )
      );
    } catch (error) {
      console.error('Error updating task priority:', error);
      setError('אירעה שגיאה בעדכון עדיפות המשימה');
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

  const translatePriorityToColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const translateStatusToColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-300 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-50 border-blue-300 text-blue-800';
      case 'completed':
        return 'bg-green-50 border-green-300 text-green-800';
      default:
        return 'bg-gray-50 border-gray-300 text-gray-800';
    }
  };

  const handleNewTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setAddTaskError('');
      
      if (!id) {
        setAddTaskError('מזהה רשימת המשימות חסר');
        return;
      }
      
      const newTaskData = {
        ...newTask,
        task_list_id: id
      };
      
      await taskListsApi.createTask(id, newTaskData);
      
      // Reset form
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending'
      });
      
      // Fetch updated tasks
      fetchTaskList();
      fetchTasks();
      
      // Show success message
      setAddTaskSuccess('המשימה נוספה בהצלחה!');
      
      // Focus the input again for quick consecutive additions
      setTimeout(() => {
        const taskInput = document.getElementById('quickAddTaskInput');
        if (taskInput) {
          taskInput.focus();
        }
      }, 100);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setAddTaskSuccess('');
        setIsAddingTask(false);
      }, 3000);
      
    } catch (error: any) {
      console.error('Error adding task:', error);
      setAddTaskError(error.message || 'אירעה שגיאה בהוספת המשימה');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק משימה זו?')) {
      return;
    }
    
    try {
      await tasksApi.deleteTask(taskId);
      
      // Remove task from state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      // Show success message
      setTaskMessage('המשימה נמחקה בהצלחה');
      
      // Clear message after a few seconds
      setTimeout(() => setTaskMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('אירעה שגיאה במחיקת המשימה');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTaskData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status
    });
  };

  const handleUpdateTask = async () => {
    if (!editingTaskId) return;
    
    try {
      await tasksApi.updateTask(editingTaskId, editTaskData);
      
      // Update task in state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === editingTaskId ? { ...task, ...editTaskData } : task
        )
      );
      
      // Reset edit state
      setEditingTaskId(null);
      setEditTaskData({});
      
      // Show success message
      setTaskMessage('המשימה עודכנה בהצלחה');
      
      // Clear message after a few seconds
      setTimeout(() => setTaskMessage(''), 3000);
    } catch (error) {
      console.error('Error updating task:', error);
      setError('אירעה שגיאה בעדכון המשימה');
    }
  };

  const handleDeleteTaskList = async () => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את רשימת המשימות הזו? כל המשימות יימחקו לצמיתות.')) {
      return;
    }

    try {
      if (!id) return;
      
      await taskListsApi.deleteTaskList(id);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('שגיאה במחיקת רשימת המשימות:', err);
      alert('שגיאה במחיקת רשימת המשימות: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleUpdateTaskList = async () => {
    if (!id || !taskList) return;
    
    try {
      await taskListsApi.updateTaskList(id, {
        title: editListTitle || taskList.title,
        description: editListDescription
      });
      
      // Update local state
      setTaskList({
        ...taskList,
        title: editListTitle || taskList.title,
        description: editListDescription
      });
      
      // Reset editing state
      setEditingTitle(false);
    } catch (err: any) {
      console.error('שגיאה בעדכון רשימת המשימות:', err);
      alert('שגיאה בעדכון רשימת המשימות: ' + (err.response?.data?.detail || err.message));
    }
  };

  const fetchTaskList = async () => {
    if (!id) return;
    
    try {
      const data = await taskListsApi.getTaskList(id);
      setTaskList(data);
    } catch (error) {
      console.error('Error fetching task list:', error);
      setError('אירעה שגיאה בטעינת רשימת המשימות');
    }
  };

  const fetchTasks = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await taskListsApi.getTasks(id);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('אירעה שגיאה בטעינת המשימות');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAllTasks = async () => {
    if (!id || tasks.length === 0) return;
    
    try {
      setLoading(true);
      
      // Show message while tasks are being updated
      setTaskMessage('מעדכן את המשימות...');
      
      // Update all tasks to completed
      const promises = tasks.map(task => {
        if (task.status !== 'completed') {
          return taskListsApi.updateTaskStatus(task.id, 'completed');
        }
        return Promise.resolve();
      });
      
      await Promise.all(promises);
      
      // Update tasks in state
      setTasks(prevTasks => 
        prevTasks.map(task => ({ ...task, status: 'completed' }))
      );
      
      // Show success message
      setTaskMessage('כל המשימות הושלמו בהצלחה!');
      
      // Clear message after a few seconds
      setTimeout(() => setTaskMessage(''), 3000);
    } catch (error) {
      console.error('Error completing all tasks:', error);
      setError('אירעה שגיאה בהשלמת כל המשימות');
    } finally {
      setLoading(false);
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
    <div className="container mx-auto px-4 py-8 relative" style={{ direction: 'rtl' }}>
      {/* Conditionally render Confetti */}
      {runConfetti && <ReactConfetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={300} />}

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-800 ml-4"
          >
            ← חזרה ללוח הבקרה
          </Link>
          {!editingTitle ? (
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">{taskList.title}</h1>
              <button 
                onClick={() => {
                  setEditingTitle(true);
                  setEditListTitle(taskList.title);
                  setEditListDescription(taskList.description || '');
                }} 
                className="ml-2 text-gray-500 hover:text-blue-600 focus:outline-none"
                title="ערוך רשימת משימות"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex-1 flex items-end">
              <div className="flex-1">
                <input
                  type="text"
                  value={editListTitle}
                  onChange={(e) => setEditListTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xl font-bold"
                  placeholder="כותרת רשימת המשימות"
                />
                <textarea
                  value={editListDescription}
                  onChange={(e) => setEditListDescription(e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="תיאור רשימת המשימות (אופציונלי)"
                  rows={2}
                />
              </div>
              <div className="flex ml-2">
                <button
                  onClick={handleUpdateTaskList}
                  className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
                >
                  שמור
                </button>
                <button
                  onClick={() => setEditingTitle(false)}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none"
                >
                  ביטול
                </button>
              </div>
            </div>
          )}
        </div>
        
        {!editingTitle && taskList.description && (
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
            
            <div className="relative">
              <button
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="text-gray-600 hover:text-gray-800 focus:outline-none p-2"
                aria-label="פעולות נוספות"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              
              {showActionsMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-48 bg-white rounded-md shadow-lg z-20"
                  style={{ direction: "rtl" }}
                >
                  <div className="py-1">
                    {tasks.length > 0 && (
                      <button
                        onClick={() => {
                          handleCompleteAllTasks();
                          setShowActionsMenu(false);
                        }}
                        className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        סמן הכל כהושלם
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsAddingTask(true);
                        setShowActionsMenu(false);
                      }}
                      className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      הוסף משימה
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteTaskList();
                        setShowActionsMenu(false);
                      }}
                      className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      מחק רשימת משימות
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
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
              
              <div className="mb-6">
                {/* Input label with keyboard shortcut info */}
                <div className="flex justify-between items-center mb-2 px-2">
                  <h3 className="font-medium text-gray-700">הוספת משימה מהירה</h3>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                    קיצור מקלדת: <kbd className="bg-white px-1 border border-gray-300 rounded shadow-sm">Alt+N</kbd>
                  </div>
                </div>

                {/* Quick add task bar */}
                <motion.div 
                  className={`bg-white rounded-full shadow-md overflow-hidden border ${inputPulsing ? 'border-blue-400' : 'border-blue-200'} flex items-center mb-2 hover:shadow-lg transition-shadow`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newTask.title.trim()) {
                        handleAddTask(e);
                      }
                    }} 
                    className="w-full flex items-center px-1"
                  >
                    <div className="flex-1 relative">
                      <input
                        id="quickAddTaskInput"
                        type="text"
                        name="title"
                        value={newTask.title}
                        onChange={handleNewTaskChange}
                        className="w-full px-4 py-3 rounded-full outline-none text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                        placeholder="הקלד שם למשימה חדשה ולחץ על הכפתור או Enter"
                        autoComplete="off"
                      />
                      {inputPulsing && (
                        <motion.span
                          className="absolute inset-0 rounded-full"
                          animate={{
                            boxShadow: ['0 0 0 0 rgba(59, 130, 246, 0)', '0 0 0 6px rgba(59, 130, 246, 0.3)', '0 0 0 0 rgba(59, 130, 246, 0)'],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "loop"
                          }}
                        />
                      )}
                    </div>
                    <motion.button
                      type="submit"
                      className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center m-1 disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={!newTask.title.trim() || loading}
                      title="הוסף משימה (Enter)"
                    >
                      {loading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </motion.button>
                  </form>
                </motion.div>

                {/* Helper text */}
                <p className="text-xs text-gray-500 px-2">לחץ Enter להוספת משימה מהירה או השתמש בתפריט הפעולות לאפשרויות נוספות</p>
              </div>
            </motion.div>
          )}
          
          {tasks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center border border-dashed border-blue-300">
              <div className="relative mx-auto w-24 h-24 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-blue-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 absolute top-6 left-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">אין משימות עדיין</h3>
              <p className="text-gray-600 mb-6">זו הזדמנות מצוינת להוסיף את המשימה הראשונה ולהתחיל לנהל את המשימות שלך!</p>
              
              <motion.button
                onClick={() => setIsAddingTask(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none inline-flex items-center shadow-md"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                הוסף משימה ראשונה
              </motion.button>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {addTaskSuccess && (
                <motion.div
                  className="bg-green-50 p-3 rounded-lg text-green-700 text-center mb-4 border border-green-200"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {addTaskSuccess}
                </motion.div>
              )}

              {tasks.map((task) => (
                <div key={task.id} className="bg-white p-4 rounded-lg shadow-md mb-4 transition-all hover:shadow-lg">
                  {editingTaskId === task.id ? (
                    // Edit mode
                    <div>
                      <div className="mb-2">
                        <input
                          type="text"
                          value={editTaskData.title || ''}
                          onChange={(e) => setEditTaskData({...editTaskData, title: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="כותרת משימה"
                        />
                      </div>
                      <div className="mb-2">
                        <textarea
                          value={editTaskData.description || ''}
                          onChange={(e) => setEditTaskData({...editTaskData, description: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="תיאור משימה (אופציונלי)"
                          rows={2}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setEditingTaskId(null)}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none mr-2"
                        >
                          ביטול
                        </button>
                        <button
                          onClick={handleUpdateTask}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
                        >
                          שמור
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center">
                          <div className="flex items-center">
                            <h3 className="text-lg font-semibold mb-1 md:mb-0 md:mr-4">{task.title}</h3>
                            <button 
                              onClick={() => handleEditTask(task)} 
                              className="ml-2 text-gray-400 hover:text-blue-600 focus:outline-none"
                              title="ערוך משימה"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                          
                          <div className="flex items-center space-x-2 mb-2 md:mb-0">
                            <div className="text-sm">
                              <select
                                value={task.priority}
                                onChange={(e) => handlePriorityChange(task.id, e.target.value as 'low' | 'medium' | 'high')}
                                className={`border px-2 py-1 rounded-md text-sm ${translatePriorityToColor(task.priority)} focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2`}
                              >
                                <option value="low">נמוכה</option>
                                <option value="medium">בינונית</option>
                                <option value="high">גבוהה</option>
                              </select>
                            </div>
                            
                            <div className="text-sm">
                              <select
                                value={task.status}
                                onChange={(e) => handleStatusChange(task.id, e.target.value as 'pending' | 'in_progress' | 'completed')}
                                className={`border px-2 py-1 rounded-md text-sm ${translateStatusToColor(task.status)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              >
                                <option value="pending">ממתין</option>
                                <option value="in_progress">בתהליך</option>
                                <option value="completed">הושלם ✅</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        
                        {task.description && (
                          <p className="text-gray-600 mt-2">{task.description}</p>
                        )}
                      </div>
                      
                      {/* Delete button */}
                      <div>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-red-500 hover:text-red-700 focus:outline-none"
                          title="מחק משימה"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Task message display */}
        <AnimatePresence>
          {taskMessage && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-white px-4 py-3 rounded-lg shadow-md flex items-center z-30 max-w-md"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )}
              <span className="text-gray-800">{taskMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Click outside handler for the actions menu */}
        {showActionsMenu && (
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setShowActionsMenu(false)}
          ></div>
        )}

        {/* Persistent quick add task bar - visible regardless of task list state */}
        <motion.div 
          className="sticky bottom-6 left-0 right-0 mx-auto max-w-lg z-20 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className={`bg-white rounded-full shadow-lg overflow-hidden border-2 ${inputPulsing ? 'border-blue-400' : 'border-blue-200'} flex items-center hover:shadow-xl transition-shadow`}>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (newTask.title.trim()) {
                  handleAddTask(e);
                }
              }} 
              className="w-full flex items-center px-1"
            >
              <div className="flex-1 relative">
                <input
                  id="quickAddTaskInput"
                  type="text"
                  name="title"
                  value={newTask.title}
                  onChange={handleNewTaskChange}
                  className="w-full px-4 py-4 rounded-full outline-none text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                  placeholder="הוסף משימה חדשה (Alt+N)"
                  autoComplete="off"
                />
                {inputPulsing && (
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    animate={{
                      boxShadow: ['0 0 0 0 rgba(59, 130, 246, 0)', '0 0 0 6px rgba(59, 130, 246, 0.3)', '0 0 0 0 rgba(59, 130, 246, 0)'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                  />
                )}
              </div>
              <motion.button
                type="submit"
                className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center m-1 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!newTask.title.trim() || loading}
                title="הוסף משימה (Enter)"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TaskListDetail;