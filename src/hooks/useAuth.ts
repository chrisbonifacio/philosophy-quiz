import { useState, useEffect } from 'react';
import { signOut as amplifySignOut, getCurrentUser, AuthUser } from 'aws-amplify/auth';
import { isUserAdmin } from '@/src/utils/auth';

interface UseAuthReturn {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuthState();
    }, []);

    const checkAuthState = async () => {
        try {
            const user = await getCurrentUser();
            if (user) {
                setIsAuthenticated(true);
                setUser(user);
                const adminStatus = await isUserAdmin();
                setIsAdmin(adminStatus);
            } else {
                setIsAuthenticated(false);
                setUser(null);
                setIsAdmin(false);
            }
        } catch (error) {
            setIsAuthenticated(false);
            setUser(null);
            setIsAdmin(false);
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        try {
            await amplifySignOut();
            setIsAuthenticated(false);
            setUser(null);
            setIsAdmin(false);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return {
        user,
        isAuthenticated,
        isAdmin,
        isLoading,
        signOut
    };
}