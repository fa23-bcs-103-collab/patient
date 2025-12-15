import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, setAuthToken, clearAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is logged in on mount
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            setAuthToken(token);
            fetchCurrentUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const response = await authApi.getMe();
            setUser(response.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch user:', err);
            // Token is invalid, clear it
            localStorage.removeItem('auth_token');
            clearAuthToken();
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = useCallback(async (email, password) => {
        try {
            setError(null);
            const response = await authApi.login({ email, password });
            const { access_token } = response.data;

            // Save token
            localStorage.setItem('auth_token', access_token);
            setAuthToken(access_token);

            // Fetch user data
            await fetchCurrentUser();

            return { success: true };
        } catch (err) {
            const message = err.response?.data?.detail || 'Login failed. Please try again.';
            setError(message);
            return { success: false, error: message };
        }
    }, []);

    const register = useCallback(async (userData) => {
        try {
            setError(null);
            await authApi.register(userData);

            // Auto-login after registration
            return await login(userData.email, userData.password);
        } catch (err) {
            const message = err.response?.data?.detail || 'Registration failed. Please try again.';
            setError(message);
            return { success: false, error: message };
        }
    }, [login]);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch (err) {
            // Ignore logout errors
        } finally {
            localStorage.removeItem('auth_token');
            clearAuthToken();
            setUser(null);
        }
    }, []);

    const updateProfile = useCallback(async (updateData) => {
        try {
            setError(null);
            const response = await authApi.updateMe(updateData);
            setUser(response.data);
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.detail || 'Profile update failed.';
            setError(message);
            return { success: false, error: message };
        }
    }, []);

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        clearError: () => setError(null),
    };

    return (
        <AuthContext.Provider value={value}>
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

export default AuthContext;
