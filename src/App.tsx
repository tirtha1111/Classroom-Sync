import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './LandingPage';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import ClassroomPage from './ClassroomPage';
import SessionViewPage from './SessionViewPage';

function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: 'teacher' | 'student' }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPageWrapper />} />
          <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/classroom/:id" element={<ProtectedRoute><ClassroomPage /></ProtectedRoute>} />
          <Route path="/session/:id" element={<ProtectedRoute><SessionViewPage /></ProtectedRoute>} />
          <Route path="/previous-classes" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} /> {/* Reusing student dashboard for list view */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function LandingPageWrapper() {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (user) {
    return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} />;
  }
  
  return <LandingPage />;
}
