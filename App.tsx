import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, useClerk } from '@clerk/clerk-react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { ThemeProvider } from './lib/ThemeContext';
import './lib/i18n'; // Initialize i18n
import { LandingPage } from './pages/Landing';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { CheckoutSuccess } from './pages/CheckoutSuccess';
import { ToastProvider } from './components/ui/ToastContext';

// Protected Route Component - uses Clerk
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

// Public Route (redirects if logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>
        <Navigate to="/dashboard" replace />
      </SignedIn>
      <SignedOut>{children}</SignedOut>
    </>
  );
}

function AppRoutes() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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

      {/* Clerk handles login at /login */}
      <Route
        path="/login/*"
        element={
          <PublicRoute>
            <LoginPage onBack={() => navigate('/')} />
          </PublicRoute>
        }
      />

      {/* Clerk handles register at /register */}
      <Route
        path="/register/*"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard onLogout={handleLogout} onGoToLanding={() => navigate('/')} />
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
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
