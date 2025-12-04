import { createContext, useState, useEffect } from 'react';
import { axiosPublic } from '../api/axios';
import axiosPrivate from '../api/axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user is already logged in on app load
    useEffect(() => {
        const checkAuth = async () => {
            const token = sessionStorage.getItem('accessToken');
            
            if (token) {
                try {
                    const response = await axiosPrivate.get('/auth/me');
                    setUser(response.data.data);
                    setIsAuthenticated(true);
                } catch {
                    // Token invalid, try to refresh
                    try {
                        const refreshResponse = await axiosPublic.get('/auth/token', {
                            withCredentials: true
                        });
                        sessionStorage.setItem('accessToken', refreshResponse.data.accessToken);
                        
                        // Retry get user info
                        const userResponse = await axiosPrivate.get('/auth/me');
                        setUser(userResponse.data.data);
                        setIsAuthenticated(true);
                    } catch {
                        // Refresh failed, clear everything
                        sessionStorage.removeItem('accessToken');
                        setUser(null);
                        setIsAuthenticated(false);
                    }
                }
            }
            
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    // Login function
    const login = async (email, password) => {
        try {
            const response = await axiosPublic.post('/auth/login', 
                { email, password },
                { withCredentials: true }
            );
            
            const { accessToken, user: userData } = response.data.data;
            
            sessionStorage.setItem('accessToken', accessToken);
            setUser(userData);
            setIsAuthenticated(true);
            
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await axiosPrivate.delete('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            sessionStorage.removeItem('accessToken');
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
