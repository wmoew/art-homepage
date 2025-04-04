import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginSignup = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const endpoint = isLogin ? '/auth/login' : '/auth/signup';
        
        try {
            // Log the attempt
            console.log(`Attempting ${isLogin ? 'login' : 'signup'}`);
            
            const response = await fetch(`http://localhost:3001${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    username: username,
                    password: password,
                })
            });
            
            console.log('Response status:', response.status);
            
            const data = await response.json();
            console.log('Response data:', data);
            
            if (!response.ok) {
                throw new Error(data.message || 'Server error');
            }
            
            // Handle successful response
            if (isLogin) {
                console.log('Login successful');
                
                // Store username in localStorage as a fallback
                localStorage.setItem('username', username);
                
                // When login is successful, pass the username even if the server
                // doesn't return complete user data
                if (typeof onLoginSuccess === 'function') {
                    onLoginSuccess({
                        username: username,
                        // Include any other user data from response if available
                        ...(data.user || {})
                    });
                }
            } else {
                console.log('Signup successful');
                // Similar approach for signup
                localStorage.setItem('username', username);
                
                if (typeof onLoginSuccess === 'function') {
                    onLoginSuccess({
                        username: username,
                        ...(data.user || {})
                    });
                }
            }
            
            navigate('/');
        } catch (err) {
            console.error('Request error:', err);
            // Set a more descriptive error message based on the actual error
            if (err.message.includes('Username already exists')) {
                setError('Username already exists. Please try another username or log in.');
            } else if (err.message.includes('User not found')) {
                setError('User not found. Please check your username or sign up.');
            } else if (err.message.includes('Incorrect password')) {
                setError('Incorrect password. Please try again.');
            } else {
                setError(`Authentication failed: ${err.message || 'Could not connect to server'}`);
            }
        }
    };

    return (
        <div className="auth-container">
            <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" className="myButton">{isLogin ? 'Login' : 'Sign Up'}</button>
            </form>
            <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="myButton"
                style={{ marginTop: '10px' }}
            >
                {isLogin ? 'Switch to Sign Up' : 'Switch to Login'}
            </button>
        </div>
    );
};

// Define defaultProps outside the component
LoginSignup.defaultProps = {
    onLoginSuccess: () => {} // provide empty function as default
};

export default LoginSignup;