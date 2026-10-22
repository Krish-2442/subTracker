import { StrictMode } from 'react';  // helps developers find potential problems in their React code during development.
import { createRoot } from 'react-dom/client'; // React will place your application inside root div in index.html file. It is the entry point of the application.
import { BrowserRouter } from 'react-router-dom'; // enables browser-based routing in React applications without having to create a separate HTML file for every page.
import { Toaster } from 'react-hot-toast'; // A toast notification is a small message that appears temporarily on the screen.
import { AuthProvider } from './context/AuthContext'; // 
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode> 
        <BrowserRouter>
            <AuthProvider>
                <App />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000, // 4 second
                        style: {
                            background: '#1f2937',
                            color: '#f9fafb',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '1rem', // 1rem = 16px
                            fontSize: '0.875rem',
                        },
                        success: {
                            iconTheme: {
                                primary: '#10b981',
                                secondary: '#f9fafb',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#f9fafb',
                            },
                        },
                    }}
                />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);