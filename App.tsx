import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { ThemeProvider } from './lib/ThemeContext';
import './lib/i18n'; // Initialize i18n
import { LandingPage } from './pages/Landing';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { CheckoutSuccess } from './pages/CheckoutSuccess';
import { VerifyEmailPage } from './pages/VerifyEmail';
import { ForgotPasswordPage } from './pages/ForgotPassword';
import { ResetPasswordPage } from './pages/ResetPassword';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050509]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public Route (redirects if logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050509]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LandingPage
            onLogin={() => navigate('/login')}
            onRegister={() => navigate('/register')}
            onDashboard={() => navigate('/dashboard')}
            onProfile={() => navigate('/dashboard?tab=profile')}
          />
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage
              onLoginSuccess={() => navigate('/dashboard')}
              onBack={() => navigate('/')}
              onGoToRegister={() => navigate('/register')}
              onGoToForgotPassword={() => navigate('/forgot-password')}
            />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage
              onBack={() => navigate('/')}
              onGoToLogin={() => navigate('/login')}
            />
          </PublicRoute>
        }
      />

      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPasswordPage
              onGoToLogin={() => navigate('/login')}
            />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage
              onRegisterSuccess={() => navigate('/dashboard')}
              onGoToLogin={() => navigate('/login')}
            />
          </PublicRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard onLogout={logout} onGoToLanding={() => navigate('/')} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/checkout/success"
        element={
          <ProtectedRoute>
            <CheckoutSuccess onGoToDashboard={() => navigate('/dashboard')} />
          </ProtectedRoute>
        }
      />

      {/* Checkout cancel - redirect to dashboard */}
      <Route path="/checkout/cancel" element={<Navigate to="/dashboard" replace />} />

      {/* Email Verification - accessible without auth */}
      <Route
        path="/verify-email"
        element={
          <VerifyEmailPage
            onGoToDashboard={() => navigate('/dashboard')}
            onGoToLogin={() => navigate('/login')}
          />
        }
      />

      {/* 404 - Redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
