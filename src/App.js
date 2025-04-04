import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginSignup from './components/loginSignup';
import ArtDisplay from './components/artDisplay';

function App() {
    const [user, setUser] = useState(null);
    
    // For debugging only
    useEffect(() => {
        console.log('App rendered, current user state:', user);
    }, [user]);
    
    //check auth status on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                console.log('App: Checking authentication status...');
                const response = await fetch('http://localhost:3001/auth/check', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    },
                    credentials: 'include'
                });

                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    console.log('App: Auth check response:', data);
                    
                    if (data.authenticated) {
                        console.log('App: User is authenticated, setting user state');
                        setUser({
                            username: data.username || 'User',
                            userId: data.userId
                        });
                    }
                }
            } catch (error) {
                console.error('App: Error checking auth status:', error);
            }
        };
        
        // Also check localStorage as a fallback
        const checkLocalStorage = () => {
            const savedUsername = localStorage.getItem('username');
            if (savedUsername && !user) {
                console.log('App: Found username in localStorage:', savedUsername);
                setUser({
                    username: savedUsername,
                    userId: 'unknown' // We don't have the ID from localStorage
                });
            }
        };
        
        checkAuth();
        checkLocalStorage();
    }, [user]);

    const handleLoginSuccess = (userData) => {
        console.log('App: Login success handler called with:', userData);
        setUser(userData);
    };

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginSignup onLoginSuccess={handleLoginSuccess} />} />
                <Route path="/auth" element={<LoginSignup onLoginSuccess={handleLoginSuccess} />} />
                <Route path="/" element={<ArtDisplay user={user} />} />
                <Route path="*" element={<ArtDisplay user={user} />} />
            </Routes>
        </Router>
    );
}

export default App;