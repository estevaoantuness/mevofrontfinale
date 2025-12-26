import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useUser, useClerk, useAuth as useClerkAuth } from '@clerk/clerk-react';
import * as api from './api';
import type { User } from './api';

interface AuthContextType {
    user: User | null;
    clerkUser: ReturnType<typeof useUser>['user'];
    isLoading: boolean;
    isAuthenticated: boolean;
    authTransition: boolean;
    isInitializing: boolean;
    setInitialized: () => void;
    logout: () => Promise<void>;
    updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
    const { signOut } = useClerk();
    const { getToken } = useClerkAuth();

    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authTransition, setAuthTransition] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    const setInitialized = useCallback(() => {
        setIsInitializing(false);
    }, []);

    // Sync with backend when Clerk user changes
    useEffect(() => {
        const syncUser = async () => {
            if (!clerkLoaded) return;

            if (clerkUser) {
                // Email verification status from Clerk (source of truth)
                const clerkEmailVerified = clerkUser.primaryEmailAddress?.verification?.status === 'verified';

                try {
                    // Get Clerk session token
                    const token = await getToken();
                    if (token) {
                        api.setToken(token);
                    }

                    // Try to get user from backend
                    try {
                        const userData = await api.getMe();
                        // Always use Clerk's email verification status
                        setUser({
                            ...userData,
                            emailVerified: clerkEmailVerified,
                        });
                    } catch (error) {
                        // User might not exist in backend yet (webhook delay)
                        // Create a temporary user object from Clerk data
                        console.log('User not in backend yet, using Clerk data');
                        setUser({
                            id: 0,
                            email: clerkUser.primaryEmailAddress?.emailAddress || '',
                            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
                            role: 'user',
                            emailVerified: clerkEmailVerified,
                        } as User);
                    }
                } catch (error) {
                    console.error('Error syncing user:', error);
                }
            } else {
                setUser(null);
                api.removeToken();
                setIsInitializing(false);
            }
            setIsLoading(false);
        };

        syncUser();
    }, [clerkUser, clerkLoaded, getToken]);

    const logout = async () => {
        await signOut();
        setUser(null);
        api.removeToken();
        setIsInitializing(true);
    };

    const updateUser = async (data: Partial<User>) => {
        const updatedUser = await api.updateMe(data);
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                clerkUser,
                isLoading: !clerkLoaded || isLoading,
                isAuthenticated: !!clerkUser,
                authTransition,
                isInitializing,
                setInitialized,
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
