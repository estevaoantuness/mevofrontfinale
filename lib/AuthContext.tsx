import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as api from './api';
import type { User } from './api';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    authTransition: boolean;
    isInitializing: boolean;
    setInitialized: () => void;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authTransition, setAuthTransition] = useState(false);
    // Track if the app is still initializing (auth check + initial data load)
    const [isInitializing, setIsInitializing] = useState(true);

    // Called by Dashboard when initial data is loaded
    const setInitialized = useCallback(() => {
        setIsInitializing(false);
    }, []);

    // Check if user is already logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            if (api.isAuthenticated()) {
                try {
                    const userData = await api.getMe();
                    setUser(userData);
                } catch (error) {
                    // Token expired or invalid
                    api.logout();
                    setIsInitializing(false);
                }
            } else {
                // Not authenticated, no need to wait for dashboard
                setIsInitializing(false);
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const { user: userData } = await api.login(email, password);
        setUser(userData);
        setIsInitializing(true); // Reset so dashboard loading shows
        setAuthTransition(true);
        setTimeout(() => setAuthTransition(false), 2000);
    };

    const register = async (name: string, email: string, password: string) => {
        const { user: userData } = await api.register(name, email, password);
        setUser(userData);
        setIsInitializing(true); // Reset so dashboard loading shows
        setAuthTransition(true);
        setTimeout(() => setAuthTransition(false), 2000);
    };

    const logout = () => {
        api.logout();
        setUser(null);
        setIsInitializing(true); // Reset for next login
    };

    const updateUser = async (data: Partial<User>) => {
        const updatedUser = await api.updateMe(data);
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                authTransition,
                isInitializing,
                setInitialized,
                login,
                register,
                logout,
                updateUser
            }}
        >
            {children}
            <LoadingOverlay
                isVisible={authTransition}
                title="Entrando na sua conta"
                subtitle="Sincronizando suas preferencias..."
            />
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
