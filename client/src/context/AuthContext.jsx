import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, setAuthToken, clearAuthToken } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('subtracker_user');
            const savedToken = localStorage.getItem('subtracker_token');
            if (savedToken) {
                setAuthToken(savedToken);
            }
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });
    const [loading] = useState(false);
    const navigate = useNavigate();

    // Set auth token header from localStorage on startup
    useEffect(() => {
        const token = localStorage.getItem('subtracker_token');
        if (token) {
            setAuthToken(token);
        }
    }, []);

    // Regular async function for login
    const login = async (email, password) => {
        const res = await loginUser({ email, password });
        const { token, user: userData } = res.data;
        localStorage.setItem('subtracker_token', token);
        localStorage.setItem('subtracker_user', JSON.stringify(userData));
        setAuthToken(token);
        setUser(userData);
        toast.success(`Welcome back, ${userData.name}!`);
        return userData;
    };

    // Regular async function for register
    const register = async (name, email, password) => {
        const res = await registerUser({ name, email, password });
        const { token, user: userData } = res.data;
        localStorage.setItem('subtracker_token', token);
        localStorage.setItem('subtracker_user', JSON.stringify(userData));
        setAuthToken(token);
        setUser(userData);
        toast.success(`Welcome, ${userData.name}!`);
        return userData;
    };

    // Regular function for logout
    const logout = () => {
        localStorage.removeItem('subtracker_token');
        localStorage.removeItem('subtracker_user');
        clearAuthToken();
        setUser(null);
        toast.success('Signed out successfully');
        navigate('/login', { replace: true });
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
