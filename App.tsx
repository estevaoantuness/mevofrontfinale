import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, useUser, useClerk } from '@clerk/clerk-react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { ThemeProvider } from './lib/ThemeContext';
import './lib/i18n'; // Initialize i18n
import { LandingPage } from './pages/Landing';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { CheckoutSuccess } from './pages/CheckoutSuccess';
import { ToastProvider } from './components/ui/ToastContext';
import { AuthTransition } from './components/AuthTransition';
import { AppLoader } from './components/AppLoader';

// Protected Route Component - uses Clerk with transition
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();
  const [showTransition, setShowTransition] = useState(false);
  const [transitionComplete, setTransitionComplete] = useState(false);

  useEffect(() => {
    // Show transition only once per session when user first accesses protected route
    if (isLoaded && isSignedIn && !transitionComplete) {
      const hasSeenTransition = sessionStorage.getItem('mevo_auth_transition_shown');
      if (!hasSeenTransition) {
        setShowTransition(true);
        sessionStorage.setItem('mevo_auth_transition_shown', 'true');
      } else {
        setTransitionComplete(true);
      }
    }
  }, [isLoaded, isSignedIn, transitionComplete]);

  const handleTransitionComplete = useCallback(() => {
    setShowTransition(false);
    setTransitionComplete(true);
  }, []);

  if (showTransition) {
    return <AuthTransition onComplete={handleTransitionComplete} />;
  }

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

// App wrapper that shows loader while Clerk initializes
function AppWithLoader({ children }: { children: React.ReactNode }) {
  const { loaded } = useClerk();
  const { isLoading } = useAuth();

  // Show loader while Clerk or Auth is initializing
  if (!loaded || isLoading) {
    return <AppLoader />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    sessionStorage.removeItem('mevo_auth_transition_shown');
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
            onLogout={handleLogout}
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
            <AppWithLoader>
              <AppRoutes />
            </AppWithLoader>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
