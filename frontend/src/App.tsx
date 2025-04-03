import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import TaskList from './components/TaskList';
import ProtectedRoute from './components/ProtectedRoute';
import TaskListDetail from './components/TaskListDetail';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';

// MYA-1: Create a landing page with hero section and app description
// We'll create this page next
import LandingPage from './pages/LandingPage';

// MYA-2: Set up Supabase authentication with login and registration
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  // Apply RTL to the html element instead of a div
  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'he';
    
    return () => {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    };
  }, []);
  
  return (
    <Router>
      <Navbar />
      <main className="content-wrapper">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-task-list" element={
            <ProtectedRoute>
              <TaskList />
            </ProtectedRoute>
          } />
          <Route path="/task-list/:id" element={
            <ProtectedRoute>
              <TaskListDetail />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          {/* Additional routes will be added later */}
        </Routes>
      </main>
    </Router>
  );
}

export default App;
