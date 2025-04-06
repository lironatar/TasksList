import axios from 'axios';

// Create axios instance with base URL and common headers
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Add request interceptor to attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Make sure all API requests include the auth token
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding Authorization header to request');
    } else {
      console.log('No auth token found in localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API services
export const authApi = {
  register: async (data: { email: string; password: string; name: string; profile_icon?: string }) => {
    const response = await api.post('/api/v1/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/api/v1/auth/login', data);
    
    // Store the token in localStorage if it exists in the response
    if (response.data && response.data.session && response.data.session.access_token) {
      localStorage.setItem('authToken', response.data.session.access_token);
    }
    
    return response.data;
  },

  logout: async () => {
    // Remove token from localStorage
    localStorage.removeItem('authToken');
    const response = await api.post('/api/v1/auth/logout');
    return response.data;
  },

  verify: async (data: { email: string; code: string }) => {
    const response = await api.post('/api/v1/auth/verify', data);
    return response.data;
  },

  checkAuth: async () => {
    try {
      const response = await api.get('/api/v1/auth/me');
      return response.data;
    } catch (error) {
      console.log('Auth check failed:', error);
      return null;
    }
  },
  
  updateProfileIcon: async (profileIcon: string) => {
    const response = await api.put('/api/v1/users/profile-icon', { profile_icon: profileIcon });
    return response.data;
  }
};

// Task Lists API services
export const taskListsApi = {
  getTaskLists: async () => {
    const response = await api.get('/api/v1/task-lists');
    return response.data;
  },

  getTaskList: async (id: string) => {
    const response = await api.get(`/api/v1/task-lists/${id}`);
    return response.data;
  },

  createTaskList: async (data: { title: string; description?: string; tasks?: any[] }) => {
    console.log('createTaskList called with data:', JSON.stringify(data));
    try {
      const token = localStorage.getItem('authToken');
      console.log('Auth token available:', !!token);
      
      // Create a copy of the data with proper defaults
      const requestData = {
        title: data.title,
        description: data.description || '',
        tasks: data.tasks || []
      };
      
      // Send the request with proper content type
      const response = await api.post('/api/v1/task-lists', requestData);
      console.log('createTaskList response:', response.status, response.statusText);
      return response.data;
    } catch (error: any) {
      console.error('createTaskList error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  updateTaskList: async (id: string, data: { title?: string; description?: string }) => {
    const response = await api.put(`/api/v1/task-lists/${id}`, data);
    return response.data;
  },

  deleteTaskList: async (id: string) => {
    const response = await api.delete(`/api/v1/task-lists/${id}`);
    return response.data;
  },
  
  // Get tasks for a specific task list
  getTasks: async (listId: string) => {
    const response = await api.get(`/api/v1/task-lists/${listId}/tasks`);
    return response.data;
  },

  // Create a new task in a task list
  createTask: async (listId: string, data: { title: string; description?: string; priority?: string; status?: string; due_date?: string }) => {
    const response = await api.post(`/api/v1/task-lists/${listId}/tasks`, data);
    return response.data;
  },
  
  // Update a task's status
  updateTaskStatus: async (taskId: string, status: string) => {
    const response = await api.put(`/api/v1/tasks/${taskId}`, { status });
    return response.data;
  },
  
  // Update a task's priority
  updateTaskPriority: async (taskId: string, priority: string) => {
    const response = await api.put(`/api/v1/tasks/${taskId}`, { priority });
    return response.data;
  }
};

// Tasks API services
export const tasksApi = {
  getTasks: async (listId: string) => {
    const response = await api.get(`/api/v1/task-lists/${listId}/tasks`);
    return response.data;
  },

  createTask: async (listId: string, data: { title: string; description?: string; priority?: string; due_date?: string }) => {
    const response = await api.post(`/api/v1/task-lists/${listId}/tasks`, data);
    return response.data;
  },

  updateTask: async (id: string, data: { title?: string; description?: string; priority?: string; status?: string; due_date?: string }) => {
    const response = await api.put(`/api/v1/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async (id: string) => {
    const response = await api.delete(`/api/v1/tasks/${id}`);
    return response.data;
  },
};

export default api; 