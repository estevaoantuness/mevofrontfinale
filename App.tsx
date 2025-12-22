import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { LandingPage } from './pages/Landing';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { ForgotPasswordPage } from './pages/ForgotPassword';
import { ResetPasswordPage } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { CheckoutSuccess } from './pages/CheckoutSuccess';

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

// Reset Password Wrapper to extract token from URL
function ResetPasswordWrapper() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  return (
    <ResetPasswordPage
      token={token}
      onGoToLogin={() => navigate('/forgot-password')}
      onBack={() => navigate('/')}
    />
  );
}

function AppRoutes() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<LandingPage onLogin={() => navigate('/login')} onRegister={() => navigate('/register')} onDashboard={() => navigate('/dashboard')} />} />

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
            <ResetPasswordWrapper />
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

      {/* 404 - Redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
