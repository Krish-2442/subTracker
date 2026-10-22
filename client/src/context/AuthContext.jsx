// Before any page renders runs its initial state logic
import { createContext, useState, useEffect, useContext } from 'react'; // createContext: allows you to create a context object that can be used to share data between components without having to pass props down manually at every level. useState is a React Hook that lets you add state variables to functional components. useEffect: allows you to perform side effects in functional components. useContext means that you can use the context value in any component that is a descendant of the provider component.
import { useNavigate } from 'react-router-dom'; // useNavigate is allows us to route to different pages programmatically in React applications.
import { loginUser, registerUser, setAuthToken, clearAuthToken } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

// manages authentication state and makes that state accessible to all its descendants.
export const AuthProvider = ({ children }) => { // children is a special prop that allows you to pass components as data to other components. It is used to render the child components inside the parent component. here AuthProvider is Parent component 
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('subtracker_user');
            const savedToken = localStorage.getItem('subtracker_token');
            if (savedToken) {
                setAuthToken(savedToken); // setAuthToken is a function that sets the Authorization header for all outgoing requests and it retrieves the token from localStorage and sets it in the Authorization header for all outgoing requests. This ensures that the user remains authenticated across page reloads or when they navigate to different parts of the application.
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
        const res = await loginUser({ email, password }); // loginUser is a function that sends a POST request to the server with the user's email and password. If the login is successful, it returns the user's data and a JWT token.
        const { token, user: userData } = res.data;
        localStorage.setItem('subtracker_token', token);
        localStorage.setItem('subtracker_user', JSON.stringify(userData));
        setAuthToken(token);
        setUser(userData); // setUser is a function that updates the user state with the logged-in user's data. This allows the application to know that the user is authenticated and can access protected routes.
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
        clearAuthToken(); // removes the Authorization header from all outgoing requests. This ensures that the user is logged out and cannot access protected routes anymore.
        setUser(null);
        toast.success('Signed out successfully');
        navigate('/login', { replace: true }); // replace: true means that the current entry in the history stack will be replaced with the new one, preventing the user from navigating back to the previous page using the browser's back button.
    };

    return (
        // AuthContext.Provider is a component that provides the authentication state and functions to its descendants. It wraps the children components and makes the user, loading, login, register, and logout values accessible to them.
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext in functional components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;