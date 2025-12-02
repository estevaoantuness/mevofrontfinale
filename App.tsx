import React, { useState } from 'react';
import { LandingPage } from './pages/Landing';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { isAuthenticated, logout } from './lib/api';

type Page = 'landing' | 'login' | 'register' | 'dashboard';

export default function App() {
  // Check if user is already authenticated
  const [page, setPage] = useState<Page>(isAuthenticated() ? 'dashboard' : 'landing');

  const handleLoginSuccess = () => {
    setPage('dashboard');
  };

  const handleRegisterSuccess = () => {
    setPage('dashboard');
  };

  const handleLogout = () => {
    logout();
    setPage('landing');
  };

  const handleGoToLogin = () => {
    setPage('login');
  };

  const handleGoToRegister = () => {
    setPage('register');
  };

  const handleBackToLanding = () => {
    setPage('landing');
  };

  return (
    <>
      {page === 'landing' && <LandingPage onLogin={handleGoToLogin} onRegister={handleGoToRegister} />}
      {page === 'login' && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onBack={handleBackToLanding}
          onGoToRegister={handleGoToRegister}
        />
      )}
      {page === 'register' && (
        <RegisterPage
          onRegisterSuccess={handleRegisterSuccess}
          onGoToLogin={handleGoToLogin}
        />
      )}
      {page === 'dashboard' && <Dashboard onLogout={handleLogout} onGoToLanding={handleBackToLanding} />}
    </>
  );
}
