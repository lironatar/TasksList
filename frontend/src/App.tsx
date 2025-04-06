import React, { useEffect, useState, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authApi } from './utils/api';
import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TaskListDetail from './components/TaskListDetail';
import TaskList from './components/TaskList';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';

// Define AuthContext interface
interface AuthContextType {
  user: {
    id: string;
    email: string;
    name: string;
    first_name?: string;
    profile_icon?: string;
  } | null;
  loading: boolean;
  login: (data: { email: string; password: string }) => Promise<any>;
  logout: () => Promise<void>;
  register: (data: { email: string; password: string; name: string; profile_icon?: string }) => Promise<any>;
  updateProfileIcon: (profileIcon: string) => Promise<void>;
}

// Create AuthContext
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({}),
  logout: async () => {},
  register: async () => ({}),
  updateProfileIcon: async () => {}
});

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">טוען...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set RTL for the entire app
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'he';
    
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        console.log("Checking authentication...");
        const userData = await authApi.checkAuth();
        console.log("Auth check result:", userData);
        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        // If auth check fails, clear the token
        localStorage.removeItem('authToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Check if there's a token in localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      console.log("Token found in localStorage, checking validity...");
      checkAuth();
    } else {
      console.log("No token found in localStorage");
      setLoading(false);
    }

    return () => {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    };
  }, []);

  const authContextValue: AuthContextType = {
    user,
    loading,
    login: async (data: { email: string; password: string }) => {
      try {
        const response = await authApi.login(data);
        if (response && response.user) {
          setUser(response.user);
        }
        return response;
      } catch (error: any) {
        throw error;
      }
    },
    logout: async () => {
      try {
        await authApi.logout();
        setUser(null);
      } catch (error) {
        console.error('Error logging out:', error);
      }
    },
    register: async (data: { email: string; password: string; name: string; profile_icon?: string }) => {
      try {
        const response = await authApi.register(data);
        return response;
      } catch (error: any) {
        throw error;
      }
    },
    updateProfileIcon: async (profileIcon: string) => {
      try {
        await authApi.updateProfileIcon(profileIcon);
        if (user) {
          setUser({ ...user, profile_icon: profileIcon });
        }
      } catch (error) {
        console.error('Error updating profile icon:', error);
        throw error;
      }
    }
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <div className="App" style={{backgroundColor: '#f0f4f8', minHeight: '100vh'}}>
        <Router>
          <main className="content-wrapper">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/task-list/:id" 
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <TaskListDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/task-list" 
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <TaskList />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </Router>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
