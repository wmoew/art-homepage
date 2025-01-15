// src/components/LoginSignup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginSignup = ({ onLoginSuccess = () => {} }) => {
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
            
            // Check if server is reachable
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
            if (typeof onLoginSuccess === 'function') {
                onLoginSuccess(data.user);  // Pass the user data to the callback
            }
            navigate('/');
        } catch (err) {
            console.error('Request error:', err);
            setError('Failed to connect to the server');
        }
    };

    LoginSignup.defaultProps = {
        onLoginSuccess: () => {} // provide empty function as default
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
                <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
            </form>
            <button onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Switch to Sign Up' : 'Switch to Login'}
            </button>
        </div>
    );
};

export default LoginSignup;