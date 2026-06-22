import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import FindSlot from './pages/FindSlot';
import Pricing from './pages/Pricing';
import Guide from './pages/Guide';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import StaffDashboard from './pages/StaffDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-400">
        Đang tải...
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="find-slot" element={<FindSlot />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="guide" element={<Guide />} />
            <Route path="contact" element={<Contact />} />
            <Route path="profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="staff" element={
              <ProtectedRoute allowedRoles={['Staff', 'Admin']}>
                <StaffDashboard />
              </ProtectedRoute>
            } />
            <Route path="manager" element={
              <ProtectedRoute allowedRoles={['Manager', 'Admin']}>
                <ManagerDashboard />
              </ProtectedRoute>
            } />
            <Route path="admin" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
