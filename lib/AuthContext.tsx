import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as api from './api';
import type { User } from './api';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const { user: userData } = await api.login(email, password);
        setUser(userData);
    };

    const register = async (name: string, email: string, password: string) => {
        const { user: userData } = await api.register(name, email, password);
        setUser(userData);
    };

    const logout = () => {
        api.logout();
        setUser(null);
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
                login,
                register,
                logout,
                updateUser
            }}
        >
            {children}
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
